import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth.jsx'
import { Home } from './pages/Home'
import { Workout } from './pages/Workout'
import { Cardio } from './pages/Cardio'
import { Login } from './pages/Login'
import { Analytics } from './pages/Analytics'
import { Settings } from './pages/Settings'
import { EditExercises } from './pages/EditExercises'
import { AddExercise } from './pages/AddExercise'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-midnight-950 flex items-center justify-center">
        <div className="text-accent text-xl">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-midnight-950 flex items-center justify-center">
        <div className="text-accent text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/workout/:categoryId"
        element={
          <ProtectedRoute>
            <Workout />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cardio"
        element={
          <ProtectedRoute>
            <Cardio />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <Analytics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/edit-exercises"
        element={
          <ProtectedRoute>
            <EditExercises />
          </ProtectedRoute>
        }
      />
      <Route
        path="/add-exercise"
        element={
          <ProtectedRoute>
            <AddExercise />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <div className="max-w-lg mx-auto">
        <AppRoutes />
      </div>
    </AuthProvider>
  )
}
