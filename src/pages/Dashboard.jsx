import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { TaskProvider } from '../context/TaskContext';

export default function Dashboard() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
    const ch = supabase.channel('projects-list').on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => loadProjects()).subscribe();
    return () => supabase.removeChannel(ch);
  }, []);

  async function loadProjects() {
    setLoading(true);
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('archived', false)
      .order('created_at', { ascending: false });
    
    if (error) console.error(error);
    else setProjects(data || []);
    setLoading(false);
  }

  async function createProject() {
    const name = prompt('Project name');
    if (!name) return;
    const { error } = await supabase.from('projects').insert([{ name }]);
    if (error) alert(error.message);
  }

  const handleViewProject = (project) => {
    setActiveProject(project);
  };

  const handleViewAllTasks = () => {
    navigate('/tasks');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage your projects and tasks</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleViewAllTasks}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              View All Tasks
            </button>
            <button
              onClick={createProject}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              + New Project
            </button>
          </div>
        </div>

        {/* Projects Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Your Projects</h2>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500 mb-4">No projects yet. Create your first project!</p>
              <button
                onClick={createProject}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Create Project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map(project => (
                <div key={project.id} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
                  <h3 className="text-lg font-semibold mb-2">{project.name}</h3>
                  {project.description && (
                    <p className="text-gray-600 mb-4">{project.description}</p>
                  )}
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewProject(project)}
                      className="flex-1 px-3 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700"
                    >
                      View Board
                    </button>
                    <button
                      onClick={() => navigate(`/tasks?project=${project.id}`)}
                      className="px-3 py-2 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300"
                    >
                      Tasks
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Project Board */}
        {activeProject && (
          <TaskProvider projectId={activeProject.id}>
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-semibold">{activeProject.name}</h2>
                    <p className="text-gray-600">{activeProject.description}</p>
                  </div>
                  <button
                    onClick={() => setActiveProject(null)}
                    className="px-3 py-1 text-gray-600 hover:text-gray-800"
                  >
                    ✕ Close
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <p className="text-center text-gray-500 py-8">
                  Click "View Board" or "View All Tasks" to access the kanban board
                </p>
              </div>
            </div>
          </TaskProvider>
        )}
      </div>
    </div>
  );
}