# NSFWPH - File Download Website

A dynamic file download website built with React.js, featuring a mobile-first design and a dashboard for managing files and links.

## Features

- **Dynamic Download Pages**: Create custom download pages for files with thumbnails, titles, and download buttons
- **Link Redirects**: Customize "Want more?" section with Linktree-style links
- **Settings**: Customize colors and appearance
- **Authentication**: Protected dashboard with login system
- **Mobile-First Design**: Responsive design optimized for mobile devices

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key
3. Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Set Up Database Tables

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
4. Click "Run" to execute the SQL
5. Verify tables were created by going to **Table Editor**

The migration file includes:
- All necessary tables (files, link_redirects, settings)
- Row Level Security (RLS) policies
- Automatic timestamp updates
- Public read access for download pages
- Authenticated user access for dashboard operations

### 4. Set Up Authentication

1. In Supabase Dashboard, go to Authentication > Providers
2. Enable Email provider
3. Create a user account for dashboard access

### 5. Run the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Project Structure

```
src/
├── components/
│   ├── dashboard/
│   │   ├── FileCatalogue.jsx
│   │   ├── LinkRedirects.jsx
│   │   └── Settings.jsx
│   └── ProtectedRoute.jsx
├── lib/
│   └── supabase.js
├── pages/
│   ├── Dashboard.jsx
│   ├── DownloadPage.jsx
│   └── LoginPage.jsx
├── App.jsx
├── main.jsx
└── index.css
```

## Usage

1. **Access Dashboard**: Navigate to `/dashboard` and login
2. **Add Files**: Go to File Catalogue, fill in the form, and save
3. **Customize Links**: Go to Link Redirects to add/edit links
4. **Customize Appearance**: Go to Settings to change colors
5. **View Pages**: Each file gets its own page at `/file/:id`

## Next Steps

- Set up Storj for file storage
- Configure additional Supabase features
- Deploy to production
