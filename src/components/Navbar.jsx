import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, signOut } = useAuth()
  return (
    <nav className="bg-white shadow px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Link to="/" className="font-semibold text-lg">PM Tool</Link>
        <Link to="/" className="text-sm text-slate-600 hover:underline">Dashboard</Link>
      </div>
      <div>
        {user ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-700">{user?.email}</span>
            <button onClick={signOut} className="px-3 py-1 bg-red-500 text-white rounded text-sm">Sign out</button>
          </div>
        ) : (
          <Link to="/login" className="px-3 py-1 bg-blue-500 text-white rounded text-sm">Sign in</Link>
        )}
      </div>
    </nav>
  )
}
