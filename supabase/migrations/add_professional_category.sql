-- Migration: Add 'professional' to projects_category_check constraint
-- This fixes the save error when editing aquapraca, biennale, and mondadori projects
-- which were inserted with category = 'professional'

ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_category_check;

ALTER TABLE public.projects ADD CONSTRAINT projects_category_check
  CHECK (category IN ('academic', 'freelance', 'competition', 'research', 'involvement', 'professional'));
