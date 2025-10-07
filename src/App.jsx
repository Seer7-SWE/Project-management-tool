import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { TaskProvider } from './context/TaskContext'
import ProjectBoard from './components/ProjectBoard'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'

function Protected({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <TaskProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Protected><Dashboard /></Protected>} />
          <Route path="/tasks" element={<Protected><ProjectBoard /></Protected>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </TaskProvider>
    </AuthProvider>
  )
}