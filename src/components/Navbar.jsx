import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleSignOut = async () => {
    await logout();
    // logout already navigates to /login, but keep safety:
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
      <div>
        <Link to="/" className="text-lg font-bold">PM Tool</Link>
      </div>
      <div>
        {user ? (
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-700">{user.email}</span>
            <button
              onClick={handleSignOut}
              className="px-3 py-1 bg-red-500 text-white rounded text-sm"
            >
              Sign out
            </button>
          </div>
        ) : (
          <Link to="/login" className="px-3 py-1 bg-blue-500 text-white rounded text-sm">Sign in</Link>
        )}
      </div>
    </nav>
  );
}
