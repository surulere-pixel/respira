// functions/api/room.js
// Respira Studio branded-room request → saves a real record to D1, returns a request ID,
// fires an internal notification. Replaces the old "we'll be in touch" (no-capture) flow.
// Confirms only after the row is written.
//
// Requires a D1 binding named DB. Optional: FORMSPREE_ID env var.

const FORMSPREE = 'mykqjrjw';

function json(data, status) {
  return new Response(JSON.stringify(data), { status: status || 200, headers: { 'Content-Type': 'application/json' } });
}
function clean(v, max) {
  return (typeof v === 'string') ? v.trim().slice(0, max || 500) : '';
}
function newId() {
  return 'ROOM-' + crypto.randomUUID().split('-')[0].toUpperCase();
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.DB) return json({ error: 'not_configured' }, 503);

  let body;
  try { body = await request.json(); } catch (e) { return json({ error: 'bad_request' }, 400); }

  const practice_name = clean(body.practice_name, 160);
  const email = clean(body.email, 200);

  const errors = {};
  if (!practice_name) errors.practice_name = 'required';
  if (!email || email.indexOf('@') < 1) errors.email = 'valid email required';
  if (Object.keys(errors).length) return json({ error: 'validation', fields: errors }, 400);

  // config is the feature selection object from the blueprint; store as JSON text (bounded)
  let config = '';
  try { config = JSON.stringify(body.config || {}).slice(0, 4000); } catch (e) { config = '{}'; }

  const id = newId();
  const now = new Date().toISOString();

  try {
    await env.DB.prepare(
      `INSERT INTO room_requests
       (id, created_at, practice_name, contact_name, email, phone, city, country, practice_type, requested_domain, config, status)
       VALUES (?,?,?,?,?,?,?,?,?,?,?, 'submitted')`
    ).bind(
      id, now, practice_name,
      clean(body.contact_name, 120), email, clean(body.phone, 60),
      clean(body.city, 80), clean(body.country, 80), clean(body.practice_type, 60),
      clean(body.requested_domain, 200), config
    ).run();
  } catch (e) {
    return json({ error: 'save_failed' }, 500);
  }

  const fid = env.FORMSPREE_ID || FORMSPREE;
  try {
    context.waitUntil(fetch('https://formspree.io/f/' + fid, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        event: 'room_request', request_id: id, practice_name, email,
        city: clean(body.city, 80), requested_domain: clean(body.requested_domain, 200),
        _subject: 'respira studio room request: ' + practice_name + ' (' + id + ')'
      })
    }).catch(function () {}));
  } catch (e) { /* ignore */ }

  return json({ id, status: 'submitted' });
}
