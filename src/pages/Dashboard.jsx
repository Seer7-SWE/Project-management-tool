import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import Navbar from "../components/Navbar";

export default function Dashboard() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();

    // Realtime subscription for any project changes
    const channel = supabase
      .channel("projects-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "projects" },
        () => fetchProjects()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchProjects() {
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (!user) {
        setProjects([]);
        return;
      }

      const { data, error } = await supabase
        .from("projects")
        .select("id, name, description, created_at, created_by")
        .eq("created_by", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (err) {
      console.error("Fetch projects failed:", err);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }

  async function createProject() {
    const name = prompt("Enter new project name:");
    if (!name?.trim()) return;
    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (!user) return alert("You must be logged in.");

      const { data, error } = await supabase
        .from("projects")
        .insert([{ name, created_by: user.id }])
        .select()
        .single();

      if (error) throw error;

      await fetchProjects(); // Instantly update dashboard
    } catch (err) {
      alert("Error creating project: " + err.message);
    }
  }

  async function deleteProject(id) {
    if (!confirm("Delete this project and all tasks?")) return;
    try {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;
      await fetchProjects();
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  }

  const handleViewTasks = (id) => {
    navigate(`/tasks/${id}`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Your Projects</h1>
          <button
            onClick={createProject}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            + New Project
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg shadow">
            <p className="text-gray-500">No projects yet. Create your first project.</p>
            <button
              onClick={createProject}
              className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Create Project
            </button>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow space-y-4">
            {projects.map((project) => (
              <div
                key={project.id}
                className="flex justify-between items-center border-b pb-3"
              >
                <div>
                  <p className="font-semibold text-gray-800">{project.name}</p>
                  <p className="text-sm text-gray-500">{project.description}</p>
                </div>
                <div className="flex gap-2">
                  
                  <button
                     onClick={() => navigate(`/projects/${project.id}/tasks`)}
                     className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-1 rounded"
                  >
                    View Tasks
                  </button>

                  <button
                    onClick={() => deleteProject(project.id)}
                    className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
