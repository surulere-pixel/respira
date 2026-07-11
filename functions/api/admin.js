// functions/api/admin.js
// Internal admin for room requests + submissions (§21). Token-gated.
// Requires env: ADMIN_TOKEN (set in the Pages dashboard) and D1 binding DB.
//   GET  /api/admin?resource=rooms|open_floor|directory   → list rows + allowed statuses
//   POST /api/admin  {resource, id, status}               → advance a row's status
// Auth via header `x-admin-token: <token>` (or `?token=` for GET convenience).

const RES = {
  rooms: {
    table: 'room_requests',
    statuses: ['submitted', 'reviewing assets', 'building', 'preview ready', 'changes requested', 'approved', 'preparing launch', 'live', 'archived'],
  },
  open_floor: {
    table: 'open_floor_submissions',
    statuses: ['submitted', 'reviewing', 'accepted', 'declined', 'published'],
  },
  directory: {
    table: 'directory_submissions',
    statuses: ['submitted', 'reviewing', 'listed', 'declined'],
  },
};

function json(d, s) {
  return new Response(JSON.stringify(d), { status: s || 200, headers: { 'Content-Type': 'application/json' } });
}

// returns true | false | null(not configured)
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
  if (!env.DB) return json({ error: 'not_configured' }, 503);
  const ok = authed(request, env);
  if (ok === null) return json({ error: 'not_configured' }, 503);
  if (!ok) return json({ error: 'unauthorized' }, 401);
  return null;
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const g = gate(request, env); if (g) return g;

  const resource = new URL(request.url).searchParams.get('resource') || 'rooms';
  const r = RES[resource];
  if (!r) return json({ error: 'bad_resource' }, 400);

  let rows;
  try {
    const q = await env.DB.prepare('SELECT * FROM ' + r.table + ' ORDER BY created_at DESC LIMIT 200').all();
    rows = (q && q.results) || [];
  } catch (e) {
    return json({ error: 'query_failed' }, 500);
  }
  return json({ resource, statuses: r.statuses, count: rows.length, rows });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const g = gate(request, env); if (g) return g;

  let body;
  try { body = await request.json(); } catch (e) { return json({ error: 'bad_request' }, 400); }

  const r = RES[body && body.resource];
  if (!r) return json({ error: 'bad_resource' }, 400);
  const id = (body.id || '').trim();
  const status = (body.status || '').trim();
  if (!id) return json({ error: 'missing_id' }, 400);
  if (r.statuses.indexOf(status) < 0) return json({ error: 'bad_status' }, 400);

  try {
    const res = await env.DB.prepare('UPDATE ' + r.table + ' SET status = ? WHERE id = ?').bind(status, id).run();
    if (!res.meta || res.meta.changes === 0) return json({ error: 'not_found' }, 404);
  } catch (e) {
    return json({ error: 'update_failed' }, 500);
  }
  return json({ ok: true, id, status });
}
