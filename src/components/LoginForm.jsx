import React, { useState } from 'react'
import { supabase } from '../utils/supabaseClient'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { upsertUserRow } = useAuth()

  async function onSignIn(e) {
    e.preventDefault()
    setLoading(true)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) return alert(error.message)
    // ensure user row present
    await upsertUserRow(data.user)
    navigate('/')
  }

  async function onGoogleSignIn() {
    await supabase.auth.signInWithOAuth({ provider: 'google' })
  }

  return (
    <div className="max-w-md mx-auto mt-12 bg-white p-6 rounded shadow">
      <h2 className="text-2xl mb-4">Sign in</h2>
      <form onSubmit={onSignIn}>
        <input required value={email} onChange={e=>setEmail(e.target.value)} className="w-full p-2 border rounded mb-2" placeholder="Email" />
        <input required value={password} onChange={e=>setPassword(e.target.value)} type="password" className="w-full p-2 border rounded mb-4" placeholder="Password" />
        <div className="flex gap-2">
          <button type="submit" className="flex-1 bg-blue-600 text-white px-4 py-2 rounded">{loading ? '...' : 'Sign In'}</button>
          <button type="button" onClick={onGoogleSignIn} className="flex-1 bg-red-600 text-white px-4 py-2 rounded">Google</button>
        </div>
      </form>
      <div className="mt-3 text-sm">
        <Link to="/register" className="underline">Register</Link>
      </div>
    </div>
  )
}
