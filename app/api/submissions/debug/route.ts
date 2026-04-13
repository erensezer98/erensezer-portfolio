import { NextResponse } from 'next/server';

export async function GET() {
  const clientId     = process.env.GOOGLE_CLIENT_ID     ?? 'MISSING';
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET ?? 'MISSING';
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN ?? 'MISSING';
  const folderId     = process.env.GOOGLE_DRIVE_FOLDER_ID ?? 'MISSING';

  return NextResponse.json({
    clientId_len:       clientId.length,
    clientId_start:     clientId.slice(0, 12),
    clientId_end:       clientId.slice(-6),
    clientSecret_len:   clientSecret.length,
    clientSecret_start: clientSecret.slice(0, 8),
    refreshToken_len:   refreshToken.length,
    refreshToken_start: refreshToken.slice(0, 8),
    folderId,
  });
}
