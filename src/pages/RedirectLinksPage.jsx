import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './RedirectLinksPage.css'

function RedirectLinksPage() {
  const [linkRedirects, setLinkRedirects] = useState([])
  const [loading, setLoading] = useState(true)

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
      setLinkRedirects(data || [])
    } catch (error) {
      console.error('Error loading redirect links:', error)
    } finally {
      setLoading(false)
    }
  }

  const backIcon = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  )

  if (loading) {
    return (
      <div className="redirect-links-page">
        <div className="redirect-links-loading">Loading...</div>
      </div>
    )
  }

  return (
    <div className="redirect-links-page">
      <div className="redirect-links-container">
        <Link to="/" className="redirect-links-browse-btn" aria-label="Back to catalogue">
          {backIcon}
          <span>Browse</span>
        </Link>

        <section className="redirect-links-section">
          <h1 className="redirect-links-title">Join now</h1>
          {linkRedirects.length === 0 ? (
            <p className="redirect-links-empty">No links available.</p>
          ) : (
            <div className="redirect-links-list">
              {linkRedirects.map((link) => (
                <a
                  key={link.id}
                  href={link.button_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="redirect-links-item"
                >
                  {link.thumbnail && (
                    <img src={link.thumbnail} alt="" className="redirect-links-item-thumb" />
                  )}
                  <span className="redirect-links-item-title">{link.title}</span>
                  <span className="redirect-links-item-cta">Join now</span>
                </a>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default RedirectLinksPage
