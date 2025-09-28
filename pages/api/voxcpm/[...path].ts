// pages/api/voxcpm/[...path].ts
import type { NextApiRequest, NextApiResponse } from 'next'

export const config = { api: { bodyParser: false } }

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const targetBase = process.env.VOXCPM_BASE_URL
  if (!targetBase) {
    res.status(500).json({ error: 'VOXCPM_BASE_URL is not set' })
    return
  }

  const slug = (req.query.path || []) as string[]
  const search = req.url && req.url.includes('?') ? '?' + req.url.split('?')[1] : ''
  const url = `${targetBase}/${slug.join('/')}${search}`

  // 透传请求头（去掉 host，改成目标 host）
  const headers = new Headers()
  for (const [k, v] of Object.entries(req.headers)) {
    if (v === undefined) continue
    // 这两类头让上游决定
    if (k.toLowerCase() === 'host') continue
    headers.set(k, Array.isArray(v) ? v.join(',') : String(v))
  }
  headers.set('host', new URL(targetBase).host)

  // 某些端点不支持 HEAD（/config），把 HEAD 改为 GET，但等价返回
  const method = req.method === 'HEAD' ? 'GET' : req.method

  const upstream = await fetch(url, {
    method,
    headers,
    body: method === 'GET' || method === 'HEAD' ? undefined : (req as any),
    // 保持流式
    duplex: 'half' as any,
  }).catch((e) => {
    res.status(502).json({ error: 'Upstream fetch error', detail: String(e) })
    return null
  })

  if (!upstream) return

  // 设置响应头 & 状态码
  res.status(upstream.status)
  upstream.headers.forEach((v, k) => res.setHeader(k, v))
  // 不缓存
  res.setHeader('Cache-Control', 'no-store, private, max-age=0, must-revalidate')

  if (req.method === 'HEAD') {
    // HEAD：不回 body
    res.end()
    return
  }

  // 流式转发 body
  if (upstream.body) {
    (upstream.body as any).pipe(res)
  } else {
    res.end()
  }
}
