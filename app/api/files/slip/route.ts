import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth/session';
import { resolveSlipToken, readStoredFile } from '@/lib/storage';

function contentTypeFor(storageKey: string) {
  if (storageKey.endsWith('.pdf')) return 'application/pdf';
  if (storageKey.endsWith('.png')) return 'image/png';
  return 'image/jpeg';
}

export async function GET(req: NextRequest) {
  // Slip files contain financial/PII data — only authenticated admins may
  // view them, and only via a short-lived signed token (never a raw path).
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const token = req.nextUrl.searchParams.get('token');
  if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 });

  const resolved = resolveSlipToken(token);
  if (!resolved) return NextResponse.json({ error: 'Invalid or expired token' }, { status: 403 });

  try {
    const buffer = await readStoredFile(resolved.storageKey);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': contentTypeFor(resolved.storageKey),
        'Cache-Control': 'private, no-store',
      },
    });
  } catch {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
}
