// functions/media/[[path]].js
// Serves objects out of the respira-media R2 bucket at /media/<key>.
// Requires env: MEDIA (R2 bucket binding).

export async function onRequestGet(context) {
  const { params, env } = context;
  if (!env.MEDIA) return new Response('not configured', { status: 503 });

  const key = Array.isArray(params.path) ? params.path.join('/') : (params.path || '');
  if (!key) return new Response('not found', { status: 404 });

  const obj = await env.MEDIA.get(key);
  if (!obj) return new Response('not found', { status: 404 });

  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set('etag', obj.httpEtag);
  headers.set('cache-control', 'public, max-age=31536000, immutable');

  return new Response(obj.body, { headers });
}
