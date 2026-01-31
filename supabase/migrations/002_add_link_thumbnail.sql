-- Add thumbnail column to link_redirects table
ALTER TABLE link_redirects 
ADD COLUMN IF NOT EXISTS thumbnail TEXT;
