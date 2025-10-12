import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';

/**
 * TaskBoard page for a single project.
 * - Reads project id from ?project=<id>
 * - Shows all tasks belonging to that project
 * - Provides a modal form to create a new task, which inserts into Supabase and refreshes the list
 */

export default function TaskBoard() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const projectId = searchParams.get('project');

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false); // modal open
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'Normal',
    due_date: '',
    assigned_to_auth: ''
  });

  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      return;
    }
    fetchProjectAndTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  async function fetchProjectAndTasks() {
    setLoading(true);
    try {
      const [{ data: projectData, error: pErr }, { data: tasksData, error: tErr }] = await Promise.all([
        supabase.from('projects').select('*').eq('id', projectId).single(),
        supabase.from('tasks').select('*').eq('project_id', projectId).order('created_at', { ascending: false })
      ]);

      if (pErr) {
        console.error('Error fetching project:', pErr);
        setProject(null);
      } else {
        setProject(projectData || null);
      }

      if (tErr) {
        console.error('Error fetching tasks:', tErr);
        setTasks([]);
      } else {
        setTasks(tasksData || []);
      }
    } catch (err) {
      console.error('Unexpected fetch error:', err);
      setProject(null);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateTask(e) {
    e.preventDefault();
    if (!form.title.trim()) return alert('Title is required');

    try {
      const payload = {
        project_id: projectId,
        title: form.title,
        description: form.description || null,
        priority: form.priority || 'Normal',
        due_date: form.due_date || null,
        assigned_to_auth: form.assigned_to_auth || null
      };

      const { data, error } = await supabase.from('tasks').insert([payload]).select().single();
      if (error) throw error;

      // prepend new task
      setTasks(prev => [data, ...prev]);

      // reset form and close modal
      setForm({ title: '', description: '', priority: 'Normal', due_date: '', assigned_to_auth: '' });
      setCreating(false);
    } catch (err) {
      console.error('Create task failed:', err);
      alert('Failed to create task: ' + (err.message || JSON.stringify(err)));
    }
  }

  async function handleDeleteTask(id) {
    if (!confirm('Delete this task?')) return;
    try {
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) throw error;
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error('Delete task failed:', err);
      alert('Failed to delete task: ' + (err.message || JSON.stringify(err)));
    }
  }

  if (!projectId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Tasks</h1>
        <p>No project selected. Go back to the dashboard and choose a project.</p>
        <button onClick={() => navigate('/')} className="mt-4 px-4 py-2 bg-gray-200 rounded">Back to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Tasks {project ? `— ${project.name}` : ''}</h1>
          <p className="text-sm text-gray-500">{project?.description}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate('/')} className="px-3 py-2 bg-gray-200 rounded">Back</button>
          <button
            onClick={() => setCreating(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            + New Task
          </button>
        </div>
      </div>

      {loading ? (
        <p>Loading tasks...</p>
      ) : tasks.length === 0 ? (
        <p className="text-gray-500">No tasks yet for this project.</p>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <div key={task.id} className="bg-white p-4 rounded shadow flex justify-between items-start">
              <div>
                <div className="font-semibold">{task.title}</div>
                {task.description && <div className="text-sm text-gray-600">{task.description}</div>}
                <div className="text-xs text-gray-500 mt-1">Priority: {task.priority} • Due: {task.due_date ?? '—'}</div>
              </div>
              <div className="flex flex-col gap-2 items-end">
                <div className="text-sm text-gray-600">{task.assigned_to_auth ? `Assigned: ${task.assigned_to_auth}` : ''}</div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      // Quick toggle example: cycle todo -> in_progress -> done
                      const next = task.status === 'todo' ? 'in_progress' : task.status === 'in_progress' ? 'done' : 'todo';
                      supabase.from('tasks').update({ status: next }).eq('id', task.id)
                        .then(({ data, error }) => {
                          if (error) return console.error('Failed to update status', error);
                          setTasks(prev => prev.map(t => t.id === task.id ? { ...t, ...data[0] } : t));
                        });
                    }}
                    className="px-2 py-1 text-xs bg-blue-100 rounded"
                  >
                    Toggle Status
                  </button>
                  <button onClick={() => handleDeleteTask(task.id)} className="px-2 py-1 text-xs bg-red-100 rounded">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Task Modal */}
      {creating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white w-full max-w-lg rounded p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Create Task</h2>
              <button onClick={() => setCreating(false)} className="text-gray-600">✕</button>
            </div>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Title</label>
                <input
                  className="w-full mt-1 border px-3 py-2 rounded"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Description</label>
                <textarea
                  className="w-full mt-1 border px-3 py-2 rounded"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium">Priority</label>
                  <select className="w-full mt-1 border px-2 py-2 rounded" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                    <option>Low</option>
                    <option>Normal</option>
                    <option>High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium">Due date</label>
                  <input type="date" className="w-full mt-1 border px-2 py-2 rounded" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium">Assign (auth id)</label>
                  <input className="w-full mt-1 border px-2 py-2 rounded" value={form.assigned_to_auth} onChange={(e) => setForm({ ...form, assigned_to_auth: e.target.value })} />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setCreating(false)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
