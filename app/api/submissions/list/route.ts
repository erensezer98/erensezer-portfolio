import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

function getDriveClient() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON not set');

  let creds: { client_email: string; private_key: string };
  try {
    creds = JSON.parse(raw);
  } catch {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON is not valid JSON');
  }

  const auth = new JWT({
    email: creds.client_email,
    key:   creds.private_key,
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  });
  return google.drive({ version: 'v3', auth });
}

export async function GET() {
  try {
    const drive  = getDriveClient();
    const rootId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    if (!rootId) throw new Error('GOOGLE_DRIVE_FOLDER_ID not set');

    // List subfolders in the root submissions folder
    const foldersRes = await drive.files.list({
      q: `'${rootId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: 'files(id, name)',
      orderBy: 'createdTime desc',
      pageSize: 100,
    });

    const folders = foldersRes.data.files || [];
    const submissions: { timestamp: number; [key: string]: unknown }[] = [];

    // Fetch data.json from each subfolder in parallel
    await Promise.all(
      folders.map(async (folder) => {
        try {
          // Find data.json inside this folder
          const filesRes = await drive.files.list({
            q: `'${folder.id}' in parents and name='data.json' and trashed=false`,
            fields: 'files(id)',
          });
          const dataFile = filesRes.data.files?.[0];
          if (!dataFile?.id) return;

          // Download data.json content
          const content = await drive.files.get(
            { fileId: dataFile.id, alt: 'media' },
            { responseType: 'text' },
          );
          const data = JSON.parse(content.data as string);

          submissions.push({
            folder: folder.name,
            driveFolderId: folder.id,
            studentName: data.studentName || '',
            artisticDirection: data.artisticDirection || '',
            scores: data.scores || [],
            timestamp: data.timestamp || 0,
            blobDataUrl: data.blobDataUrl || null,
          });
        } catch {
          // Skip folders with missing or corrupt data
        }
      }),
    );

    submissions.sort((a, b) => b.timestamp - a.timestamp);
    return NextResponse.json({ submissions });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    console.error('[submissions/list]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
