-- Files table for storing download file information
CREATE TABLE IF NOT EXISTS files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  thumbnail TEXT,
  title TEXT NOT NULL,
  download_link TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Link redirects table for "Want more?" section
CREATE TABLE IF NOT EXISTS link_redirects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  button_link TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Settings table for customizing appearance
CREATE TABLE IF NOT EXISTS settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  button_color TEXT DEFAULT '#6366f1',
  background_color TEXT DEFAULT '#0f172a',
  card_background TEXT DEFAULT '#1e293b',
  text_primary TEXT DEFAULT '#f1f5f9',
  text_secondary TEXT DEFAULT '#cbd5e1',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE link_redirects ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (download pages)
CREATE POLICY "Public read access on files" ON files
  FOR SELECT USING (true);

CREATE POLICY "Public read access on link_redirects" ON link_redirects
  FOR SELECT USING (true);

CREATE POLICY "Public read access on settings" ON settings
  FOR SELECT USING (true);

-- Create policies for authenticated users (dashboard)
-- Note: These allow all operations for authenticated users
-- You may want to restrict this further based on your needs
CREATE POLICY "Authenticated users can manage files" ON files
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage link_redirects" ON link_redirects
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage settings" ON settings
  FOR ALL USING (auth.role() = 'authenticated');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_files_updated_at BEFORE UPDATE ON files
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_link_redirects_updated_at BEFORE UPDATE ON link_redirects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
