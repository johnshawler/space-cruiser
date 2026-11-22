// Serves Long Haul at johnshawler.com/long-haul straight from the main branch
// of the public GitHub repo, so a push to main updates the site within a few
// minutes. The game is one self-contained page (index.html); nothing else is
// served. Copies are kept at Cloudflare for two minutes; browsers are told to
// check back on every load so players never get stuck on an old version.
// Deployed as the Cloudflare Worker "long-haul" with routes
// johnshawler.com/long-haul and johnshawler.com/long-haul/*.
const ORIGIN = 'https://raw.githubusercontent.com/johnshawler/space-cruiser/main';
const PREFIX = '/long-haul';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (request.method !== 'GET' && request.method !== 'HEAD') return new Response('Method not allowed', { status: 405 });
    if (url.pathname === PREFIX) return Response.redirect(url.origin + PREFIX + '/', 307);
    let path = url.pathname.slice(PREFIX.length);
    if (path === '/') path = '/index.html';
    if (path !== '/index.html') return new Response('Not found', { status: 404 });

    const cache = caches.default;
    const key = new Request(url.origin + PREFIX + path);
    let stored = await cache.match(key);
    if (!stored) {
      const upstream = await fetch(ORIGIN + path);
      if (!upstream.ok) return new Response('Not found', { status: upstream.status === 404 ? 404 : 502 });
      stored = new Response(upstream.body, { headers: { 'Cache-Control': 'public, max-age=120' } });
      ctx.waitUntil(cache.put(key, stored.clone()));
    }
    return new Response(request.method === 'HEAD' ? null : stored.body, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  },
};
