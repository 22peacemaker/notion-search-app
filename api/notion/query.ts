import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

interface QueryBody {
  database_id: string
  filter: any
  page_size?: number
  start_cursor?: string
  sorts?: { property: string; direction: 'ascending' | 'descending' }[]
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { database_id, filter, page_size, start_cursor, sorts } = req.body as QueryBody
  if (!database_id || !filter) return res.status(400).send('Missing data')
  const supa = createClient(process.env.SUPABASE_URL as string, process.env.SUPABASE_SERVICE_ROLE_KEY as string)
  const { data:{ user } } = await supa.auth.getUserByCookie(req)
  if (!user) return res.status(401).send('Unauthorized')
  const { data: conns } = await supa.from('notion_connections').select('access_token').eq('user_id', user.id)
  const token = conns?.[0]?.access_token as string
  const body:any = { filter }
  if(page_size) body.page_size=page_size
  if(start_cursor) body.start_cursor=start_cursor
  if(sorts) body.sorts=sorts
  const notionRes = await fetch(`https://api.notion.com/v1/databases/${database_id}/query`,{
    method:'POST', headers:{
      Authorization:`Bearer ${token}`, 'Notion-Version':'2022-06-28', 'Content-Type':'application/json'
    }, body:JSON.stringify(body)
  })
  const data = await notionRes.json()
  res.status(200).json({ results:data.results, next_cursor:data.next_cursor, has_more:data.has_more })
}
