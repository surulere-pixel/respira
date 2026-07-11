// functions/api/room-status.js
// Look up a branded-room request's status by id + email (no account needed).
// GET /api/room-status?id=ROOM-XXXX&email=you@example.com
// Requires D1 binding DB. Returns 404 on any mismatch (doesn't reveal whether an id exists).

function json(data, status) {
  return new Response(JSON.stringify(data), { status: status || 200, headers: { 'Content-Type': 'application/json' } });
}

export async function onRequestGet(context) {
  const { request, env } = context;
  if (!env.DB) return json({ error: 'not_configured' }, 503);

  const url = new URL(request.url);
  const id = (url.searchParams.get('id') || '').trim().toUpperCase();
  const email = (url.searchParams.get('email') || '').trim().toLowerCase();
  if (!id || !email || email.indexOf('@') < 1) return json({ error: 'missing_params' }, 400);

  let row;
  try {
    row = await env.DB
      .prepare('SELECT id, practice_name, requested_domain, status, created_at FROM room_requests WHERE id = ? AND lower(email) = ?')
      .bind(id, email)
      .first();
  } catch (e) {
    return json({ error: 'lookup_failed' }, 500);
  }
  if (!row) return json({ error: 'not_found' }, 404);

  return json({
    id: row.id,
    practice_name: row.practice_name,
    requested_domain: row.requested_domain,
    status: row.status,
    created_at: row.created_at,
  });
}
