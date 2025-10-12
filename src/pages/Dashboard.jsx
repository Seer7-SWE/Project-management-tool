import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import Navbar from '../components/Navbar';

export default function Dashboard() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
    // subscribe to realtime changes in projects table (optional)
    const channel = supabase
      .channel('projects-list')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => {
        fetchProjects();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchProjects() {
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        setProjects([]);
        setLoading(false);
        return;
      }

      // Fetch projects where the current user is a member
      const { data, error } = await supabase
        .from('projects')
        .select('*, project_members!inner(role)')
        .eq('project_members.user_auth_id', userData.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error);
        setProjects([]);
      } else {
        setProjects(data || []);
      }
      setLoading(false);
  }

  async function createProject() {
    const name = prompt('Project name');
    if (!name) return alert('Project name is required.');
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return alert('Not logged in!');

      // Insert project
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert([{ name, created_by: userData.user.id }])
        .select()
        .single();
      if (projectError) throw new Error(projectError.message);

      // Insert creator as member
      const { error: memberError } = await supabase
        .from('project_members')
        .insert([{ project_id: project.id, user_auth_id: userData.user.id, role: 'owner' }]);
      if (memberError) throw new Error(memberError.message);

      // Re-fetch projects
      await fetchProjects();
    } catch (error) {
      console.error('Create project failed:', error);
      alert(`Failed to create project: ${error.message}`);
    }
  }

  async function deleteProject(id) {
    if (!confirm('Delete this project and all its tasks? This cannot be undone.')) return;
    try {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
      // refetch projects
      await fetchProjects();
    } catch (err) {
      console.error('Delete project failed:', err);
      alert('Failed to delete project: ' + (err.message || JSON.stringify(err)));
    }
  }

  const handleViewTasks = (projectId) => {
    if (!projectId) { alert('No projects available.'); return: }
    navigate(`/tasks?project=${projectId}`);
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
              onClick={() => handleViewTasks(projects[0]?.id)}
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
            <div className="bg-white p-6 rounded-lg shadow">
              <ul>
                {projects.map((project) => (
                  <li key={project.id} className="flex justify-between items-center py-3 border-b last:border-b-0">
                    <div>
                      <div className="text-lg font-medium">{project.name}</div>
                      {project.description && <div className="text-sm text-gray-500">{project.description}</div>}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewTasks(project.id)}
                        className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300"
                      >
                        View Tasks
                      </button>
                      <button
                        onClick={() => deleteProject(project.id)}
                        className="px-3 py-1 bg-red-500 text-white text-sm rounded-md hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
