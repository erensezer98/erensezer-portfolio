import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// On Vercel (and other serverless), process.cwd() is read-only (/var/task).
// Only /tmp is writable. Locally we write into public/submissions so files
// are served as static assets. On Vercel we write to /tmp/submissions and
// serve them through the /api/submissions/file route.
const isVercel = !!process.env.VERCEL;
const submissionsBase = isVercel
  ? '/tmp/submissions'
  : path.join(process.cwd(), 'public', 'submissions');

function saveBase64File(dataUrl: string, filePath: string) {
  const comma = dataUrl.indexOf(',');
  const base64 = comma !== -1 ? dataUrl.slice(comma + 1) : dataUrl;
  fs.writeFileSync(filePath, Buffer.from(base64, 'base64'));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { studentName, imageBase64, blobImageBase64, blobVideoBase64, artisticDirection, scores } = body;

    if (!studentName || typeof studentName !== 'string') {
      return NextResponse.json({ error: 'studentName is required' }, { status: 400 });
    }

    const sanitized = studentName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/gi, '-')
      .replace(/^-+|-+$/g, '');

    const timestamp = Date.now();
    const folderName = `${sanitized}-${timestamp}`;
    const folderPath = path.join(submissionsBase, folderName);

    fs.mkdirSync(folderPath, { recursive: true });

    if (imageBase64) {
      saveBase64File(imageBase64, path.join(folderPath, 'space-photo.jpg'));
    }
    if (blobImageBase64) {
      saveBase64File(blobImageBase64, path.join(folderPath, 'blob.png'));
    }
    if (blobVideoBase64) {
      saveBase64File(blobVideoBase64, path.join(folderPath, 'blob.webm'));
    }

    // Store blobImageBase64 inline in data.json so the gallery can render
    // it without needing a separate file-serving route (important on Vercel
    // where /tmp files can't be served as static assets directly).
    const data = {
      studentName,
      artisticDirection: artisticDirection || '',
      scores: scores || [],
      timestamp,
      blobDataUrl: blobImageBase64 || null,
    };
    fs.writeFileSync(path.join(folderPath, 'data.json'), JSON.stringify(data));

    return NextResponse.json({ ok: true, folder: `submissions/${folderName}` });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
