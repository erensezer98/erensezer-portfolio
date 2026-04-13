import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { Readable } from 'stream';

function getDriveClient() {
  const clientId     = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) throw new Error('Google OAuth not configured');
  const oauth2 = new google.auth.OAuth2(clientId, clientSecret, 'https://developers.google.com/oauthplayground');
  oauth2.setCredentials({ refresh_token: refreshToken });
  return google.drive({ version: 'v3', auth: oauth2 });
}

export async function DELETE(req: NextRequest) {
  try {
    const { driveFolderId } = await req.json();
    if (!driveFolderId) return NextResponse.json({ error: 'driveFolderId required' }, { status: 400 });

    const drive  = getDriveClient();
    const rootId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    if (!rootId) throw new Error('GOOGLE_DRIVE_FOLDER_ID not set');

    // Trash the student folder on Drive
    await drive.files.delete({ fileId: driveFolderId });

    // Update master submissions.json — remove this entry
    const listRes = await drive.files.list({
      q: `'${rootId}' in parents and name='submissions.json' and trashed=false`,
      fields: 'files(id)',
    });
    const masterFile = listRes.data.files?.[0];
    if (masterFile?.id) {
      const content = await drive.files.get(
        { fileId: masterFile.id, alt: 'media' },
        { responseType: 'text' },
      );
      let masterData: { driveFolderId?: string }[] = [];
      try { masterData = JSON.parse(content.data as string); } catch { masterData = []; }
      masterData = masterData.filter(s => s.driveFolderId !== driveFolderId);

      await drive.files.update({
        fileId: masterFile.id,
        media: {
          mimeType: 'application/json',
          body: Readable.from(Buffer.from(JSON.stringify(masterData))),
        },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    console.error('[submissions/delete]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
