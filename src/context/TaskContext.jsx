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
    const { data, error } = 
      supabase.from("tasks")
      .select("*")
      .eq("assigned_to_auth", user.id)
      .order("created_at", { ascending: false });
    if (!error) setTasks(data);
  };

  useEffect(() => {
    fetchTasks();

    // Realtime subscription for tasks
    const subscription = supabase
      .from(`tasks:assigned_to_auth=eq.${user?.id}`)
      .on("*", fetchTasks)
      .subscribe();

    return () => supabase.removeSubscription(subscription);
  }, [user]);

  // CRUD Operations
  const createTask = async (task) => {
    const { data, error } = supabase.from("tasks").insert([
      {
        ...task,
        assigned_to_auth: user.id,
      },
    ]);
    if (!error) setTasks((prev) => [data[0], ...prev]);
  };

  const updateTask = async (id, updates) => {
    const { data, error } = 
      supabase.from("tasks")
      .update(updates)
      .eq("id", id);
    if (!error) fetchTasks();
  };

  const deleteTask = async (id) => {
    const { error } = supabase.from("tasks").delete().eq("id", id);
    if (!error) setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        fetchTasks,
        createTask,
        updateTask,
        deleteTask,
        editingTask,
        setEditingTask,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => useContext(TaskContext);
