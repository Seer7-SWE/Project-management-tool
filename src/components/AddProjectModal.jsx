import { useState } from 'react';
import { supabase } from '../utils/supabaseClient';

export default function AddProjectModal({ onClose, onProjectAdded }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      setError('Not authenticated');
      setLoading(false);
      return;
    }
    // 1. Insert project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        name, description, created_by: userData.user.id,
      })
      .select()
      .single();

    if (projectError) {
      setError(projectError.message);
      setLoading(false);
      return;
    }
    // 2. Insert creator as project member
    const { error: memberError } = await supabase.from('project_members').insert({
      project_id: project.id,
      user_auth_id: userData.user.id,
      role: 'owner'
    });
    if (memberError) {
      setError(memberError.message);
      setLoading(false);
      return;
    }
    setLoading(false);
    onProjectAdded && onProjectAdded(project);
    onClose();
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Add Project</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <input
        required
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Project Name"
      />
      <textarea
        value={description}
        onChange={e => setDescription(e.target.value)}
        placeholder="Project Description"
      />
      <button disabled={loading}>{loading ? 'Adding...' : 'Add Project'}</button>
      <button type="button" onClick={onClose}>Cancel</button>
    </form>
  );
}
