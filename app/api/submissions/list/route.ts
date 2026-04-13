import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const submissionsDir = path.join(process.cwd(), 'public', 'submissions');

    if (!fs.existsSync(submissionsDir)) {
      return NextResponse.json({ submissions: [] });
    }

    const entries = fs.readdirSync(submissionsDir, { withFileTypes: true });
    const submissions = [];

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      const folder = entry.name;
      const folderPath = path.join(submissionsDir, folder);
      const dataPath = path.join(folderPath, 'data.json');

      if (!fs.existsSync(dataPath)) continue;

      try {
        const raw = fs.readFileSync(dataPath, 'utf-8');
        const data = JSON.parse(raw);

        submissions.push({
          folder,
          studentName: data.studentName || '',
          artisticDirection: data.artisticDirection || '',
          scores: data.scores || [],
          timestamp: data.timestamp || 0,
          hasPhoto: fs.existsSync(path.join(folderPath, 'space-photo.jpg')),
          hasBlob: fs.existsSync(path.join(folderPath, 'blob.png')),
          hasVideo: fs.existsSync(path.join(folderPath, 'blob.webm')),
        });
      } catch {
        // Skip folders with invalid data.json
      }
    }

    // Sort by timestamp descending (newest first)
    submissions.sort((a, b) => b.timestamp - a.timestamp);

    return NextResponse.json({ submissions });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
