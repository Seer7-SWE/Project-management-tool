import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';

export default function useTasks(projectId) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let subscribed = true;
    async function fetchTasks() {
      setLoading(true);
      setError(null);
      if (!projectId) {
        setTasks([]);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('priority', { ascending: false });
      if (subscribed) {
        setTasks(data || []);
        setError(error?.message ?? null);
        setLoading(false);
      }
    }
    fetchTasks();
    return () => { subscribed = false; };
  }, [projectId]);

  return { tasks, loading, error };
}
