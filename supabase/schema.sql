-- ============================================================
-- Eren Sezer Portfolio — Supabase Schema
-- Run this in the Supabase SQL Editor to set up all tables,
-- RLS policies, and seed your initial content.
-- ============================================================

-- ─── Extensions ─────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ─── Projects ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT        NOT NULL,
  slug          TEXT        UNIQUE NOT NULL,
  category      TEXT        NOT NULL CHECK (category IN ('academic','freelance','competition','research')),
  short_description TEXT,
  description   TEXT,
  year          INTEGER,
  location      TEXT,
  tags          TEXT[]      DEFAULT '{}',
  cover_image   TEXT,           -- Image URL (Google Drive: https://drive.google.com/uc?export=view&id=FILE_ID, or any public URL)
  images        TEXT[]      DEFAULT '{}',
  featured      BOOLEAN     DEFAULT false,
  order_index   INTEGER     DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Public read, authenticated write
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read"      ON projects FOR SELECT USING (true);
CREATE POLICY "Auth insert"      ON projects FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth update"      ON projects FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth delete"      ON projects FOR DELETE USING (auth.role() = 'authenticated');


-- ─── Awards ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS awards (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT        NOT NULL,
  organization  TEXT,
  year          INTEGER,
  description   TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE awards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read"      ON awards FOR SELECT USING (true);
CREATE POLICY "Auth insert"      ON awards FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth update"      ON awards FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth delete"      ON awards FOR DELETE USING (auth.role() = 'authenticated');


-- ─── Publications ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS publications (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT        NOT NULL,
  type          TEXT        NOT NULL CHECK (type IN ('publication','workshop','exhibition','lecture')),
  organization  TEXT,
  year          INTEGER,
  description   TEXT,
  url           TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE publications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read"      ON publications FOR SELECT USING (true);
CREATE POLICY "Auth insert"      ON publications FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth update"      ON publications FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth delete"      ON publications FOR DELETE USING (auth.role() = 'authenticated');


-- ─── Contact messages ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contact_messages (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT        NOT NULL,
  email         TEXT        NOT NULL,
  subject       TEXT,
  message       TEXT        NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Only owner can read; anyone can insert (public contact form)
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth read"        ON contact_messages FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Public insert"    ON contact_messages FOR INSERT WITH CHECK (true);


-- ─── Storage bucket for project images ───────────────────────────────────────
-- Images are now served from Google Drive (see lib/gdrive.ts for URL helpers).
-- The Supabase storage bucket below is kept for backwards compatibility with
-- any existing images that were uploaded before the migration.
-- INSERT INTO storage.buckets (id, name, public) VALUES ('project-images', 'project-images', true);


-- ─── Seed data ────────────────────────────────────────────────────────────────
-- Image URLs use Google Drive (lh3 CDN format: https://lh3.googleusercontent.com/d/FILE_ID).
-- Folder IDs are in lib/project-images.ts for reference. To fill in real images:
--   1. Upload the image to the matching Drive subfolder (Cover/, Gallery/, etc.).
--   2. Right-click → "Get link" → set to "Anyone with the link".
--   3. Copy the FILE_ID from: https://drive.google.com/file/d/FILE_ID/view
--   4. Replace the matching PLACEHOLDER_* below with that FILE_ID.
--   See lib/project-images.ts for the full folder→subfolder mapping.

INSERT INTO projects (title, slug, category, short_description, description, year, location, tags, cover_image, images, featured, order_index) VALUES
(
  'The Food Tower',
  'food-tower',
  'academic',
  'Vertical farm and factory in the MIND district, Milan. Shortlisted for Skyhive Skyscraper Challenge 2022.',
  'Our cities are changing, but will the same happen to our farms? The Food Tower is a research project in Milan''s MIND district, investigating how we can remove steps from the traditional food production chain, use different reusable materials, and push the limits of timber structure. A vertical factory where production, processing, packaging, sales, and recycling are all together on a small scale — removing logistics, the step that causes the most carbon emissions.',
  2022,
  'Milan, Italy',
  ARRAY['vertical farm', 'skyscraper', 'timber structure', 'sustainable', 'MIND Milano'],
  -- Cover/ folder: 1ljdHLS_rgnSdmZjeQo-UE2ElKeqaP8ND
  'https://lh3.googleusercontent.com/d/PLACEHOLDER_FOOD_TOWER_COVER',
  ARRAY[
    -- Gallery/ folder: 1vVqV0-Yq3yGZMcZm1yRQFEmmGyZ88mou
    'https://lh3.googleusercontent.com/d/PLACEHOLDER_FOOD_TOWER_GALLERY_1',
    'https://lh3.googleusercontent.com/d/PLACEHOLDER_FOOD_TOWER_GALLERY_2'
  ],
  true,
  1
),
(
  'Istanbul: A Way Out',
  'istanbul-a-way-out',
  'academic',
  '',
  '',
  2021,
  'Istanbul, Turkey',
  ARRAY[],
  -- Cover/ folder: 1U4aOqHbrSbRLy5Usgm56RT1j-uMq6z7b
  'https://lh3.googleusercontent.com/d/PLACEHOLDER_ISTANBUL_COVER',
  ARRAY[
    -- Gallery/ folder: 1ABcdVmJEyhgyf7JzcYKSbcm5xoxLIHAL
    'https://lh3.googleusercontent.com/d/PLACEHOLDER_ISTANBUL_GALLERY_1',
    'https://lh3.googleusercontent.com/d/PLACEHOLDER_ISTANBUL_GALLERY_2'
  ],
  false,
  5
),
(
  'The Log',
  'the-log',
  'academic',
  'Auditorium project exploring organic timber form in Milan.',
  'An acoustic and spatial research into the possibilities of curved timber construction. The Log explores the envelope of an auditorium as a structural and acoustic device, dissolving the boundary between structure, skin, and interior.',
  2021,
  'Milan, Italy',
  ARRAY['auditorium', 'timber', 'acoustics', 'structure'],
  -- Cover/ folder: 1gyy9k3PrJviqumemgYfI2jFyTsytQqsb
  'https://lh3.googleusercontent.com/d/PLACEHOLDER_THE_LOG_COVER',
  ARRAY[
    -- Gallery/ folder: 1Z22HbiZ9T2gvIimEFsZA4swUHSqvV2aq
    'https://lh3.googleusercontent.com/d/PLACEHOLDER_THE_LOG_GALLERY_1',
    'https://lh3.googleusercontent.com/d/PLACEHOLDER_THE_LOG_GALLERY_2'
  ],
  true,
  2
),
(
  'Haliç Co-op',
  'halic-co-op',
  'academic',
  'Creative Industries Center in Goldenhorn, Istanbul. Selected by Mimdap Architecture Magazine.',
  'A Creative Industries Center positioned at the intersection of Goldenhorn''s industrial heritage and the emerging creative economy of Istanbul. The project was selected and published by Mimdap Architecture Magazine.',
  2020,
  'Istanbul, Turkey',
  ARRAY['cultural', 'creative hub', 'istanbul', 'adaptive reuse'],
  -- Cover/ folder: 1LNibehFc2ES03OP8dBzPz3HNF5G5SP1h
  'https://lh3.googleusercontent.com/d/PLACEHOLDER_HALIC_COVER',
  ARRAY[
    -- Gallery/ folder: 1GDmxo4sBO8sxmo44KM8CYv_gMOUXgPzH
    'https://lh3.googleusercontent.com/d/PLACEHOLDER_HALIC_GALLERY_1',
    'https://lh3.googleusercontent.com/d/PLACEHOLDER_HALIC_GALLERY_2'
  ],
  true,
  3
),
(
  'Csarda',
  'csarda',
  'freelance',
  'Pavilion design for the World Scout Jamboree in Saemangeum, South Korea.',
  'A freelance pavilion design for the Saemangeum World Scout Jamboree. The structure reinterprets the csárda typology — the vernacular countryside inn — through lightweight timber construction, using folded triangular panels to create a canopy that is both culturally legible and structurally efficient.',
  2022,
  'Saemangeum, South Korea',
  ARRAY['pavilion', 'festival', 'temporary', 'folded plate'],
  -- Cover/ folder: 12yBl4l0DFEbBmpldmPnxsjIlSPQ3J3n9
  'https://lh3.googleusercontent.com/d/PLACEHOLDER_CSARDA_COVER',
  ARRAY[
    -- Gallery/ folder: 1qFWHoUyXdqvzqIyBxcS1v-MjdmUfhBjY
    'https://lh3.googleusercontent.com/d/PLACEHOLDER_CSARDA_GALLERY_1',
    'https://lh3.googleusercontent.com/d/PLACEHOLDER_CSARDA_GALLERY_2'
  ],
  true,
  4
);


INSERT INTO awards (title, organization, year, description) VALUES
(
  'Buildner Skyhive Skyscrapers Challenge — Shortlisted',
  'Buildner',
  2022,
  'Shortlisted project: The Food Tower, Vertical Farm and Factory in Milano.'
),
(
  'Student Projects Selection',
  'Mimdap Architecture Magazine',
  2020,
  'Haliç CO-OP · Creative Industries Center, Istanbul.'
),
(
  'Jury''s Selection Award — Inter-universities Latin Dances Competition',
  'FMV Işık University',
  2019,
  'Modern · Latin Fusion Choreography, Istanbul.'
),
(
  'Introduction to Basic Programming Certificate',
  'Istanbul Business Institute',
  2019,
  NULL
),
(
  'IELTS English Certificate',
  'IELTS',
  2018,
  'Academic Score: 7.5/9'
);


INSERT INTO publications (title, type, organization, year, description, url) VALUES
(
  'Buildner Skyhive Skyscrapers Challenge — Shortlisted Project Publication',
  'publication',
  'Buildner',
  2022,
  'The Food Tower shortlisted and featured in the Buildner annual skyscraper publication.',
  NULL
),
(
  'Mimdap Architecture Magazine — Student Projects Issue',
  'publication',
  'Mimdap',
  2020,
  'Haliç CO-OP selected and published in the student projects edition of Mimdap Architecture Magazine.',
  NULL
),
(
  'School of Architecture Representative — Student Council',
  'workshop',
  'FMV Işık University',
  2019,
  'Planning and budgeting student-made projects. Inter-university meetings with Architecture Schools, Istanbul.',
  NULL
),
(
  'Işık Dance Club — Executive Member',
  'workshop',
  'FMV Işık University',
  2018,
  'Organisation of inter-university events, management of 50+ members, Latin dances trainer. Istanbul.',
  NULL
);
