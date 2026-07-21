// functions/api/admin/radio-tracks.js
// Token-gated track upload for respira radio albums.
// Requires env: ADMIN_TOKEN, DB (D1), MEDIA (R2).
//   POST   /api/admin/radio-tracks   (multipart: album_id, name, audio file) → add a track
//   DELETE /api/admin/radio-tracks?id=<id>                                  → remove a track

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

export async function onRequestPost(context) {
  const { request, env } = context;
  const g = gate(request, env); if (g) return g;

  let form;
  try { form = await request.formData(); } catch (e) { return json({ error: 'bad_request' }, 400); }

  const albumId = (form.get('album_id') || '').toString().trim();
  const name = (form.get('name') || '').toString().trim();
  const audio = form.get('audio');

  if (!albumId) return json({ error: 'missing_album_id' }, 400);
  if (!name) return json({ error: 'missing_name' }, 400);
  if (!audio || typeof audio !== 'object' || !audio.size) return json({ error: 'missing_audio' }, 400);

  let album;
  try { album = await env.DB.prepare('SELECT id FROM radio_albums WHERE id = ?').bind(albumId).first(); }
  catch (e) { return json({ error: 'query_failed' }, 500); }
  if (!album) return json({ error: 'album_not_found' }, 404);

  const baseSlug = slugify(name) || 'track';
  const id = albumId + '--' + baseSlug + '-' + Date.now().toString(36);
  const audioKey = 'tracks/' + albumId + '/' + id + '.mp3';

  try {
    await env.MEDIA.put(audioKey, await audio.arrayBuffer(), { httpMetadata: { contentType: audio.type || 'audio/mpeg' } });
  } catch (e) {
    return json({ error: 'audio_upload_failed' }, 500);
  }

  try {
    const maxRow = await env.DB.prepare('SELECT MAX(sort_order) as m FROM radio_tracks WHERE album_id = ?').bind(albumId).first();
    const nextOrder = ((maxRow && maxRow.m) || 0) + 1;
    await env.DB.prepare('INSERT INTO radio_tracks (id, album_id, name, audio_key, sort_order) VALUES (?,?,?,?,?)')
      .bind(id, albumId, name, audioKey, nextOrder).run();
  } catch (e) {
    try { await env.MEDIA.delete(audioKey); } catch (e2) {}
    return json({ error: 'save_failed' }, 500);
  }

  return json({ ok: true, id, audio_key: audioKey });
}

export async function onRequestDelete(context) {
  const { request, env } = context;
  const g = gate(request, env); if (g) return g;

  const id = new URL(request.url).searchParams.get('id') || '';
  if (!id) return json({ error: 'missing_id' }, 400);

  try {
    const track = await env.DB.prepare('SELECT audio_key FROM radio_tracks WHERE id = ?').bind(id).first();
    if (!track) return json({ error: 'not_found' }, 404);
    await env.DB.prepare('DELETE FROM radio_tracks WHERE id = ?').bind(id).run();
    if (track.audio_key) { try { await env.MEDIA.delete(track.audio_key); } catch (e) {} }
  } catch (e) {
    return json({ error: 'delete_failed' }, 500);
  }

  return json({ ok: true, id });
}
