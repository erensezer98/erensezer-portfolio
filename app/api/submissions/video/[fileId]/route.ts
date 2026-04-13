import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

function getDriveClient() {
  const clientId     = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) throw new Error('Google OAuth not configured');
  const oauth2 = new google.auth.OAuth2(clientId, clientSecret, 'https://developers.google.com/oauthplayground');
  oauth2.setCredentials({ refresh_token: refreshToken });
  return google.drive({ version: 'v3', auth: oauth2 });
}

export async function GET(_req: NextRequest, { params }: { params: { fileId: string } }) {
  try {
    const drive = getDriveClient();
    const res = await drive.files.get(
      { fileId: params.fileId, alt: 'media' },
      { responseType: 'arraybuffer' },
    );
    const buf = Buffer.from(res.data as ArrayBuffer);
    return new NextResponse(buf, {
      headers: {
        'Content-Type': 'video/webm',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
