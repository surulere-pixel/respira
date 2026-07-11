// functions/api/directory.js
// Respira 100 directory intake ("submit a practice") → saves a real record to D1,
// returns a submission ID, fires an internal notification. Confirms only after the row is written.
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
  return 'DIR-' + crypto.randomUUID().split('-')[0].toUpperCase();
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.DB) return json({ error: 'not_configured' }, 503);

  let body;
  try { body = await request.json(); } catch (e) { return json({ error: 'bad_request' }, 400); }

  const name = clean(body.name, 160);
  const email = clean(body.email, 200);

  const errors = {};
  if (!name) errors.name = 'required';
  if (!email || email.indexOf('@') < 1) errors.email = 'valid email required';
  if (!clean(body.city, 80)) errors.city = 'required';
  if (Object.keys(errors).length) return json({ error: 'validation', fields: errors }, 400);

  const id = newId();
  const now = new Date().toISOString();

  try {
    await env.DB.prepare(
      `INSERT INTO directory_submissions
       (id, created_at, name, contact_name, email, phone, city, country, practice_type, ownership, website, booking_url, description, virtual, status)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?, 'submitted')`
    ).bind(
      id, now, name,
      clean(body.contact_name, 120), email, clean(body.phone, 60),
      clean(body.city, 80), clean(body.country, 80), clean(body.practice_type, 60),
      clean(body.ownership, 120), clean(body.website, 300), clean(body.booking_url, 300),
      clean(body.description, 1000), (body.virtual === true || body.virtual === 1) ? 1 : 0
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
        event: 'directory_submission', submission_id: id, name, email,
        city: clean(body.city, 80), country: clean(body.country, 80),
        _subject: 'respira 100: ' + name + ' (' + id + ')'
      })
    }).catch(function () {}));
  } catch (e) { /* ignore */ }

  return json({ id, status: 'submitted' });
}
