import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import CataloguePage from './pages/CataloguePage'
import DownloadPage from './pages/DownloadPage'
import RedirectLinksPage from './pages/RedirectLinksPage'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CataloguePage />} />
        <Route path="/file/:slug" element={<DownloadPage />} />
        <Route path="/links" element={<RedirectLinksPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  )
}

export default App
