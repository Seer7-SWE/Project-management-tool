import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';

export default function TaskBoard() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const projectId = searchParams.get('project');

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'Normal',
    due_date: '',
  });

  useEffect(() => {
    if (!projectId) return;
    fetchData();

    const channel = supabase
      .channel(`tasks-${projectId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks', filter: `project_id=eq.${projectId}` },
        (payload) => {
          setTasks((prev) => {
            switch (payload.eventType) {
              case 'INSERT': return [payload.new, ...prev];
              case 'UPDATE': return prev.map(t => t.id === payload.new.id ? payload.new : t);
              case 'DELETE': return prev.filter(t => t.id !== payload.old.id);
              default: return prev;
            }
          });
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [projectId]);

  async function fetchData() {
    setLoading(true);
    const [{ data: proj }, { data: tData }] = await Promise.all([
      supabase.from('projects').select('*').eq('id', projectId).maybeSingle(),
      supabase.from('tasks').select('*').eq('project_id', projectId).order('created_at', { ascending: false })
    ]);
    setProject(proj);
    setTasks(tData || []);
    setLoading(false);
  }

  async function handleCreateTask(e) {
    e.preventDefault();
    const { title, description, priority, due_date } = form;
    if (!title.trim()) return alert('Title required');
    const { error } = await supabase.from('tasks').insert([{ project_id: projectId, title, description, priority, due_date }]);
    if (error) return alert('Error: ' + error.message);
    setShowModal(false);
    setForm({ title: '', description: '', priority: 'Normal', due_date: '' });
  }

  async function handleDeleteTask(id) {
    if (!confirm('Delete this task?')) return;
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) alert('Delete failed: ' + error.message);
  }

  if (!projectId)
    return (
      <div className="p-6">
        <p>No project selected.</p>
        <button onClick={() => navigate('/')} className="mt-3 bg-gray-200 px-4 py-2 rounded">
          Back
        </button>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">{project?.name || 'Project'} — Tasks</h1>
        <div className="flex gap-2">
          <button onClick={() => navigate('/')} className="px-3 py-1 bg-gray-200 rounded">Back</button>
          <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-indigo-600 text-white rounded">+ Task</button>
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : tasks.length === 0 ? (
        <p>No tasks yet.</p>
      ) : (
        <div className="space-y-3">
          {tasks.map((t) => (
            <div key={t.id} className="bg-white p-4 shadow rounded flex justify-between">
              <div>
                <h3 className="font-semibold">{t.title}</h3>
                <p className="text-sm text-gray-500">{t.description}</p>
                <p className="text-xs text-gray-400">Priority: {t.priority}</p>
              </div>
              <button
                onClick={() => handleDeleteTask(t.id)}
                className="text-red-600 hover:underline text-sm"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
          <form
            onSubmit={handleCreateTask}
            className="bg-white p-6 rounded shadow w-96 space-y-3"
          >
            <h2 className="text-lg font-semibold">New Task</h2>
            <input
              className="w-full border p-2 rounded"
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <textarea
              className="w-full border p-2 rounded"
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <select
              className="w-full border p-2 rounded"
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
            >
              <option>Low</option>
              <option>Normal</option>
              <option>High</option>
            </select>
            <input
              type="date"
              className="w-full border p-2 rounded"
              value={form.due_date}
              onChange={(e) => setForm({ ...form, due_date: e.target.value })}
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-3 py-1 bg-gray-200 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 bg-indigo-600 text-white rounded"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
