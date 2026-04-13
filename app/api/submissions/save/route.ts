import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import { Readable } from 'stream';

// ── Google Drive auth (service account) ─────────────────────────────────
// Set these in Vercel env vars / .env.local:
//   GOOGLE_SERVICE_ACCOUNT_EMAIL   e.g. workshop@my-project.iam.gserviceaccount.com
//   GOOGLE_PRIVATE_KEY             the private key from the JSON (with \n for newlines)
//   GOOGLE_DRIVE_FOLDER_ID         the ID of the shared Drive folder

function getDriveClient() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key   = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (!email || !key) throw new Error('Google credentials not configured');

  const auth = new JWT({
    email,
    key,
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  });
  return google.drive({ version: 'v3', auth });
}

async function uploadFile(
  drive: ReturnType<typeof google.drive>,
  parentId: string,
  name: string,
  mimeType: string,
  dataUrl: string,
) {
  const comma  = dataUrl.indexOf(',');
  const b64    = comma !== -1 ? dataUrl.slice(comma + 1) : dataUrl;
  const buffer = Buffer.from(b64, 'base64');

  await drive.files.create({
    requestBody: { name, parents: [parentId] },
    media: { mimeType, body: Readable.from(buffer) },
    fields: 'id',
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      studentName,
      imageBase64,
      blobImageBase64,
      blobVideoBase64,
      artisticDirection,
      scores,
    } = body;

    if (!studentName || typeof studentName !== 'string') {
      return NextResponse.json({ error: 'studentName is required' }, { status: 400 });
    }

    const drive    = getDriveClient();
    const rootId   = process.env.GOOGLE_DRIVE_FOLDER_ID;
    if (!rootId) throw new Error('GOOGLE_DRIVE_FOLDER_ID not set');

    const timestamp = Date.now();
    const sanitized = studentName.trim().replace(/[^a-z0-9 ]/gi, '').trim();
    const folderName = `${sanitized} — ${new Date(timestamp).toISOString().slice(0, 10)}`;

    // Create a subfolder for this student
    const folderRes = await drive.files.create({
      requestBody: {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [rootId],
      },
      fields: 'id',
    });
    const folderId = folderRes.data.id!;

    // Upload files in parallel
    const uploads: Promise<void>[] = [];

    if (imageBase64) {
      uploads.push(uploadFile(drive, folderId, 'space-photo.jpg', 'image/jpeg', imageBase64));
    }
    if (blobImageBase64) {
      uploads.push(uploadFile(drive, folderId, 'blob.png', 'image/png', blobImageBase64));
    }
    if (blobVideoBase64) {
      uploads.push(uploadFile(drive, folderId, 'blob.webm', 'video/webm', blobVideoBase64));
    }

    // data.json with inline blob for gallery
    const dataJson = JSON.stringify({
      studentName,
      artisticDirection: artisticDirection || '',
      scores: scores || [],
      timestamp,
      blobDataUrl: blobImageBase64 || null,
      driveFolderId: folderId,
    });
    uploads.push(
      drive.files.create({
        requestBody: { name: 'data.json', parents: [folderId] },
        media: { mimeType: 'application/json', body: Readable.from(Buffer.from(dataJson)) },
        fields: 'id',
      }).then(() => undefined),
    );

    await Promise.all(uploads);

    return NextResponse.json({ ok: true, folder: folderName, driveFolderId: folderId });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    console.error('[submissions/save]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
