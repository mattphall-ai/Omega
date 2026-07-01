import { Link, Route, Routes } from 'react-router-dom'
import EstimateListPage from './pages/EstimateListPage'
import EstimateEditorPage from './pages/EstimateEditorPage'

export default function App() {
  return (
    <div className="app">
      <header className="app-header">
        <Link to="/" className="app-title">
          AICP Bid Estimator
        </Link>
        <Link to="/new" className="button button-primary">
          + New Estimate
        </Link>
      </header>
      <main className="app-main">
        <Routes>
          <Route path="/" element={<EstimateListPage />} />
          <Route path="/new" element={<EstimateEditorPage mode="create" />} />
          <Route path="/estimates/:id" element={<EstimateEditorPage mode="edit" />} />
        </Routes>
      </main>
    </div>
  )
}
