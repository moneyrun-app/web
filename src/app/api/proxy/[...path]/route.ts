import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://moneyrun-backend.onrender.com';

async function handler(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const targetPath = '/' + path.join('/');
  const url = new URL(req.url);
  const queryString = url.search;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const authHeader = req.headers.get('Authorization');
  if (authHeader) {
    headers['Authorization'] = authHeader;
  }

  const fetchOptions: RequestInit = {
    method: req.method,
    headers,
  };

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    try {
      const body = await req.text();
      if (body) fetchOptions.body = body;
    } catch {
      // no body
    }
  }

  try {
    const res = await fetch(`${API_URL}${targetPath}${queryString}`, fetchOptions);
    const data = await res.text();

    return new NextResponse(data, {
      status: res.status,
      headers: { 'Content-Type': res.headers.get('Content-Type') || 'application/json' },
    });
  } catch {
    return NextResponse.json({ success: false, message: 'Backend unreachable' }, { status: 502 });
  }
}

export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const DELETE = handler;
export const PUT = handler;
