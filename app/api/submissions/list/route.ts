import { NextResponse } from 'next/server';
import { google } from 'googleapis';

// ── Google Drive auth (Harmonized with save route) ─────────────────
function getDriveClient() {
  const serviceAccount = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (serviceAccount) {
    try {
      const creds = JSON.parse(serviceAccount);
      const auth = new google.auth.JWT({
        email: creds.client_email,
        key: creds.private_key,
        scopes: ['https://www.googleapis.com/auth/drive.file'],
      });
      return google.drive({ version: 'v3', auth });
    } catch (e) {
      console.error('Invalid GOOGLE_SERVICE_ACCOUNT_JSON', e);
    }
  }

  const clientId     = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  
  if (clientId && clientSecret && refreshToken) {
    const oauth2 = new google.auth.OAuth2(clientId, clientSecret, 'https://developers.google.com/oauthplayground');
    oauth2.setCredentials({ refresh_token: refreshToken });
    return google.drive({ version: 'v3', auth: oauth2 });
  }

  throw new Error('Google Drive credentials not configured.');
}

export async function GET() {
  try {
    const drive  = getDriveClient();
    const rootId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    if (!rootId) throw new Error('GOOGLE_DRIVE_FOLDER_ID not set');

    // 1. Try to load from master submissions.json first (FAST)
    try {
      const listRes = await drive.files.list({
        q: `'${rootId}' in parents and name='submissions.json' and trashed=false`,
        fields: 'files(id)',
      });
      const masterFile = listRes.data.files?.[0];

      if (masterFile?.id) {
        const content = await drive.files.get({ fileId: masterFile.id, alt: 'media' }, { responseType: 'text' });
        const submissions = JSON.parse(content.data as string);
        if (Array.isArray(submissions)) {
          return NextResponse.json({ submissions, source: 'cache' });
        }
      }
    } catch (e) {
      console.warn('Master JSON load failed, falling back to scan:', e);
    }

    // 2. Fallback: Scan folders (SLOW)
    const foldersRes = await drive.files.list({
      q: `'${rootId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: 'files(id, name)',
      orderBy: 'createdTime desc',
      pageSize: 50, // Limit scan for safety
    });

    const folders = foldersRes.data.files || [];
    const submissions: any[] = [];

    await Promise.all(
      folders.map(async (folder) => {
        try {
          const filesRes = await drive.files.list({
            q: `'${folder.id}' in parents and name='data.json' and trashed=false`,
            fields: 'files(id)',
          });
          const dataFile = filesRes.data.files?.[0];
          if (!dataFile?.id) return;

          const content = await drive.files.get({ fileId: dataFile.id, alt: 'media' }, { responseType: 'text' });
          const data = JSON.parse(content.data as string);

          submissions.push({
            ...data,
            folder: folder.name,
            driveFolderId: folder.id,
          });
        } catch {
          // Skip
        }
      }),
    );

    submissions.sort((a, b) => b.timestamp - a.timestamp);
    return NextResponse.json({ submissions, source: 'scan' });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    console.error('[submissions/list]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

