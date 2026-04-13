import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { studentName, imageBase64, blobImageBase64, blobVideoBase64, artisticDirection, scores } = body;

    if (!studentName || typeof studentName !== 'string') {
      return NextResponse.json({ error: 'studentName is required' }, { status: 400 });
    }

    // Sanitize student name: replace spaces and special chars with hyphens
    const sanitized = studentName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/gi, '-')
      .replace(/^-+|-+$/g, '');

    const timestamp = Date.now();
    const folderName = `${sanitized}-${timestamp}`;
    const submissionsDir = path.join(process.cwd(), 'public', 'submissions');
    const folderPath = path.join(submissionsDir, folderName);

    // Ensure submissions root exists
    if (!fs.existsSync(submissionsDir)) {
      fs.mkdirSync(submissionsDir, { recursive: true });
    }

    fs.mkdirSync(folderPath, { recursive: true });

    // Helper to strip data URL prefix and write binary
    function saveBase64File(dataUrl: string, filePath: string) {
      const comma = dataUrl.indexOf(',');
      const base64 = comma !== -1 ? dataUrl.slice(comma + 1) : dataUrl;
      fs.writeFileSync(filePath, Buffer.from(base64, 'base64'));
    }

    // Save space photo
    if (imageBase64) {
      saveBase64File(imageBase64, path.join(folderPath, 'space-photo.jpg'));
    }

    // Save blob PNG
    if (blobImageBase64) {
      saveBase64File(blobImageBase64, path.join(folderPath, 'blob.png'));
    }

    // Save blob webm video
    if (blobVideoBase64) {
      saveBase64File(blobVideoBase64, path.join(folderPath, 'blob.webm'));
    }

    // Save data.json
    const data = {
      studentName,
      artisticDirection: artisticDirection || '',
      scores: scores || [],
      timestamp,
    };
    fs.writeFileSync(path.join(folderPath, 'data.json'), JSON.stringify(data, null, 2));

    const folder = `submissions/${folderName}`;
    return NextResponse.json({ ok: true, folder });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
