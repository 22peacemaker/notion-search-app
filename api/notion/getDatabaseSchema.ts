import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { database_id } = req.body as { database_id: string }
  const supa = createClient(process.env.SUPABASE_URL as string, process.env.SUPABASE_SERVICE_ROLE_KEY as string)
  const { data:{ user } } = await supa.auth.getUserByCookie(req)
  if (!user) return res.status(401).send('Unauthorized')
  const { data:conns } = await supa.from('notion_connections').select('access_token').eq('user_id', user.id)
  const token = conns?.[0]?.access_token as string
  const notionRes = await fetch(`https://api.notion.com/v1/databases/${database_id}`,{
    headers:{ Authorization:`Bearer ${token}`, 'Notion-Version':'2022-06-28' }
  })
  const json = await notionRes.json()
  res.status(200).json({ properties: json.properties })
}
