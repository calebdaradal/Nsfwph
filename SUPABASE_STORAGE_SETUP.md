# Supabase Storage Setup Guide

This guide will help you set up Supabase Storage for thumbnail uploads.

## Step 1: Create Storage Bucket

1. In your Supabase dashboard, go to **Storage**
2. Click **New bucket**
3. Create a bucket named `thumbnails`
4. Set the bucket to **Public** (so images can be accessed without authentication)
5. Click **Create bucket**

## Step 2: Set Up Storage Policies

After creating the bucket, you need to set up policies to allow:
- Authenticated users to upload files
- Public users to read/view files

### Option 1: Using SQL Editor (Recommended)

1. Go to **SQL Editor** in Supabase dashboard
2. Create a new query
3. Run the following SQL:

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

### Option 2: Using Storage UI

1. Go to **Storage** > **Policies**
2. Click on the `thumbnails` bucket
3. Click **New Policy**
4. Create policies for:
   - **INSERT**: Allow authenticated users
   - **UPDATE**: Allow authenticated users
   - **DELETE**: Allow authenticated users
   - **SELECT**: Allow public (for viewing images)

## Step 3: Verify Setup

1. Try uploading a thumbnail in the dashboard
2. Check that the image appears correctly
3. Verify the image URL is accessible publicly

## Troubleshooting

### Issue: "new row violates row-level security policy"

**Solution**: Make sure you've created the storage policies as shown above. The bucket must have policies that allow authenticated users to insert/update/delete.

### Issue: Images not displaying

**Solution**: 
1. Check that the bucket is set to **Public**
2. Verify the SELECT policy allows public access
3. Check the browser console for CORS errors

### Issue: Upload fails with permission error

**Solution**:
1. Make sure you're logged in to the dashboard
2. Verify your user has the `authenticated` role
3. Check that INSERT policy is correctly set up

## File Structure

The storage will organize files as follows:
- `thumbnails/files/` - Thumbnails for download files
- `thumbnails/links/` - Thumbnails for link redirects

## File Size Limits

- Maximum file size: 5MB (enforced in the frontend)
- Supported formats: All image formats (jpg, png, gif, webp, etc.)

## Security Notes

- Only authenticated users can upload files
- Public users can only view files (read-only)
- Files are automatically given unique names to prevent conflicts
- Old thumbnails are automatically deleted when replaced
