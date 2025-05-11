import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const code = req.query.code as string
  const returnedState = req.query.state as string
  const cookieState = req.cookies['notion_oauth_state']
  if (!returnedState || returnedState !== cookieState) {
    res.status(400).send('Invalid OAuth state')
    return
  }
  if (!code) { res.status(400).send('No code'); return }
  const basicAuth = Buffer.from(
    `${process.env.NOTION_CLIENT_ID}:${process.env.NOTION_CLIENT_SECRET}`
  ).toString('base64')
  const tokenRes = await fetch('https://api.notion.com/v1/oauth/token', {
    method:'POST', headers:{
      Authorization:`Basic ${basicAuth}`, 'Content-Type':'application/json'
    },
    body:JSON.stringify({
      grant_type:'authorization_code', code,
      redirect_uri:process.env.NOTION_REDIRECT_URI
    })
  })
  const tokenData = await tokenRes.json()
  const accessToken = tokenData.access_token as string
  const supa = createClient(
    process.env.SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string
  )
  const userId = req.cookies['sb:token'] || ''
  await supa.from('notion_connections').upsert({ user_id: userId, access_token: accessToken })
  res.setHeader('Set-Cookie','notion_oauth_state=; Max-Age=0; path=/;')
  res.redirect('/')
}
