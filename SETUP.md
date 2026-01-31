# Setup Guide

This guide will walk you through setting up the NSFWPH file download website.

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A Supabase account (free tier works)
- A Storj account (for file storage - optional for now)

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Supabase

### 2.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in your project details:
   - Name: `nsfwph` (or any name you prefer)
   - Database Password: Choose a strong password (save it!)
   - Region: Choose the closest region
4. Wait for the project to be created (takes a few minutes)

### 2.2 Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** > **API**
2. Copy the following:
   - **Project URL** (under "Project URL") https://jjhxcnjalyxoxfgbgtqf.supabase.co
   - **anon/public key** (under "Project API keys" > "anon public") eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqaHhjbmphbHl4b3hmZ2JndHFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0NTA5ODYsImV4cCI6MjA4NTAyNjk4Nn0.Ebd-XVm2IPhdjIz54sNI8ydhqqVxTyG1jLIoqrRSBBw

### 2.3 Create Environment File

1. Create a `.env` file in the root directory
2. Add your credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 2.4 Set Up Database Tables

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
4. Click "Run" to execute the SQL
5. Verify tables were created by going to **Table Editor**

### 2.5 Set Up Authentication

1. In Supabase dashboard, go to **Authentication** > **Providers**
2. Make sure **Email** provider is enabled
3. Go to **Authentication** > **Users**
4. Click "Add user" to create your dashboard admin account
   - Enter email and password
   - Email confirmation can be disabled for development

### 2.6 Set Up Supabase Storage

1. In Supabase dashboard, go to **Storage**
2. Click **New bucket**
3. Create a bucket named `thumbnails`
4. Set the bucket to **Public**
5. Click **Create bucket**
6. Go to **SQL Editor** and run the storage policies (see `SUPABASE_STORAGE_SETUP.md` for details)

**Quick SQL for Storage Policies:**
```sql
-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload thumbnails"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'thumbnails');

-- Allow authenticated users to update their own files
CREATE POLICY "Authenticated users can update thumbnails"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'thumbnails');

-- Allow authenticated users to delete files
CREATE POLICY "Authenticated users can delete thumbnails"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'thumbnails');

-- Allow public to read/view files
CREATE POLICY "Public can view thumbnails"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'thumbnails');
```

## Step 3: Run Additional Migrations

1. In Supabase dashboard, go to **SQL Editor**
2. Run the migration `supabase/migrations/002_add_link_thumbnail.sql` to add thumbnail column to link_redirects table

## Step 4: Test the Application

1. Start the development server:

```bash
npm run dev
```

2. Open `http://localhost:3000` in your browser
3. Navigate to `http://localhost:3000/login` and login with your admin account
4. You should now be able to access the dashboard at `http://localhost:3000/dashboard`

## Step 5: Set Up Storj (Optional - For Later)

Storj integration will be set up in the next phase. For now, you can use direct download links from any hosting service.

### Storj Setup (Coming Soon)

1. Create a Storj account at [storj.io](https://storj.io)
2. Create a bucket for your files
3. Generate access credentials
4. We'll integrate Storj in the next phase

## Troubleshooting

### Issue: "Supabase credentials not found"

**Solution**: Make sure your `.env` file is in the root directory and contains both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

### Issue: "Failed to load files" in dashboard

**Solution**: 
1. Check that the database tables were created successfully
2. Verify your RLS policies are set up correctly
3. Check the browser console for specific error messages

### Issue: Can't login to dashboard

**Solution**:
1. Make sure you created a user in Supabase Authentication
2. Check that Email provider is enabled
3. Try resetting your password if needed

### Issue: RLS Policy Errors

**Solution**: The migration file includes policies, but if you're getting permission errors:
1. Go to Supabase Dashboard > Authentication > Policies
2. Check that policies are created for all three tables
3. You may need to temporarily disable RLS for testing (not recommended for production)

## Next Steps

1. Add your first file in the File Catalogue
2. Customize your link redirects
3. Adjust colors in Settings
4. Test the download page

## Production Deployment

When ready to deploy:

1. Build the project: `npm run build`
2. Deploy the `dist` folder to your hosting service (Vercel, Netlify, etc.)
3. Make sure to set environment variables in your hosting platform
4. Update CORS settings in Supabase if needed
