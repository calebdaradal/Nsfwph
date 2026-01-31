# Storj Integration Guide

This guide will help you set up Storj for file storage integration with your NSFWPH application.

## Prerequisites

- Storj account (sign up at [storj.io](https://storj.io))
- Storj bucket created
- Access credentials (Access Key ID and Secret Access Key)

## Step 1: Create Storj Account and Bucket

1. Sign up at [storj.io](https://storj.io)
2. Create a new project
3. Create a bucket for your files
4. Generate access credentials:
   - Go to **Access** > **Create Access Grant**
   - Choose permissions (Read & Write recommended)
   - Save your credentials securely

## Step 2: Install Storj SDK

```bash
npm install @storj/storj
```

## Step 3: Environment Variables

Add to your `.env` file:

```env
VITE_STORJ_ACCESS_KEY_ID=your_access_key_id
VITE_STORJ_SECRET_ACCESS_KEY=your_secret_access_key
VITE_STORJ_ENDPOINT=https://gateway.storjshare.io
VITE_STORJ_BUCKET_NAME=your_bucket_name
```

**Note**: For production, these should be stored server-side, not in client-side environment variables. Consider using a backend API for file uploads.

## Step 4: Integration Points

### File Upload Service

Create a service file for handling Storj uploads:

```javascript
// src/lib/storj.js
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

const storjClient = new S3Client({
  endpoint: import.meta.env.VITE_STORJ_ENDPOINT,
  region: 'us-east-1',
  credentials: {
    accessKeyId: import.meta.env.VITE_STORJ_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.VITE_STORJ_SECRET_ACCESS_KEY,
  },
})

export const uploadFileToStorj = async (file, fileName) => {
  const command = new PutObjectCommand({
    Bucket: import.meta.env.VITE_STORJ_BUCKET_NAME,
    Key: fileName,
    Body: file,
    ContentType: file.type,
  })

  try {
    await storjClient.send(command)
    const fileUrl = `${import.meta.env.VITE_STORJ_ENDPOINT}/${import.meta.env.VITE_STORJ_BUCKET_NAME}/${fileName}`
    return fileUrl
  } catch (error) {
    console.error('Error uploading to Storj:', error)
    throw error
  }
}
```

### Update File Catalogue Component

Modify the FileCatalogue component to support file uploads:

1. Add file input for thumbnail upload
2. Add file input for download file upload
3. Upload files to Storj before saving to database
4. Store Storj URLs in database

## Step 5: Security Considerations

**Important**: For production use:

1. **Never expose Storj credentials in client-side code**
2. Create a backend API endpoint for file uploads
3. Use server-side authentication
4. Implement file size limits
5. Validate file types
6. Use signed URLs for downloads

## Recommended Architecture

```
Client (React) 
  ↓
Backend API (Node.js/Express)
  ↓
Storj Storage
```

This ensures:
- Credentials stay secure
- Better control over uploads
- Ability to process files before storage
- Proper error handling

## Next Steps

1. Set up backend API for file uploads
2. Integrate file upload in FileCatalogue
3. Update download links to use Storj URLs
4. Implement file management (delete, update)
5. Add progress indicators for uploads

## Alternative: Direct Client Upload (Not Recommended for Production)

If you need direct client uploads for development:

1. Use presigned URLs from your backend
2. Implement CORS properly
3. Add rate limiting
4. Monitor usage carefully
