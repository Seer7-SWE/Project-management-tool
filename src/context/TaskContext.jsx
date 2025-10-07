import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import { useAuth } from "./AuthContext";

const TaskContext = createContext();

export default function TaskProvider = ({ children }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load tasks for current user (or all tasks)
  async function loadTasks() {
    if (!user) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) console.error("Error fetching tasks:", error);
    else setTasks(data || []);
    setLoading(false);
  }

  // Add new task
  async function addTask(task) {
    const { data, error } = await supabase.from("tasks").insert([task]);
    if (error) console.error("Error adding task:", error);
    else setTasks((prev) => [...prev, ...data]);
  }

  // Update task
  async function updateTask(id, updates) {
    const { data, error } = await supabase
      .from("tasks")
      .update(updates)
      .eq("id", id)
      .select();

    if (error) console.error("Error updating task:", error);
    else
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...data[0] } : t))
      );
  }

  // Delete task
  async function deleteTask(id) {
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) console.error("Error deleting task:", error);
    else setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  // Subscribe to realtime updates
  useEffect(() => {
    loadTasks();

    const channel = supabase
      .channel("public:tasks")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks" },
        (payload) => {
          console.log("Realtime payload:", payload);

          if (payload.eventType === "INSERT") {
            setTasks((prev) => [payload.new, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setTasks((prev) =>
              prev.map((t) => (t.id === payload.new.id ? payload.new : t))
            );
          } else if (payload.eventType === "DELETE") {
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
      value={{ tasks, loading, addTask, updateTask, deleteTask, loadTasks }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => useContext(TaskContext);
