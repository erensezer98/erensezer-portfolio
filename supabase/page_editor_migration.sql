-- ============================================================
-- Page Editor + Text Styles — Migration
-- Run this in the Supabase SQL Editor to add visual page editing.
-- ============================================================

-- ─── Text Styles ─────────────────────────────────────────────────────────────
-- Predefined text styles that can be applied to any text block.
-- When a style is updated, every text block referencing it changes.

CREATE TABLE IF NOT EXISTS text_styles (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT        NOT NULL UNIQUE,
  font_size       TEXT        NOT NULL DEFAULT '1rem',
  font_weight     TEXT        NOT NULL DEFAULT '400',
  color           TEXT        NOT NULL DEFAULT '#282420',
  letter_spacing  TEXT        NOT NULL DEFAULT '0em',
  line_height     TEXT        NOT NULL DEFAULT '1.6',
  text_transform  TEXT        NOT NULL DEFAULT 'none',
  font_style      TEXT        NOT NULL DEFAULT 'normal',
  margin_bottom   TEXT        NOT NULL DEFAULT '0',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE text_styles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read"   ON text_styles FOR SELECT USING (true);
CREATE POLICY "Service write" ON text_styles FOR ALL    USING (true);


-- ─── Page Content ────────────────────────────────────────────────────────────
-- Stores the visual page layout as a JSON array of blocks per page.

CREATE TABLE IF NOT EXISTS page_content (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  page_slug   TEXT        UNIQUE NOT NULL,
  blocks      JSONB       NOT NULL DEFAULT '[]'::jsonb,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE page_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read"   ON page_content FOR SELECT USING (true);
CREATE POLICY "Service write" ON page_content FOR ALL    USING (true);


-- ─── Seed a few default text styles ──────────────────────────────────────────

INSERT INTO text_styles (name, font_size, font_weight, color, letter_spacing, line_height, text_transform, font_style) VALUES
  ('Hero Title',      'clamp(2.6rem, 6.5vw, 5.5rem)', '300', '#282420', '-0.02em', '1.08', 'none',      'normal'),
  ('Section Heading', '1.5rem',                        '300', '#282420', '-0.01em', '1.3',  'none',      'normal'),
  ('Body Text',       '0.875rem',                      '400', '#282420', '0em',     '1.75', 'none',      'normal'),
  ('Caption',         '0.75rem',                       '400', '#8c8278', '0.05em',  '1.6',  'uppercase', 'normal'),
  ('Subtitle',        '0.8125rem',                     '400', '#8c8278', '0em',     '1.6',  'none',      'normal')
ON CONFLICT (name) DO NOTHING;
