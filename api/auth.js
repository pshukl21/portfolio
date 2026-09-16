import crypto from 'node:crypto'

/**
 * Step 1 of the GitHub OAuth dance for Decap CMS.
 *
 * The state value is signed rather than stored in a cookie. A cookie has to
 * survive the cross-site redirect back from GitHub, which SameSite rules
 * make unreliable; a signed value needs no storage at all.
 */
export function signState(secret) {
  const ts = Date.now().toString(36)
  const sig = crypto.createHmac('sha256', secret).update(ts).digest('base64url')
  return `${ts}.${sig}`
}

export default function handler(req, res) {
  const clientId = process.env.GITHUB_CLIENT_ID
  const secret = process.env.GITHUB_CLIENT_SECRET
  if (!clientId || !secret) {
    res.status(500).send('GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET are not set '
      + 'in the Vercel environment.')
    return
  }

  const host = req.headers['x-forwarded-host'] || req.headers.host
  const proto = req.headers['x-forwarded-proto'] || 'https'

  // Never let a proxy or the browser cache an auth redirect.
  res.setHeader('Cache-Control', 'no-store, max-age=0')

  const url = new URL('https://github.com/login/oauth/authorize')
  url.searchParams.set('client_id', clientId)
  url.searchParams.set('redirect_uri', `${proto}://${host}/api/callback`)
  url.searchParams.set('scope', 'repo,user')
  url.searchParams.set('state', signState(secret))

  res.writeHead(302, { Location: url.toString() })
  res.end()
}
