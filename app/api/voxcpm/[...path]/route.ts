// app/api/voxcpm/[...path]/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BASE = process.env.VOXCPM_BASE_URL;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,HEAD',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function makeTargetURL(segments: string[] | undefined, search: string) {
  if (!BASE) throw new Error('VOXCPM_BASE_URL is not set');
  const path = segments && segments.length ? segments.join('/') : '';
  const base = BASE.replace(/\/+$/, '');
  return `${base}/${path}${search ? `?${search}` : ''}`;
}

async function proxy(req: Request, ctx: { params: { path?: string[] } }) {
  const url = new URL(req.url);
  const target = makeTargetURL(ctx.params?.path, url.searchParams.toString());

  const headers = new Headers(req.headers);
  headers.delete('host');
  headers.delete('content-length');
  headers.delete('connection');
  headers.delete('accept-encoding'); // 避免压缩引发的问题

  const upstream = await fetch(target, {
    method: req.method,
    headers,
    body:
      req.method === 'GET' || req.method === 'HEAD'
        ? undefined
        : await req.arrayBuffer(),
    cache: 'no-store',
    redirect: 'manual',
  });

  const respHeaders: Record<string, string> = {};
  upstream.headers.forEach((v, k) => (respHeaders[k] = v));
  Object.assign(respHeaders, corsHeaders);

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: respHeaders,
  });
}

export async function GET(req: Request, ctx: { params: { path?: string[] } }) {
  return proxy(req, ctx);
}
export async function POST(req: Request, ctx: { params: { path?: string[] } }) {
  return proxy(req, ctx);
}
export async function OPTIONS() {
  return new Response(null, { headers: corsHeaders });
}
export async function HEAD(req: Request, ctx: { params: { path?: string[] } }) {
  return proxy(req, ctx);
}
