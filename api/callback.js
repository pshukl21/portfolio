import crypto from 'node:crypto'

const MAX_AGE_MS = 10 * 60 * 1000

/** Verify the signed state from /api/auth — no cookie involved. */
function validState(state, secret) {
  if (typeof state !== 'string' || !state.includes('.')) return false
  const [ts, sig] = state.split('.')
  const expected = crypto.createHmac('sha256', secret).update(ts).digest('base64url')
  if (sig.length !== expected.length) return false
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false
  const age = Date.now() - parseInt(ts, 36)
  return age >= 0 && age < MAX_AGE_MS
}

/**
 * Step 2 of the GitHub OAuth dance: trade the code for a token, then hand it
 * to the CMS window via postMessage. Decap closes this window once it has it.
 */
export default async function handler(req, res) {
  const { code, state } = req.query
  const secret = process.env.GITHUB_CLIENT_SECRET

  // A GitHub code is single-use. If anything caches or prefetches this URL
  // the code is spent before the real request arrives, which reads as
  // "incorrect or expired".
  res.setHeader('Cache-Control', 'no-store, max-age=0')

  const fail = (message) => {
    res.setHeader('Content-Type', 'text/html')
    res.status(400).send(page('error', { message }))
  }

  if (!secret) return fail('GITHUB_CLIENT_SECRET is not set in Vercel.')
  if (!code) return fail('No code returned from GitHub.')
  if (!validState(state, secret)) {
    return fail('State signature invalid or expired — start again from /admin.')
  }

  // Rebuild the exact redirect_uri used in step 1. GitHub can require the
  // two to match, and omitting it here reads as a bad code.
  const host = req.headers['x-forwarded-host'] || req.headers.host
  const proto = req.headers['x-forwarded-proto'] || 'https'
  const redirectUri = `${proto}://${host}/api/callback`

  try {
    const r = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: secret,
        code,
        redirect_uri: redirectUri,
      }),
    })
    const data = await r.json()
    if (!data.access_token) {
      return fail(`${data.error || 'no_token'}: `
        + `${data.error_description || 'no description'}`
        + ` | client_id ${String(process.env.GITHUB_CLIENT_ID).slice(0, 8)}…`
        + ` | redirect_uri ${redirectUri}`)
    }

    res.setHeader('Content-Type', 'text/html')
    res.status(200).send(page('success', {
      token: data.access_token,
      provider: 'github',
    }))
  } catch (err) {
    fail(err.message)
  }
}

function page(status, payload) {
  const message = `authorization:github:${status}:${JSON.stringify(payload)}`
  const detail = status === 'success' ? '' :
    `<p style="color:#a00;font-family:ui-monospace,monospace;font-size:12px">${
      String(payload.message || 'no reason given').replace(/[<>&]/g, '')
    }</p>`
  return `<!doctype html><meta charset="utf-8"><title>Signing in…</title>
<body style="font:14px system-ui;padding:2rem;color:#333">
<p>${status === 'success' ? 'Signing in…' : 'Sign-in failed.'}</p>
${detail}
<script>
  (function () {
    var msg = ${JSON.stringify(message)};
    if (!window.opener) {
      document.body.insertAdjacentHTML('beforeend',
        '<p>Open this from the CMS sign-in button, not directly.</p>');
      return;
    }
    // Decap's handshake: announce ourselves, it replies, we hand over the
    // token, and it closes this window. Closing early loses the token.
    window.addEventListener('message', function (e) {
      window.opener.postMessage(msg, e.origin);
    }, false);
    window.opener.postMessage('authorizing:github', '*');
  })();
</script>
</body>`
}
