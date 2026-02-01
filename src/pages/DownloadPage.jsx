import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { supabase } from '../lib/supabase'
import './DownloadPage.css'

function DownloadPage() {
  const { slug } = useParams()
  const [fileData, setFileData] = useState(null)
  const [linkRedirects, setLinkRedirects] = useState([])
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPageData()
  }, [slug])

  const loadPageData = async () => {
    try {
      if (!slug) {
        setFileData(null)
        setLoading(false)
        return
      }

      let { data, error } = await supabase
        .from('files')
        .select('*')
        .eq('slug', slug)
        .maybeSingle()

      if (error) throw error
      // Fallback: treat param as legacy id (e.g. old links or missing slug)
      if (!data) {
        const res = await supabase
          .from('files')
          .select('*')
          .eq('id', slug)
          .maybeSingle()
        if (res.error) throw res.error
        data = res.data
      }
      setFileData(data)

      // Load link redirects
      const { data: links } = await supabase
        .from('link_redirects')
        .select('*')
        .order('created_at', { ascending: true })

      if (links) setLinkRedirects(links)

      // Load settings
      const { data: settingsData } = await supabase
        .from('settings')
        .select('*')
        .single()

      if (settingsData) setSettings(settingsData)
    } catch (error) {
      console.error('Error loading page data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (fileData?.download_link) {
      window.open(fileData.download_link, '_blank')
    }
  }

  if (loading) {
    return (
      <div className="download-page">
        <div className="loading">Loading...</div>
      </div>
    )
  }

  if (!fileData) {
    return (
      <div className="download-page">
        <div className="error-message">File not found</div>
      </div>
    )
  }

  const customStyles = settings ? {
    '--primary-color': settings.button_color || '#6366f1',
    '--background-color': settings.background_color || '#0f172a',
    '--card-background': settings.card_background || '#1e293b',
  } : {}

  const backIcon = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  )

  // Absolute URL for link preview (og:image requires full URL)
  const imageUrl = fileData.thumbnail?.startsWith('http')
    ? fileData.thumbnail
    : (typeof window !== 'undefined' ? `${window.location.origin}${fileData.thumbnail}` : fileData.thumbnail)

  return (
    <div className="download-page" style={customStyles}>
      <Helmet>
        <title>{fileData.title} | Ultra Garden of PH</title>
        <meta name="description" content={fileData.subtitle || fileData.title} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={fileData.title} />
        <meta property="og:description" content={fileData.subtitle || fileData.title} />
        <meta property="og:image" content={imageUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={fileData.title} />
        <meta name="twitter:description" content={fileData.subtitle || fileData.title} />
        <meta name="twitter:image" content={imageUrl} />
      </Helmet>
      <div className="download-container">
        <Link to="/" className="download-browse-btn" aria-label="Back to catalogue">
          {backIcon}
          <span>Browse</span>
        </Link>

        {/* First Layer */}
        <div className="download-section">
          {fileData.thumbnail && (
            <div className="thumbnail-container">
              <img src={fileData.thumbnail} alt={fileData.title} className="thumbnail" />
            </div>
          )}
          <div className="download-content">
            <h1 className="file-title">{fileData.title}</h1>
            <button onClick={handleDownload} className="download-button">
              Download {fileData.title}.zip
            </button>
            {fileData.subtitle && (
              <p className="file-subtitle">{fileData.subtitle}</p>
            )}
          </div>
        </div>

        {/* Second Layer - Link Redirects */}
        {linkRedirects.length > 0 && (
          <div className="links-section">
            <h2 className="links-title">Want more?</h2>
            <div className="links-list">
              {linkRedirects.map((link) => (
                <a
                  key={link.id}
                  href={link.button_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-item"
                >
                  {link.thumbnail && (
                    <img src={link.thumbnail} alt={link.title} className="link-thumbnail" />
                  )}
                  <span className="link-title">{link.title}</span>
                  <span className="link-button">Join now</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DownloadPage
