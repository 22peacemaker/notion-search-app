import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const supa = createClient(process.env.SUPABASE_URL as string, process.env.SUPABASE_SERVICE_ROLE_KEY as string)
  const { data: { user } } = await supa.auth.getUserByCookie(req)
  if (!user) return res.status(401).send('Unauthorized')
  const { data: conns } = await supa.from('notion_connections').select('access_token').eq('user_id', user.id)
  const token = conns?.[0]?.access_token as string
  const notionRes = await fetch('https://api.notion.com/v1/search',{ 
    method:'POST', headers:{
      Authorization:`Bearer ${token}`, 'Notion-Version':'2022-06-28', 'Content-Type':'application/json'
    },
    body:JSON.stringify({ filter:{ property:'object', value:'database' } })
  })
  const { results } = await notionRes.json()
  const databases = results.map((db:any)=>({ id:db.id, name:db.title[0]?.plain_text||'Untitled' }))
  res.status(200).json({ databases })
}
