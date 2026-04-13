import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { Readable } from 'stream';

// ── Google Drive auth (Supports both Service Account and OAuth2) ─────────────────
function getDriveClient() {
  // Priority 1: Service Account (easier for shared folders)
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

  // Priority 2: OAuth2 Refresh Token (standard user auth)
  const clientId     = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  
  if (clientId && clientSecret && refreshToken) {
    const oauth2 = new google.auth.OAuth2(clientId, clientSecret, 'https://developers.google.com/oauthplayground');
    oauth2.setCredentials({ refresh_token: refreshToken });
    return google.drive({ version: 'v3', auth: oauth2 });
  }

  throw new Error('Google Drive credentials not configured. Please set GOOGLE_SERVICE_ACCOUNT_JSON or (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN).');
}

async function uploadFile(
  drive: any, // eslint-disable-line @typescript-eslint/no-explicit-any
  parentId: string,
  name: string,
  mimeType: string,
  dataUrl: string,
) {
  const comma  = dataUrl.indexOf(',');
  const b64    = comma !== -1 ? dataUrl.slice(comma + 1) : dataUrl;
  const buffer = Buffer.from(b64, 'base64');

  const res = await drive.files.create({
    requestBody: { name, parents: [parentId] },
    media: { mimeType, body: Readable.from(buffer) },
    fields: 'id',
  });
  return res.data.id;
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
    const dateStr = new Date(timestamp).toISOString().slice(0, 10);
    const sanitized = studentName.trim().replace(/[^a-z0-9 ]/gi, '').trim();
    const folderName = `${sanitized} — ${dateStr}`;

    // 1. Create a subfolder for this student
    const folderRes = await drive.files.create({
      requestBody: {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [rootId],
      },
      fields: 'id',
    });
    const folderId = folderRes.data.id!;

    // 2. Upload files
    // We do these sequentially or capture results to get IDs
    const spacePhotoId = imageBase64 ? await uploadFile(drive, folderId, 'space-photo.jpg', 'image/jpeg', imageBase64) : null;
    const blobImageId = blobImageBase64 ? await uploadFile(drive, folderId, 'blob.png', 'image/png', blobImageBase64) : null;
    const blobVideoId = blobVideoBase64 ? await uploadFile(drive, folderId, 'blob.webm', 'video/webm', blobVideoBase64) : null;

    // Individual data.json for this student
    const submissionData = {
      studentName,
      artisticDirection: artisticDirection || '',
      scores: scores || [],
      timestamp,
      date: dateStr,
      driveFolderId: folderId,
      spacePhotoId,
      blobImageId,
      blobVideoId,
      // We keep a small preview link for the gallery in the master log
      blobDataUrl: blobImageBase64 ? blobImageBase64.slice(0, 100) + '...' : null // Placeholder for local compat, but we'll use IDs
    };

    await drive.files.create({
      requestBody: { name: 'data.json', parents: [folderId] },
      media: { mimeType: 'application/json', body: Readable.from(Buffer.from(JSON.stringify(submissionData))) },
      fields: 'id',
    });

    // 3. Update master JSON log at the root folder
    try {
      const listRes = await drive.files.list({
        q: `'${rootId}' in parents and name='submissions.json' and trashed=false`,
        fields: 'files(id)',
      });
      const masterFile = listRes.data.files?.[0];

      let masterData = [];
      if (masterFile?.id) {
        const content = await drive.files.get({ fileId: masterFile.id, alt: 'media' }, { responseType: 'text' });
        try {
          masterData = JSON.parse(content.data as string);
          if (!Array.isArray(masterData)) masterData = [];
        } catch { masterData = []; }
      }

      // Add new submission to the top
      // Store IDs, NOT the full base64 in the master log to keep it small!
      masterData.unshift({
        studentName,
        artisticDirection: (artisticDirection || '').slice(0, 200),
        scores: scores || [],
        timestamp,
        date: dateStr,
        folder: folderName,
        driveFolderId: folderId,
        blobImageId,
        blobVideoId
      });

      if (masterData.length > 500) masterData = masterData.slice(0, 500);

      const media = {
        mimeType: 'application/json',
        body: Readable.from(Buffer.from(JSON.stringify(masterData))),
      };

      if (masterFile?.id) {
        await drive.files.update({ fileId: masterFile.id, media });
      } else {
        await drive.files.create({
          requestBody: { name: 'submissions.json', parents: [rootId] },
          media,
        });
      }
    } catch (e) {
      console.error('Failed to update master JSON:', e);
    }

    return NextResponse.json({ ok: true, folder: folderName, driveFolderId: folderId });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    console.error('[submissions/save]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


