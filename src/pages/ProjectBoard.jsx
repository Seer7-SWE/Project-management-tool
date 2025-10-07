import useTasks from '../hooks/useTasks';
import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useParams } from 'react-router-dom'; // If using react-router

const STATUSES = ['To Do', 'In Progress', 'Done'];

export default function ProjectBoard() {
  const { projectId } = useParams();
  const { tasks, loading, error } = useTasks(projectId);
  const [realtimeTasks, setRealtimeTasks] = useState([]);

  // Supabase Realtime subscription
  useEffect(() => {
    setRealtimeTasks(tasks); // Sync initial
    const channel = supabase
      .channel('custom-all-tasks')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks', filter: `project_id=eq.${projectId}` },
        payload => {
          // Update tasks state based on event type
          setRealtimeTasks(prev => {
            switch (payload.eventType) {
              case 'INSERT':
                return [...prev, payload.new];
              case 'UPDATE':
                return prev.map(t => t.id === payload.new.id ? payload.new : t);
              case 'DELETE':
                return prev.filter(t => t.id !== payload.old.id);
              default:
                return prev;
            }
          });
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, tasks]);

  function handleDrag(taskId, newStatus) {
    supabase.from('tasks').update({ status: newStatus }).eq('id', taskId);
    // UI will update via Realtime!
  }

  if (loading) return <div>Loading tasks...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div style={{ display: 'flex', gap: 24 }}>
      {STATUSES.map(status => (
        <div key={status} style={{ flex: 1, minWidth: 200, border: '1px solid #eee', padding: 8 }}>
          <h3>{status}</h3>
          {realtimeTasks.filter(t => t.status === status).map(task => (
            <div
              key={task.id}
              draggable
              onDragEnd={() => handleDrag(task.id, status)}
              style={{ background: '#fafafa', margin: 4, padding: 8, border: '1px solid #ddd' }}
            >
              <strong>{task.title}</strong>
              <br />
              <span>Priority: {task.priority}</span>
              {/* Add file links, tags, assigned users, etc here */}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
