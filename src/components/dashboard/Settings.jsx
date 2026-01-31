import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import './Settings.css'

function Settings() {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    button_color: '#6366f1',
    background_color: '#0f172a',
    card_background: '#1e293b',
    text_primary: '#f1f5f9',
    text_secondary: '#cbd5e1',
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .single()

      if (error && error.code !== 'PGRST116') {
        // PGRST116 is "not found" error, which is fine for first time
        throw error
      }

      if (data) {
        setFormData({
          button_color: data.button_color || '#6366f1',
          background_color: data.background_color || '#0f172a',
          card_background: data.card_background || '#1e293b',
          text_primary: data.text_primary || '#f1f5f9',
          text_secondary: data.text_secondary || '#cbd5e1',
        })
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Check if settings exist
      const { data: existing } = await supabase
        .from('settings')
        .select('id')
        .single()

      if (existing) {
        // Update existing settings
        const { error } = await supabase
          .from('settings')
          .update(formData)
          .eq('id', existing.id)

        if (error) throw error
      } else {
        // Create new settings
        const { error } = await supabase
          .from('settings')
          .insert([formData])

        if (error) throw error
      }
    } catch (error) {
      console.error('Error saving settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFormData({
      button_color: '#6366f1',
      background_color: '#0f172a',
      card_background: '#1e293b',
      text_primary: '#f1f5f9',
      text_secondary: '#cbd5e1',
    })
  }

  return (
    <div className="settings">
      <h2>Settings</h2>
      <p className="section-description">Customize the appearance of your download pages</p>

      <form onSubmit={handleSubmit} className="settings-form">
        <div className="color-group">
          <label htmlFor="button_color">Button Color</label>
          <div className="color-input-group">
            <input
              type="color"
              id="button_color"
              value={formData.button_color}
              onChange={(e) => setFormData({ ...formData, button_color: e.target.value })}
              className="color-picker"
            />
            <input
              type="text"
              value={formData.button_color}
              onChange={(e) => setFormData({ ...formData, button_color: e.target.value })}
              className="color-text"
              placeholder="#6366f1"
            />
          </div>
        </div>

        <div className="color-group">
          <label htmlFor="background_color">Background Color</label>
          <div className="color-input-group">
            <input
              type="color"
              id="background_color"
              value={formData.background_color}
              onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
              className="color-picker"
            />
            <input
              type="text"
              value={formData.background_color}
              onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
              className="color-text"
              placeholder="#0f172a"
            />
          </div>
        </div>

        <div className="color-group">
          <label htmlFor="card_background">Card Background Color</label>
          <div className="color-input-group">
            <input
              type="color"
              id="card_background"
              value={formData.card_background}
              onChange={(e) => setFormData({ ...formData, card_background: e.target.value })}
              className="color-picker"
            />
            <input
              type="text"
              value={formData.card_background}
              onChange={(e) => setFormData({ ...formData, card_background: e.target.value })}
              className="color-text"
              placeholder="#1e293b"
            />
          </div>
        </div>

        <div className="color-group">
          <label htmlFor="text_primary">Primary Text Color</label>
          <div className="color-input-group">
            <input
              type="color"
              id="text_primary"
              value={formData.text_primary}
              onChange={(e) => setFormData({ ...formData, text_primary: e.target.value })}
              className="color-picker"
            />
            <input
              type="text"
              value={formData.text_primary}
              onChange={(e) => setFormData({ ...formData, text_primary: e.target.value })}
              className="color-text"
              placeholder="#f1f5f9"
            />
          </div>
        </div>

        <div className="color-group">
          <label htmlFor="text_secondary">Secondary Text Color</label>
          <div className="color-input-group">
            <input
              type="color"
              id="text_secondary"
              value={formData.text_secondary}
              onChange={(e) => setFormData({ ...formData, text_secondary: e.target.value })}
              className="color-picker"
            />
            <input
              type="text"
              value={formData.text_secondary}
              onChange={(e) => setFormData({ ...formData, text_secondary: e.target.value })}
              className="color-text"
              placeholder="#cbd5e1"
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading} className="submit-button">
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
          <button type="button" onClick={handleReset} className="reset-button">
            Reset to Defaults
          </button>
        </div>
      </form>

      <div className="preview-section">
        <h3>Preview</h3>
        <div className="preview-container" style={{ backgroundColor: formData.background_color }}>
          <div className="preview-card" style={{ backgroundColor: formData.card_background }}>
            <h4 style={{ color: formData.text_primary }}>Sample Title</h4>
            <p style={{ color: formData.text_secondary }}>Sample description text</p>
            <button
              className="preview-button"
              style={{ backgroundColor: formData.button_color }}
            >
              Sample Button
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
