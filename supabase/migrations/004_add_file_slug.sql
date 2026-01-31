-- Add slug column for clean, title-based URLs (case-sensitive, unique)
ALTER TABLE files ADD COLUMN IF NOT EXISTS slug TEXT;

-- Backfill slug from title: spaces -> hyphens, remove non-alphanumeric, preserve case
UPDATE files
SET slug = trim(both '-' from regexp_replace(
  regexp_replace(
    regexp_replace(trim(title), '\s+', '-', 'g'),
    '[^a-zA-Z0-9\-]', '', 'g'
  ),
  '-+', '-', 'g'
))
WHERE slug IS NULL;

-- Empty slug fallback (e.g. title was only special chars): use short id
UPDATE files SET slug = left(id::text, 8) WHERE slug = '' OR slug IS NULL;

-- De-duplicate slugs: keep first per slug (by created_at), append short id to rest
WITH numbered AS (
  SELECT id, slug, row_number() OVER (PARTITION BY slug ORDER BY created_at) AS rn
  FROM files
)
UPDATE files f
SET slug = f.slug || '-' || left(f.id::text, 8)
FROM numbered n
WHERE n.id = f.id AND n.rn > 1;

-- Enforce uniqueness
ALTER TABLE files ALTER COLUMN slug SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS files_slug_key ON files (slug);

-- Unique titles (case-sensitive)
CREATE UNIQUE INDEX IF NOT EXISTS files_title_key ON files (title);
