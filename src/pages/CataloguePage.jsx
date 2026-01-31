import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './CataloguePage.css'

const ITEMS_PER_PAGE = 8

function CataloguePage() {
  const [files, setFiles] = useState([])
  const [linkRedirects, setLinkRedirects] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    loadFiles()
    loadLinkRedirects()
  }, [])

  const loadFiles = async () => {
    try {
      const { data, error } = await supabase
        .from('files')
        .select('id, thumbnail, title')
        .order('created_at', { ascending: false })

      if (error) throw error
      setFiles(data || [])
    } catch (error) {
      console.error('Error loading files:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadLinkRedirects = async () => {
    try {
      const { data, error } = await supabase
        .from('link_redirects')
        .select('*')
        .order('created_at', { ascending: true })

      if (error) throw error
      setLinkRedirects(data || [])
    } catch (error) {
      console.error('Error loading link redirects:', error)
    }
  }

  const filteredFiles = useMemo(() => {
    if (!searchQuery.trim()) return files
    const q = searchQuery.trim().toLowerCase()
    return files.filter((f) => (f.title || '').toLowerCase().includes(q))
  }, [files, searchQuery])

  const totalPages = Math.ceil(filteredFiles.length / ITEMS_PER_PAGE) || 1
  const pageIndex = Math.max(0, Math.min(currentPage - 1, totalPages - 1))
  const paginatedFiles = useMemo(() => {
    const start = pageIndex * ITEMS_PER_PAGE
    return filteredFiles.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredFiles, pageIndex])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  if (loading) {
    return (
      <div className="catalogue-page">
        <div className="catalogue-loading">Loading...</div>
      </div>
    )
  }

  return (
    <div className="catalogue-page">
      <div className="catalogue-container">
        {/* Telegram button – opens modal with redirect links */}
        <button
          type="button"
          className="catalogue-telegram-btn"
          onClick={() => setModalOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={modalOpen}
        >
          <img src="/telegram.png" alt="Telegram" className="catalogue-telegram-icon" />
          <span>Join now</span>
        </button>

        {/* Redirect links modal */}
        {modalOpen && (
          <div
            className="catalogue-modal-overlay"
            onClick={() => setModalOpen(false)}
            role="presentation"
          >
            <div
              className="catalogue-modal"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="catalogue-modal-title"
            >
              <div className="catalogue-modal-header">
                <h2 id="catalogue-modal-title">Join now</h2>
                <button
                  type="button"
                  className="catalogue-modal-close"
                  onClick={() => setModalOpen(false)}
                  aria-label="Close modal"
                >
                  ×
                </button>
              </div>
              <div className="catalogue-modal-body">
                {linkRedirects.length === 0 ? (
                  <p className="catalogue-modal-empty">No links available.</p>
                ) : (
                  <ul className="catalogue-modal-links">
                    {linkRedirects.map((link) => (
                      <li key={link.id}>
                        <a
                          href={link.button_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="catalogue-modal-link-item"
                        >
                          {link.thumbnail && (
                            <img
                              src={link.thumbnail}
                              alt=""
                              className="catalogue-modal-link-thumb"
                            />
                          )}
                          <span className="catalogue-modal-link-title">{link.title}</span>
                          <span className="catalogue-modal-link-cta">Join now</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Filter: search only */}
        <section className="catalogue-filter">
          <input
            type="search"
            placeholder="Search by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="catalogue-search"
            aria-label="Search files by title"
          />
        </section>

        {/* Grid catalogue */}
        <section className="catalogue-grid-section">
          {paginatedFiles.length === 0 ? (
            <p className="catalogue-empty">No files found.</p>
          ) : (
            <div className="catalogue-grid">
              {paginatedFiles.map((file) => (
                <Link
                  key={file.id}
                  to={`/file/${file.id}`}
                  className="catalogue-card"
                >
                  <div className="catalogue-card-thumb">
                    {file.thumbnail ? (
                      <img src={file.thumbnail} alt={file.title || 'File'} />
                    ) : (
                      <div className="catalogue-card-placeholder">No image</div>
                    )}
                  </div>
                  <h3 className="catalogue-card-title">{file.title || 'Untitled'}</h3>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <nav className="catalogue-pagination" aria-label="Catalogue pagination">
              <button
                type="button"
                className="catalogue-page-btn"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                aria-label="Previous page"
              >
                Previous
              </button>
              <span className="catalogue-page-info">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                className="catalogue-page-btn"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                aria-label="Next page"
              >
                Next
              </button>
            </nav>
          )}
        </section>
      </div>
    </div>
  )
}

export default CataloguePage
