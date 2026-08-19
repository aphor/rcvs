import { Navigate, Route, Routes } from 'react-router-dom'
import { useApp } from './context/AppContext.jsx'
import Welcome from './components/Welcome.jsx'
import VotingApp from './components/VotingApp.jsx'

export default function App() {
  const { state } = useApp()
  const registered = Boolean(state.user)

  return (
    <Routes>
      <Route
        path="/register"
        element={registered ? <Navigate to="/app" replace /> : <Welcome />}
      />
      {/* Login is a stub for the mock: registration creates the session. */}
      <Route path="/login" element={<Navigate to="/register" replace />} />
      <Route
        path="/app"
        element={registered ? <VotingApp /> : <Navigate to="/register" replace />}
      />
      <Route path="*" element={<Navigate to={registered ? '/app' : '/register'} replace />} />
    </Routes>
  )
}
