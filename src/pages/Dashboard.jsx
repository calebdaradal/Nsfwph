import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import FileCatalogue from '../components/dashboard/FileCatalogue'
import LinkRedirects from '../components/dashboard/LinkRedirects'
import Settings from '../components/dashboard/Settings'
import './Dashboard.css'

function Dashboard() {
  const [activeTab, setActiveTab] = useState('files')
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Dashboard</h1>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </header>
      
      <nav className="dashboard-nav">
        <button
          className={activeTab === 'files' ? 'active' : ''}
          onClick={() => setActiveTab('files')}
        >
          File Catalogue
        </button>
        <button
          className={activeTab === 'links' ? 'active' : ''}
          onClick={() => setActiveTab('links')}
        >
          Link Redirects
        </button>
        <button
          className={activeTab === 'settings' ? 'active' : ''}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
      </nav>

      <main className="dashboard-content">
        {activeTab === 'files' && <FileCatalogue />}
        {activeTab === 'links' && <LinkRedirects />}
        {activeTab === 'settings' && <Settings />}
      </main>
    </div>
  )
}

export default Dashboard
