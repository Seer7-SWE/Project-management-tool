import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';

export default function useProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let subscribed = true;
    async function fetchProjects() {
      setLoading(true);
      setError(null);
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        setError('Not authenticated');
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from('projects')
        .select('*, project_members!inner(role)')
        .eq('project_members.user_auth_id', userData.user.id)
        .order('created_at', { ascending: false });
      if (subscribed) {
        setProjects(data || []);
        setError(error?.message ?? null);
        setLoading(false);
      }
    }
    fetchProjects();
    return () => { subscribed = false; };
  }, []);

  return { projects, loading, error };
}
