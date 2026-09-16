/**
 * Step 2 of the GitHub OAuth dance for Decap CMS.
 * Trades the code for an access token, then hands it back to the CMS window
 * via postMessage — the shape Decap listens for.
 */
export default async function handler(req, res) {
  const { code, state } = req.query
  const cookie = req.headers.cookie || ''
  const expected = cookie.match(/(?:^|;\s*)cms_state=([^;]+)/)?.[1]

  const fail = (message) => {
    res.setHeader('Content-Type', 'text/html')
    res.status(400).send(page('error', { message }))
  }

  if (!code) return fail('No code returned from GitHub.')
  if (!state || state !== expected) return fail('State mismatch — try signing in again.')

  try {
    const r = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    })
    const data = await r.json()
    if (!data.access_token) return fail(data.error_description || 'No token returned.')

    res.setHeader('Set-Cookie', 'cms_state=; Path=/; Max-Age=0')
    res.setHeader('Content-Type', 'text/html')
    res.status(200).send(page('success', { token: data.access_token, provider: 'github' }))
  } catch (err) {
    fail(err.message)
  }
}

function page(status, payload) {
  const message = `authorization:github:${status}:${JSON.stringify(payload)}`
  return `<!doctype html><meta charset="utf-8"><title>Signing in…</title>
<body style="font:14px system-ui;padding:2rem;color:#333">
<p id="s">${status === 'success' ? 'Signing in…' : 'Sign-in failed.'}</p>
${status === 'success' ? '' :
  `<p style="color:#a00;font-family:ui-monospace,monospace;font-size:12px">${
    String(payload.message || 'no reason given').replace(/[<>&]/g, '')
  }</p>
<p style="color:#666;font-size:12px">Check GITHUB_CLIENT_ID and
GITHUB_CLIENT_SECRET in Vercel, and that the OAuth app's callback URL is
exactly this page's address.</p>`}
<script>
  (function () {
    var msg = ${JSON.stringify(message)};
    if (!window.opener) {
      document.getElementById('s').textContent =
        'Open this from the CMS sign-in button, not directly.';
      return;
    }
    // Decap's handshake: we announce ourselves, it replies, we hand over the
    // token, and it closes this window. Closing early loses the token.
    window.addEventListener('message', function (e) {
      window.opener.postMessage(msg, e.origin);
    }, false);
    window.opener.postMessage('authorizing:github', '*');
  })();
</script>
</body>`
}
