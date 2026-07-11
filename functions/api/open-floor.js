// functions/api/open-floor.js
// Open Floor contributor intake → saves a real record to D1, returns a submission ID,
// and fires an internal notification. No fake success: we only confirm after the row is written.
//
// Requires a D1 binding named DB (bind respira_db as "DB" in the Pages project).
// Optional: FORMSPREE_ID env var for internal email notification (falls back to the known form).

const CONTRIB_TYPES = ['original sound', 'spoken word', 'guided voice', 'remix', 'collection', 'other'];
const FORMSPREE = 'mykqjrjw';

function json(data, status) {
  return new Response(JSON.stringify(data), { status: status || 200, headers: { 'Content-Type': 'application/json' } });
}
function clean(v, max) {
  return (typeof v === 'string') ? v.trim().slice(0, max || 500) : '';
}
function newId() {
  return 'OF-' + crypto.randomUUID().split('-')[0].toUpperCase();
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.DB) return json({ error: 'not_configured' }, 503);

  let body;
  try { body = await request.json(); } catch (e) { return json({ error: 'bad_request' }, 400); }

  const name = clean(body.name, 120);
  const email = clean(body.email, 200);
  const contribution_type = clean(body.contribution_type, 40);
  const rights = body.rights_confirmed === true || body.rights_confirmed === 1;

  // validation — mirror the client so the server is the real gate
  const errors = {};
  if (!name) errors.name = 'required';
  if (!email || email.indexOf('@') < 1) errors.email = 'valid email required';
  if (CONTRIB_TYPES.indexOf(contribution_type) < 0) errors.contribution_type = 'choose a type';
  if (!rights) errors.rights_confirmed = 'rights confirmation required';
  if (Object.keys(errors).length) return json({ error: 'validation', fields: errors }, 400);

  const id = newId();
  const now = new Date().toISOString();

  try {
    await env.DB.prepare(
      `INSERT INTO open_floor_submissions
       (id, created_at, name, email, phone, city, country, project_name, contribution_type, links, description, credit, rights_confirmed, status)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?, 'submitted')`
    ).bind(
      id, now, name, email,
      clean(body.phone, 60), clean(body.city, 80), clean(body.country, 80),
      clean(body.project_name, 120), contribution_type,
      clean(body.links, 600), clean(body.description, 2000), clean(body.credit, 120),
      rights ? 1 : 0
    ).run();
  } catch (e) {
    return json({ error: 'save_failed' }, 500);
  }

  // best-effort internal notification (never blocks the confirmation)
  const fid = env.FORMSPREE_ID || FORMSPREE;
  try {
    context.waitUntil(fetch('https://formspree.io/f/' + fid, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        event: 'open_floor_submission', submission_id: id, name, email,
        contribution_type, project_name: clean(body.project_name, 120),
        _subject: 'open floor: ' + contribution_type + ' — ' + name + ' (' + id + ')'
      })
    }).catch(function () {}));
  } catch (e) { /* ignore */ }

  return json({ id, status: 'submitted' });
}
