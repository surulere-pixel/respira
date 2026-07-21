// functions/api/admin/radio-albums.js
// Token-gated album management for respira radio (no-code admin panel).
// Requires env: ADMIN_TOKEN, DB (D1), MEDIA (R2).
//   GET    /api/admin/radio-albums                → list all albums + their tracks
//   POST   /api/admin/radio-albums   (multipart)   → create/update an album (name, description, status, cover file)
//   DELETE /api/admin/radio-albums?id=<id>         → delete an album, its tracks, and their R2 objects

function json(d, s) {
  return new Response(JSON.stringify(d), { status: s || 200, headers: { 'Content-Type': 'application/json' } });
}

function authed(request, env) {
  const t = env.ADMIN_TOKEN;
  if (!t) return null;
  const url = new URL(request.url);
  const hdr = request.headers.get('x-admin-token') || (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  const given = hdr || url.searchParams.get('token') || '';
  if (!given || given.length !== t.length) return false;
  let diff = 0;
  for (let i = 0; i < t.length; i++) diff |= given.charCodeAt(i) ^ t.charCodeAt(i);
  return diff === 0;
}

function gate(request, env) {
  if (!env.DB || !env.MEDIA) return json({ error: 'not_configured' }, 503);
  const ok = authed(request, env);
  if (ok === null) return json({ error: 'not_configured' }, 503);
  if (!ok) return json({ error: 'unauthorized' }, 401);
  return null;
}

function slugify(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

const EXT_FROM_TYPE = {
  'image/jpeg': 'jpg', 'image/jpg': 'jpg', 'image/png': 'png', 'image/webp': 'webp',
};

export async function onRequestGet(context) {
  const { request, env } = context;
  const g = gate(request, env); if (g) return g;

  let albums, tracks;
  try {
    albums = (await env.DB.prepare('SELECT * FROM radio_albums ORDER BY sort_order ASC, created_at ASC').all()).results || [];
    tracks = (await env.DB.prepare('SELECT * FROM radio_tracks ORDER BY sort_order ASC, created_at ASC').all()).results || [];
  } catch (e) {
    return json({ error: 'query_failed' }, 500);
  }

  const byAlbum = {};
  for (const t of tracks) { (byAlbum[t.album_id] = byAlbum[t.album_id] || []).push(t); }
  const out = albums.map(a => ({ ...a, tracks: byAlbum[a.id] || [] }));

  return json({ count: out.length, albums: out });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const g = gate(request, env); if (g) return g;

  let form;
  try { form = await request.formData(); } catch (e) { return json({ error: 'bad_request' }, 400); }

  const existingId = (form.get('id') || '').toString().trim();
  const name = (form.get('name') || '').toString().trim();
  const description = (form.get('description') || '').toString().trim();
  const status = (form.get('status') || 'coming_soon').toString().trim();
  const cover = form.get('cover');

  if (!name) return json({ error: 'missing_name' }, 400);
  if (['coming_soon', 'live'].indexOf(status) < 0) return json({ error: 'bad_status' }, 400);

  const id = existingId || slugify(name);
  if (!id) return json({ error: 'bad_id' }, 400);

  let coverKey = null;
  if (cover && typeof cover === 'object' && cover.size > 0) {
    const ext = EXT_FROM_TYPE[cover.type] || 'jpg';
    coverKey = 'covers/' + id + '-' + Date.now() + '.' + ext;
    try {
      await env.MEDIA.put(coverKey, await cover.arrayBuffer(), { httpMetadata: { contentType: cover.type || 'image/jpeg' } });
    } catch (e) {
      return json({ error: 'cover_upload_failed' }, 500);
    }
  }

  try {
    const existing = await env.DB.prepare('SELECT id, cover_key FROM radio_albums WHERE id = ?').bind(id).first();
    if (existing) {
      if (coverKey) {
        await env.DB.prepare('UPDATE radio_albums SET name=?, description=?, status=?, cover_key=? WHERE id=?')
          .bind(name, description, status, coverKey, id).run();
        if (existing.cover_key) { try { await env.MEDIA.delete(existing.cover_key); } catch (e) {} }
      } else {
        await env.DB.prepare('UPDATE radio_albums SET name=?, description=?, status=? WHERE id=?')
          .bind(name, description, status, id).run();
      }
    } else {
      const maxRow = await env.DB.prepare('SELECT MAX(sort_order) as m FROM radio_albums').first();
      const nextOrder = ((maxRow && maxRow.m) || 0) + 1;
      await env.DB.prepare('INSERT INTO radio_albums (id, name, description, status, cover_key, sort_order) VALUES (?,?,?,?,?,?)')
        .bind(id, name, description, status, coverKey, nextOrder).run();
    }
  } catch (e) {
    return json({ error: 'save_failed' }, 500);
  }

  return json({ ok: true, id });
}

export async function onRequestDelete(context) {
  const { request, env } = context;
  const g = gate(request, env); if (g) return g;

  const id = new URL(request.url).searchParams.get('id') || '';
  if (!id) return json({ error: 'missing_id' }, 400);

  try {
    const album = await env.DB.prepare('SELECT cover_key FROM radio_albums WHERE id = ?').bind(id).first();
    if (!album) return json({ error: 'not_found' }, 404);

    const trackRows = (await env.DB.prepare('SELECT audio_key FROM radio_tracks WHERE album_id = ?').bind(id).all()).results || [];
    await env.DB.prepare('DELETE FROM radio_tracks WHERE album_id = ?').bind(id).run();
    await env.DB.prepare('DELETE FROM radio_albums WHERE id = ?').bind(id).run();

    if (album.cover_key) { try { await env.MEDIA.delete(album.cover_key); } catch (e) {} }
    for (const t of trackRows) { if (t.audio_key) { try { await env.MEDIA.delete(t.audio_key); } catch (e) {} } }
  } catch (e) {
    return json({ error: 'delete_failed' }, 500);
  }

  return json({ ok: true, id });
}
