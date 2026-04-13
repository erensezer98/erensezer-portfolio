import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const isVercel = !!process.env.VERCEL;
const submissionsBase = isVercel
  ? '/tmp/submissions'
  : path.join(process.cwd(), 'public', 'submissions');

export async function GET() {
  try {
    if (!fs.existsSync(submissionsBase)) {
      return NextResponse.json({ submissions: [] });
    }

    const entries = fs.readdirSync(submissionsBase, { withFileTypes: true });
    const submissions = [];

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      const folder = entry.name;
      const folderPath = path.join(submissionsBase, folder);
      const dataPath = path.join(folderPath, 'data.json');

      if (!fs.existsSync(dataPath)) continue;

      try {
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

        submissions.push({
          folder,
          studentName: data.studentName || '',
          artisticDirection: data.artisticDirection || '',
          scores: data.scores || [],
          timestamp: data.timestamp || 0,
          // Include the inline blob image so the gallery works on Vercel
          // without needing to serve files from /tmp via a separate route.
          blobDataUrl: data.blobDataUrl || null,
          hasPhoto: fs.existsSync(path.join(folderPath, 'space-photo.jpg')),
          hasBlob: fs.existsSync(path.join(folderPath, 'blob.png')),
          hasVideo: fs.existsSync(path.join(folderPath, 'blob.webm')),
        });
      } catch {
        // Skip folders with corrupt data.json
      }
    }

    submissions.sort((a, b) => b.timestamp - a.timestamp);
    return NextResponse.json({ submissions });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
