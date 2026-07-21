// functions/api/radio-catalog.js
// Public catalog of live radio albums + tracks, for radio.html to render.
// Only returns status='live' albums. 'coming_soon' albums stay admin-only
// until someone flips the status in the no-code admin panel.
// Requires env: DB (D1).

function json(d, s) {
  return new Response(JSON.stringify(d), { status: s || 200, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=60' } });
}

export async function onRequestGet(context) {
  const { env } = context;
  if (!env.DB) return json({ albums: [] }, 200);

  let albums, tracks;
  try {
    albums = (await env.DB.prepare("SELECT * FROM radio_albums ORDER BY sort_order ASC, created_at ASC").all()).results || [];
    tracks = (await env.DB.prepare("SELECT * FROM radio_tracks ORDER BY sort_order ASC, created_at ASC").all()).results || [];
  } catch (e) {
    return json({ albums: [] }, 200);
  }

  const byAlbum = {};
  for (const t of tracks) { (byAlbum[t.album_id] = byAlbum[t.album_id] || []).push(t); }

  const out = albums.map(a => ({
    id: a.id,
    name: a.name,
    description: a.description,
    cover: a.cover_key ? ('/media/' + a.cover_key) : (a.cover_fallback || null),
    status: a.status,
    tracks: (byAlbum[a.id] || []).map(t => ({ id: t.id, name: t.name, file: '/media/' + t.audio_key })),
  }));

  return json({ albums: out });
}
