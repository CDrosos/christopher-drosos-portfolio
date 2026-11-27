/// <reference types="@cloudflare/workers-types" />

const PING_PATHS = new Set(['/ping', '/ping/']);

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);

    if (PING_PATHS.has(url.pathname)) {
      return proxyKeepalive(request, env, url);
    }

    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;

async function proxyKeepalive(request: Request, env: Env, url: URL): Promise<Response> {
  const upstream = new URL(env.KEEPALIVE_URL);
  upstream.search = url.search;

  console.log(JSON.stringify({
    message: 'keepalive proxy',
    method: request.method,
    pathname: url.pathname,
  }));

  const headers = new Headers(request.headers);
  headers.delete('host');

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: 'follow',
  };

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = request.body;
  }

  try {
    return await fetch(new Request(upstream, init));
  } catch (error) {
    console.error(JSON.stringify({
      message: 'keepalive proxy failed',
      error: error instanceof Error ? error.message : String(error),
    }));

    return new Response('Keep-alive proxy failed', {
      status: 502,
      headers: {
        'cache-control': 'no-store',
        'content-type': 'text/plain; charset=utf-8',
      },
    });
  }
}
