import { HashRouter, NavLink, Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage'
import CatalogPage from './pages/CatalogPage'
import ModelPage from './pages/ModelPage'
import PlanPage from './pages/PlanPage'
import ProjectsPage from './pages/ProjectsPage'
import ProjectPage from './pages/ProjectPage'
import SuppliersPage from './pages/SuppliersPage'

const NAV = [
  { to: '/', label: 'בית', icon: '🏠', end: true },
  { to: '/catalog', label: 'קטלוג', icon: '📚', end: false },
  { to: '/plan', label: 'תכנון', icon: '📐', end: false },
  { to: '/projects', label: 'הפרויקטים שלי', icon: '🪚', end: false },
  { to: '/suppliers', label: 'ספקים', icon: '📍', end: false },
]

export default function App() {
  return (
    <HashRouter>
      <div className="app">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/catalog/:modelId" element={<ModelPage />} />
          <Route path="/plan" element={<PlanPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:projectId" element={<ProjectPage />} />
          <Route path="/suppliers" element={<SuppliersPage />} />
          <Route path="*" element={<div className="page"><h1 className="page-title">הדף לא נמצא</h1></div>} />
        </Routes>
      </div>

      <nav className="bottom-nav" aria-label="ניווט ראשי">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <span className="nav-icon" aria-hidden="true">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </HashRouter>
  )
}
