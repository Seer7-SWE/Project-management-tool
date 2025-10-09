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
    const channel = supabase
      .channel('projects-list')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => fetchProjects())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchProjects() {
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      setProjects([]);
      setLoading(false);
      return;
    }
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*, project_members!inner(role)')
      .eq('project_members.user_auth_id', userData.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
    } else {
      setProjects(projects || []);
    }
    setLoading(false);
  }

  async function createProject() {
    const name = prompt('Enter project name:');
    if (!name) return alert('Project name is required.');
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return alert('You must be logged in to create a project.');

    try {
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert([{ name, created_by: userData.user.id }])
        .select()
        .single();
      if (projectError) throw new Error(projectError.message);

      const { error: memberError } = await supabase
        .from('project_members')
        .insert([{ project_id: project.id, user_auth_id: userData.user.id, role: 'owner' }]);
      if (memberError) throw new Error(memberError.message);

      await fetchProjects();
    } catch (error) {
      console.error('Error creating project:', error);
      alert(`Failed to create project: ${error.message}`);
    }
  }

  const handleViewTasks = (projectId) => {
    if (!projectId) {
      alert('No projects available.');
      return;
    }
    navigate(`/tasks?project=${projectId}`);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="flex gap-4">
            <button
              onClick={() => handleViewTasks(projects[0]?.id)}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              View All Tasks
            </button>
            <button
              onClick={createProject}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              + New Project
            </button>
          </div>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Your Projects</h2>
          {loading ? (
            <p>Loading...</p>
          ) : projects.length === 0 ? (
            <p>No projects found. Create your first project.</p>
          ) : (
            <ul>
              {projects.map((project) => (
                <li key={project.id} className="mb-4">
                  <div className="flex justify-between items-center">
                    <span>{project.name}</span>
                    <button
                      onClick={() => handleViewTasks(project.id)}
                      className="bg-gray-300 text-gray-700 px-3 py-1 rounded hover:bg-gray-400"
                    >
                      View Tasks
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
