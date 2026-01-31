# Quick Start Guide

Get your NSFWPH file download website up and running in minutes!

## 🚀 Quick Setup (5 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Supabase (3 steps)

**Step 1**: Create account at [supabase.com](https://supabase.com) and create a new project

**Step 2**: Get your credentials from **Settings > API**:
- Project URL
- anon/public key

**Step 3**: Create `.env` file:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Run Database Migration

1. In Supabase dashboard, go to **SQL Editor**
2. Open `supabase/migrations/001_initial_schema.sql`
3. Copy and paste into SQL Editor
4. Click **Run**

### 4. Create Admin User

1. Go to **Authentication > Users**
2. Click **Add user**
3. Enter email and password (save these!)

### 5. Start the App

```bash
npm run dev
```

### 6. Access Dashboard

1. Open `http://localhost:3000/login`
2. Login with your admin credentials
3. Start adding files!

## 📝 First Steps

1. **Add a File**: Dashboard > File Catalogue > Fill form > Save
2. **Add Links**: Dashboard > Link Redirects > Add your social links
3. **Customize**: Dashboard > Settings > Adjust colors
4. **View Page**: Click "View Page" on any file card

## 🎯 Key Features

- ✅ Mobile-first responsive design
- ✅ Dynamic download pages (`/file/:id`)
- ✅ Protected dashboard with authentication
- ✅ File management (CRUD operations)
- ✅ Link redirects management
- ✅ Customizable colors and appearance
- ✅ Persistent storage with Supabase

## 📁 Project Structure

```
src/
├── components/
│   ├── dashboard/        # Dashboard components
│   └── ProtectedRoute.jsx # Auth guard
├── pages/
│   ├── DownloadPage.jsx   # Main download page
│   ├── LoginPage.jsx      # Login page
│   └── Dashboard.jsx      # Dashboard layout
└── lib/
    └── supabase.js        # Supabase client
```

## 🔗 Routes

- `/` - Homepage (shows latest file)
- `/file/:id` - Specific file download page
- `/login` - Login page
- `/dashboard` - Protected dashboard

## 🐛 Troubleshooting

**Can't login?**
- Check user exists in Supabase Authentication
- Verify Email provider is enabled

**Database errors?**
- Verify migration ran successfully
- Check RLS policies in Supabase

**Environment variables not working?**
- Make sure `.env` is in root directory
- Restart dev server after adding `.env`

## 📚 Next Steps

- See `SETUP.md` for detailed setup
- See `STORJ_SETUP.md` for file storage integration
- See `README.md` for full documentation

## 🎨 Customization

All colors and styling can be customized in:
- **Dashboard > Settings** (for download pages)
- CSS files in `src/` directory (for dashboard)

Happy building! 🚀
