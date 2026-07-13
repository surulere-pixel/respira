// functions/api/templates.js
// Class template intake + approved gallery.
// POST → save a submitted template (status: pending). Admin approves via /api/admin.
// GET  → returns approved templates for the studio gallery.
//
// Requires D1 binding "DB" and the class_templates table (see schema.sql).

const INTENSITIES = ['gentle', 'moderate', 'deep'];
const FORMSPREE = 'mykqjrjw';

function json(data, status) {
  return new Response(JSON.stringify(data), { status: status || 200, headers: { 'Content-Type': 'application/json' } });
}
function clean(v, max) {
  return (typeof v === 'string') ? v.trim().slice(0, max || 500) : '';
}
function newId() {
  return 'TPL-' + crypto.randomUUID().split('-')[0].toUpperCase();
}

export async function onRequestGet(context) {
  const { env } = context;
  if (!env.DB) return json({ templates: [] });
  try {
    const rs = await env.DB.prepare(
      `SELECT id, name, intensity, disc, minutes, blocks, author, created_at
       FROM class_templates WHERE status = 'approved' ORDER BY created_at DESC LIMIT 60`
    ).all();
    const templates = (rs.results || []).map(function (r) {
      let blocks = [];
      try { blocks = JSON.parse(r.blocks || '[]'); } catch (e) { blocks = []; }
      return { id: r.id, name: r.name, intensity: r.intensity, disc: r.disc, minutes: r.minutes, blocks, author: r.author || '' };
    });
    return json({ templates });
  } catch (e) {
    return json({ templates: [] });
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.DB) return json({ error: 'not_configured' }, 503);

  let body;
  try { body = await request.json(); } catch (e) { return json({ error: 'bad_request' }, 400); }

  const name = clean(body.name, 120);
  const intensity = clean(body.intensity, 20).toLowerCase();
  const disc = clean(body.disc, 40);
  const minutes = parseInt(body.minutes, 10) || 0;
  const email = clean(body.email, 200);
  const author = clean(body.author, 120);
  const blocks = Array.isArray(body.blocks) ? body.blocks : null;

  const errors = {};
  if (!name) errors.name = 'required';
  if (INTENSITIES.indexOf(intensity) < 0) errors.intensity = 'gentle, moderate, or deep';
  if (!disc) errors.disc = 'required';
  if (minutes < 5 || minutes > 180) errors.minutes = '5-180 minutes';
  if (!email || email.indexOf('@') < 1) errors.email = 'valid email required';
  if (!blocks || !blocks.length) errors.blocks = 'at least one section';
  if (Object.keys(errors).length) return json({ error: 'validation', fields: errors }, 400);

  // sanitize each block
  const safeBlocks = blocks.slice(0, 20).map(function (b) {
    return {
      name: clean(b.name, 80),
      mins: parseInt(b.mins, 10) || 1,
      kind: clean(b.kind, 40),
      cues: clean(b.cues, 4000)
    };
  }).filter(function (b) { return b.name && b.mins > 0; });

  if (!safeBlocks.length) return json({ error: 'validation', fields: { blocks: 'no valid sections' } }, 400);

  const id = newId();
  const now = new Date().toISOString();

  try {
    await env.DB.prepare(
      `INSERT INTO class_templates (id, created_at, name, intensity, disc, minutes, blocks, author, email, status)
       VALUES (?,?,?,?,?,?,?,?,?, 'pending')`
    ).bind(id, now, name, intensity, disc, minutes, JSON.stringify(safeBlocks), author, email).run();
  } catch (e) {
    return json({ error: 'save_failed' }, 500);
  }

  const fid = env.FORMSPREE_ID || FORMSPREE;
  try {
    context.waitUntil(fetch('https://formspree.io/f/' + fid, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        event: 'class_template_submission', submission_id: id,
        name, intensity, disc, minutes, author, email,
        sections: safeBlocks.length,
        _subject: 'class template: ' + name + ' — ' + intensity + ' · ' + minutes + 'm (' + id + ')'
      })
    }).catch(function () {}));
  } catch (e) { /* ignore */ }

  return json({ id, status: 'pending' });
}
