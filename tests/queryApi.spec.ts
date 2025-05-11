import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import express, { Request, Response } from 'express'

let server: any
beforeAll(() => {
  const app = express()
  app.use(express.json())
  
  // Mock API endpoint
  app.post('/api/notion/query', (req: Request, res: Response) => {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).send('Missing data')
    }
    res.status(200).send('OK')
  })
  
  server = app
})

describe('POST /api/notion/query', () => {
  it('rejects missing data', async () => {
    const res = await request(server).post('/api/notion/query').send({})
    expect(res.status).toBe(400)
    expect(res.text).toMatch(/Missing data/)
  })
})
