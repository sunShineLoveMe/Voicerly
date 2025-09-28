import { NextRequest } from "next/server";

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  const target = `${process.env.NEXT_PUBLIC_VOXCPM_BASE}/${params.path.join("/")}`;
  const res = await fetch(target, {
    method: "GET",
    headers: req.headers,
  });
  return new Response(res.body, { status: res.status, headers: res.headers });
}

export async function POST(req: NextRequest, { params }: { params: { path: string[] } }) {
  const target = `${process.env.NEXT_PUBLIC_VOXCPM_BASE}/${params.path.join("/")}`;
  const res = await fetch(target, {
    method: "POST",
    headers: req.headers,
    body: req.body,
  });
  return new Response(res.body, { status: res.status, headers: res.headers });
}
