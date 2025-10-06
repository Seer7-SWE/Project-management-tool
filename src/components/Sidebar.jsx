// src/components/Sidebar.jsx
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

import { LogOut, LayoutDashboard, ListChecks } from "lucide-react";

export default function Sidebar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <aside className="w-64 h-screen bg-gray-900 text-white flex flex-col justify-between">
      <div>
        <h1 className="text-2xl font-bold text-center py-6 border-b border-gray-700">
          PM Tool
        </h1>
        <nav className="mt-4 flex flex-col space-y-2 px-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-3 px-3 py-2 hover:bg-gray-800 rounded-lg"
          >
            <LayoutDashboard size={20} /> Dashboard
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-3 px-3 py-2 hover:bg-gray-800 rounded-lg"
          >
            <ListChecks size={20} /> Tasks
          </button>
        </nav>
      </div>

      <div className="p-4 border-t border-gray-700">
        <p className="text-sm mb-2 text-gray-400">
          Logged in as: <span className="text-white">{user?.email}</span>
        </p>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 py-2 rounded-lg"
        >
          <LogOut size={18} /> Logout
        </button>
      </div>
    </aside>
  );
}
