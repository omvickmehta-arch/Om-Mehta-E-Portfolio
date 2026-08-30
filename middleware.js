// Vercel Edge Middleware — runs before compose.html is served.
// Protects ONLY /compose.html with an HTTP Basic Auth prompt.
// Username/password are read from Vercel Environment Variables
// (Project Settings → Environment Variables), never hardcoded here,
// so they never end up in the public GitHub repo.

export default function middleware(request) {
  const url = new URL(request.url);

  if (url.pathname === '/compose.html') {
    const expectedUser = process.env.COMPOSE_USER;
    const expectedPass = process.env.COMPOSE_PASS;

    const authHeader = request.headers.get('authorization');

    if (authHeader) {
      const [scheme, encoded] = authHeader.split(' ');
      if (scheme === 'Basic' && encoded) {
        const decoded = atob(encoded); // "user:pass"
        const separatorIndex = decoded.indexOf(':');
        const user = decoded.substring(0, separatorIndex);
        const pass = decoded.substring(separatorIndex + 1);

        if (user === expectedUser && pass === expectedPass) {
          return; // credentials correct — let the request through
        }
      }
    }

    return new Response('Authentication required.', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Compose Private Area"',
      },
    });
  }

  // every other path passes through untouched
}

export const config = {
  matcher: '/compose.html',
};
