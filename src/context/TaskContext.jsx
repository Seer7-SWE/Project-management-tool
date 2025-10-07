// src/context/TaskContext.jsx
import react , { createContext, useState, useEffect, useContext } from "react";
import { supabase } from "../utils/supabaseClient";
import { AuthContext } from "./AuthContext";

export const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);

  // Fetch tasks for the current user
  const fetchTasks = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("assigned_to_auth", user.id)
      .order("created_at", { ascending: false });
    
    if(error) console.error('Error fetching tasks:', error);
    else setTasks(data || []);
    setLoading(false);
  };

 const addTask = async (task) => {
    const { data, error } = await supabase.from('tasks').insert([task]).select();
    if (error) console.error('Error adding task:', error);
    else setTasks((prev) => [data[0], ...prev]);
  };

  // Update task
  const updateTask = async (id, updates) => {
    const { data, error } = await supabase.from('tasks').update(updates).eq('id', id).select();
    if (error) console.error('Error updating task:', error);
    else setTasks((prev) => prev.map((t) => (t.id === id ? data[0] : t)));
  };

  // Delete task
  const deleteTask = async (id) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) console.error('Error deleting task:', error);
    else setTasks((prev) => prev.filter((t) => t.id !== id));
  };
  
  useEffect(() => {
    if(!user) return;
    fetchTasks();

    // Realtime subscription for tasks
    const channel = supabase
      .channel('realtime-tasks')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setTasks((prev) => [payload.new, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setTasks((prev) => prev.map((t) => (t.id === payload.new.id ? payload.new : t)));
          } else if (payload.eventType === 'DELETE') {
            setTasks((prev) => prev.filter((t) => t.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        loading,
        fetchTasks,
        addTask,
        updateTask,
        deleteTask.
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => useContext(TaskContext);
