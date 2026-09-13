import crypto from 'node:crypto'

/**
 * Step 1 of the GitHub OAuth dance for Decap CMS.
 * Sends the admin to GitHub, with a one-time state value stashed in a cookie
 * so the callback can verify the response came from the request we made.
 */
export default function handler(req, res) {
  const clientId = process.env.GITHUB_CLIENT_ID
  if (!clientId) {
    res.status(500).send('GITHUB_CLIENT_ID is not set in the Vercel environment.')
    return
  }

  const host = req.headers['x-forwarded-host'] || req.headers.host
  const proto = req.headers['x-forwarded-proto'] || 'https'
  const state = crypto.randomBytes(16).toString('hex')

  const url = new URL('https://github.com/login/oauth/authorize')
  url.searchParams.set('client_id', clientId)
  url.searchParams.set('redirect_uri', `${proto}://${host}/api/callback`)
  url.searchParams.set('scope', 'repo,user')
  url.searchParams.set('state', state)

  res.setHeader('Set-Cookie',
    `cms_state=${state}; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=600`)
  res.writeHead(302, { Location: url.toString() })
  res.end()
}
