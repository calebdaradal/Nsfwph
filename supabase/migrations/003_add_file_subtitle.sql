-- Add optional subtitle field to files table
ALTER TABLE files 
ADD COLUMN IF NOT EXISTS subtitle TEXT;
