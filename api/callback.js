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
<p>${status === 'success' ? 'Signed in. You can close this window.' : 'Sign-in failed.'}</p>
<script>
  (function () {
    var msg = ${JSON.stringify(message)};
    function send(e) { window.opener.postMessage(msg, e.origin); }
    window.addEventListener('message', send, false);
    if (window.opener) {
      window.opener.postMessage('authorizing:github', '*');
      setTimeout(function () { window.close(); }, 1200);
    }
  })();
</script>
</body>`
}
