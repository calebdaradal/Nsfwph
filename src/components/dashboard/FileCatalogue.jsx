import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { uploadFile, deleteFile, extractFilePathFromUrl } from '../../lib/storage'
import { slugify } from '../../lib/slugify'
import './FileCatalogue.css'

function FileCatalogue() {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    download_link: '',
    thumbnail: '',
    subtitle: '',
  })
  const [thumbnailFile, setThumbnailFile] = useState(null)
  const [thumbnailPreview, setThumbnailPreview] = useState(null)
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    loadFiles()
  }, [])

  const loadFiles = async () => {
    try {
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setFiles(data || [])
    } catch (error) {
      console.error('Error loading files:', error)
    }
  }

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        return
      }

      setThumbnailFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setThumbnailPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setUploading(true)

    try {
      let thumbnailUrl = formData.thumbnail

      // Upload thumbnail if a new file is selected
      if (thumbnailFile) {
        // Delete old thumbnail if editing
        if (editingId && formData.thumbnail) {
          const oldFilePath = extractFilePathFromUrl(formData.thumbnail)
          if (oldFilePath) {
            try {
              await deleteFile('thumbnails', oldFilePath)
            } catch (error) {
              console.warn('Failed to delete old thumbnail:', error)
            }
          }
        }

        // Upload new thumbnail
        thumbnailUrl = await uploadFile(thumbnailFile, 'thumbnails', 'files')
      }

      const slug = slugify(formData.title) || `file-${Date.now()}`
      const subtitleNum = String(formData.subtitle || '').replace(/\D/g, '')
      const subtitleValue = subtitleNum ? `${subtitleNum}mb size` : ''
      const dataToSave = {
        ...formData,
        thumbnail: thumbnailUrl,
        slug,
        subtitle: subtitleValue,
      }

      if (editingId) {
        // Update existing file
        const { error } = await supabase
          .from('files')
          .update(dataToSave)
          .eq('id', editingId)

        if (error) throw error
      } else {
        // Create new file
        const { error } = await supabase
          .from('files')
          .insert([dataToSave])

        if (error) throw error
      }

      // Reset form
      setFormData({ title: '', download_link: '', thumbnail: '', subtitle: '' })
      setThumbnailFile(null)
      setThumbnailPreview(null)
      setEditingId(null)
      loadFiles()
    } catch (error) {
      console.error('Error saving file:', error)
    } finally {
      setLoading(false)
      setUploading(false)
    }
  }

  const handleEdit = (file) => {
    const subtitleNum = (file.subtitle || '').replace(/\s*mb\s*size$/i, '').trim()
    setFormData({
      title: file.title || '',
      download_link: file.download_link || '',
      thumbnail: file.thumbnail || '',
      subtitle: subtitleNum,
    })
    setThumbnailFile(null)
    setThumbnailPreview(file.thumbnail || null)
    setEditingId(file.id)
  }

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase
        .from('files')
        .delete()
        .eq('id', id)

      if (error) throw error
      loadFiles()
    } catch (error) {
      console.error('Error deleting file:', error)
    }
  }

  const handleCopyLink = async (fileId) => {
    const fileUrl = `${window.location.origin}/file/${fileId}`
    
    try {
      await navigator.clipboard.writeText(fileUrl)
    } catch (error) {
      console.error('Failed to copy link:', error)
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = fileUrl
      document.body.appendChild(textArea)
      textArea.select()
      try {
        document.execCommand('copy')
      } catch (err) {
        console.error('Failed to copy link:', err)
      }
      document.body.removeChild(textArea)
    }
  }

  return (
    <div className="file-catalogue">
      <h2>File Catalogue</h2>
      <p className="section-description">Create and manage download file pages</p>

      <form onSubmit={handleSubmit} className="file-form">
        <div className="form-group">
          <label htmlFor="thumbnail">Thumbnail</label>
          <input
            type="file"
            id="thumbnail"
            accept="image/*"
            onChange={handleThumbnailChange}
            className="file-input"
          />
          {thumbnailPreview && (
            <div className="thumbnail-preview">
              <img src={thumbnailPreview} alt="Thumbnail preview" />
              <button
                type="button"
                onClick={() => {
                  setThumbnailFile(null)
                  setThumbnailPreview(null)
                  if (editingId) {
                    setThumbnailPreview(formData.thumbnail || null)
                  }
                }}
                className="remove-thumbnail"
              >
                Remove
              </button>
            </div>
          )}
          <p className="form-hint">Upload an image file (max 5MB)</p>
        </div>

        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Enter file title"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="download_link">Direct Download Link</label>
          <input
            type="url"
            id="download_link"
            value={formData.download_link}
            onChange={(e) => setFormData({ ...formData, download_link: e.target.value })}
            placeholder="https://example.com/file.zip"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="subtitle">Size (Optional)</label>
          <div className="subtitle-input-wrap">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              id="subtitle"
              value={formData.subtitle}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, '')
                setFormData({ ...formData, subtitle: v })
              }}
              placeholder="3"
              maxLength={6}
            />
            <span className="subtitle-suffix">mb size</span>
          </div>
          <p className="form-hint">Numbers only. Shown below the download button (e.g. 3mb size)</p>
        </div>

        <button type="submit" disabled={loading || uploading} className="submit-button">
          {uploading ? 'Uploading...' : loading ? 'Saving...' : editingId ? 'Update File' : 'Add File'}
        </button>

        {editingId && (
          <button
            type="button"
            onClick={() => {
              setFormData({ title: '', download_link: '', thumbnail: '', subtitle: '' })
              setThumbnailFile(null)
              setThumbnailPreview(null)
              setEditingId(null)
            }}
            className="cancel-button"
          >
            Cancel
          </button>
        )}
      </form>

      <div className="files-list">
        <h3>Existing Files</h3>
        {files.length === 0 ? (
          <p className="empty-state">No files yet. Add your first file above!</p>
        ) : (
          <div className="files-grid">
            {files.map((file) => (
              <div key={file.id} className="file-card">
                {file.thumbnail && (
                  <img src={file.thumbnail} alt={file.title} className="file-thumbnail" />
                )}
                <div className="file-info">
                  <h4>{file.title}</h4>
                  <p className="file-link-preview">{file.download_link}</p>
                  <div className="file-actions">
                    <a
                      href={`/file/${file.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="view-link"
                    >
                      View Page
                    </a>
                    <button onClick={() => handleCopyLink(file.id)} className="copy-link-button">
                      Copy Link
                    </button>
                    <button onClick={() => handleEdit(file)} className="edit-button">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(file.id)} className="delete-button">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default FileCatalogue
