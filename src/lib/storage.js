import { supabase } from './supabase'

/**
 * Upload a file to Supabase Storage
 * @param {File} file - The file to upload
 * @param {string} bucket - The storage bucket name
 * @param {string} folder - The folder path within the bucket (e.g., 'thumbnails', 'files')
 * @returns {Promise<string>} Public URL of the uploaded file
 */
export const uploadFile = async (file, bucket, folder = '') => {
  try {
    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`
    const filePath = folder ? `${folder}/${fileName}` : fileName

    // Upload file
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) throw error

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)

    return publicUrl
  } catch (error) {
    console.error('Error uploading file:', error)
    throw error
  }
}

/**
 * Delete a file from Supabase Storage
 * @param {string} bucket - The storage bucket name
 * @param {string} filePath - The path to the file to delete
 */
export const deleteFile = async (bucket, filePath) => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath])

    if (error) throw error
  } catch (error) {
    console.error('Error deleting file:', error)
    throw error
  }
}

/**
 * Extract file path from Supabase Storage URL
 * @param {string} url - The public URL
 * @returns {string|null} The file path or null if not a Supabase Storage URL
 */
export const extractFilePathFromUrl = (url) => {
  if (!url) return null
  
  // Supabase Storage URLs typically look like:
  // https://[project-id].supabase.co/storage/v1/object/public/[bucket]/[path]
  const match = url.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)$/)
  return match ? match[1] : null
}
