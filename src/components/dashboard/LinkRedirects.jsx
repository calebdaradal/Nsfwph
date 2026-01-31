import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { uploadFile, deleteFile, extractFilePathFromUrl } from '../../lib/storage'
import './LinkRedirects.css'

function LinkRedirects() {
  const [links, setLinks] = useState([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    button_link: '',
    thumbnail: '',
  })
  const [thumbnailFile, setThumbnailFile] = useState(null)
  const [thumbnailPreview, setThumbnailPreview] = useState(null)
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    loadLinks()
  }, [])

  const loadLinks = async () => {
    try {
      const { data, error } = await supabase
        .from('link_redirects')
        .select('*')
        .order('created_at', { ascending: true })

      if (error) throw error
      setLinks(data || [])
    } catch (error) {
      console.error('Error loading links:', error)
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
        thumbnailUrl = await uploadFile(thumbnailFile, 'thumbnails', 'links')
      }

      const dataToSave = {
        ...formData,
        thumbnail: thumbnailUrl,
      }

      if (editingId) {
        // Update existing link
        const { error } = await supabase
          .from('link_redirects')
          .update(dataToSave)
          .eq('id', editingId)

        if (error) throw error
      } else {
        // Create new link
        const { error } = await supabase
          .from('link_redirects')
          .insert([dataToSave])

        if (error) throw error
      }

      // Reset form
      setFormData({ title: '', button_link: '', thumbnail: '' })
      setThumbnailFile(null)
      setThumbnailPreview(null)
      setEditingId(null)
      loadLinks()
    } catch (error) {
      console.error('Error saving link:', error)
    } finally {
      setLoading(false)
      setUploading(false)
    }
  }

  const handleEdit = (link) => {
    setFormData({
      title: link.title || '',
      button_link: link.button_link || '',
      thumbnail: link.thumbnail || '',
    })
    setThumbnailFile(null)
    setThumbnailPreview(link.thumbnail || null)
    setEditingId(link.id)
  }

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase
        .from('link_redirects')
        .delete()
        .eq('id', id)

      if (error) throw error
      loadLinks()
    } catch (error) {
      console.error('Error deleting link:', error)
    }
  }

  const handleReorder = async (id, direction) => {
    const currentIndex = links.findIndex((link) => link.id === id)
    if (currentIndex === -1) return

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= links.length) return

    // Swap items
    const newLinks = [...links]
    ;[newLinks[currentIndex], newLinks[newIndex]] = [newLinks[newIndex], newLinks[currentIndex]]

    // Update order in database (you might want to add an order field)
    setLinks(newLinks)
  }

  return (
    <div className="link-redirects">
      <h2>Link Redirects</h2>
      <p className="section-description">Customize the "Want more?" section links</p>

      <form onSubmit={handleSubmit} className="link-form">
        <div className="form-group">
          <label htmlFor="link-thumbnail">Thumbnail</label>
          <input
            type="file"
            id="link-thumbnail"
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
          <label htmlFor="link-title">Title</label>
          <input
            type="text"
            id="link-title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Enter link title"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="button_link">Button Link</label>
          <input
            type="url"
            id="button_link"
            value={formData.button_link}
            onChange={(e) => setFormData({ ...formData, button_link: e.target.value })}
            placeholder="https://example.com"
            required
          />
        </div>

        <button type="submit" disabled={loading || uploading} className="submit-button">
          {uploading ? 'Uploading...' : loading ? 'Saving...' : editingId ? 'Update Link' : 'Add Link'}
        </button>

        {editingId && (
          <button
            type="button"
            onClick={() => {
              setFormData({ title: '', button_link: '', thumbnail: '' })
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

      <div className="links-list">
        <h3>Existing Links</h3>
        {links.length === 0 ? (
          <p className="empty-state">No links yet. Add your first link above!</p>
        ) : (
          <div className="links-container">
            {links.map((link, index) => (
              <div key={link.id} className="link-card">
                <div className="link-content">
                  {link.thumbnail && (
                    <img src={link.thumbnail} alt={link.title} className="link-thumbnail" />
                  )}
                  <div className="link-number">{index + 1}</div>
                  <div className="link-details">
                    <h4>{link.title}</h4>
                    <p className="link-url">{link.button_link}</p>
                  </div>
                </div>
                <div className="link-actions">
                  <button
                    onClick={() => handleReorder(link.id, 'up')}
                    disabled={index === 0}
                    className="reorder-button"
                    title="Move up"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => handleReorder(link.id, 'down')}
                    disabled={index === links.length - 1}
                    className="reorder-button"
                    title="Move down"
                  >
                    ↓
                  </button>
                  <button onClick={() => handleEdit(link)} className="edit-button">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(link.id)} className="delete-button">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default LinkRedirects
