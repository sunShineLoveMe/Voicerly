// app/api/voxcpm/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params.path, 'GET')
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params.path, 'POST')
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params.path, 'PUT')
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params.path, 'DELETE')
}

export async function HEAD(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params.path, 'HEAD')
}

export async function OPTIONS(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params.path, 'OPTIONS')
}

async function handleRequest(
  request: NextRequest,
  pathSegments: string[],
  method: string
) {
  const targetBase = process.env.VOXCPM_BASE_URL
  if (!targetBase) {
    return NextResponse.json({ error: 'VOXCPM_BASE_URL is not set' }, { status: 500 })
  }

  const slug = pathSegments || []
  const search = request.url.includes('?') ? '?' + request.url.split('?')[1] : ''
  const url = `${targetBase}/${slug.join('/')}${search}`

  // 透传请求头（去掉 host，改成目标 host）
  const headers = new Headers()
  for (const [k, v] of request.headers.entries()) {
    // 这两类头让上游决定
    if (k.toLowerCase() === 'host') continue
    headers.set(k, v)
  }
  headers.set('host', new URL(targetBase).host)

  // 某些端点不支持 HEAD（/config），把 HEAD 改为 GET，但等价返回
  const actualMethod = method === 'HEAD' ? 'GET' : method

  const upstream = await fetch(url, {
    method: actualMethod,
    headers,
    body: method === 'GET' || method === 'HEAD' ? undefined : request.body,
    // 保持流式
    duplex: 'half' as any,
  }).catch((e) => {
    return NextResponse.json({ error: 'Upstream fetch error', detail: String(e) }, { status: 502 })
  })

  if (!upstream) return

  // 设置响应头 & 状态码
  const responseHeaders = new Headers()
  upstream.headers.forEach((v, k) => responseHeaders.set(k, v))
  // 不缓存
  responseHeaders.set('Cache-Control', 'no-store, private, max-age=0, must-revalidate')

  if (method === 'HEAD') {
    // HEAD：不回 body
    return new NextResponse(null, {
      status: upstream.status,
      headers: responseHeaders,
    })
  }

  // 流式转发 body
  if (upstream.body) {
    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers: responseHeaders,
    })
  } else {
    return new NextResponse(null, {
      status: upstream.status,
      headers: responseHeaders,
    })
  }
}
