import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import { useAuth } from "./AuthContext";

const TaskContext = createContext();

export const TaskProvider = ({ children, projectId }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [projectLoading, setProjectLoading] = useState(true);

  // Load projects
  async function loadProjects() {
    if (!user) return;
    setProjectLoading(true);
    
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) console.error("Error fetching projects:", error);
    else setProjects(data || []);
    setProjectLoading(false);
  }

  // Create new project
  async function createProject(project) {
    if (!user) return;
    
    const { data, error } = await supabase
      .from("projects")
      .insert([{ ...project, created_by: user.id }])
      .select();

    if (error) {
      console.error("Error creating project:", error);
      return null;
    }
    
    setProjects((prev) => [data[0], ...prev]);
    return data[0];
  }

  // Update project
  async function updateProject(id, updates) {
    const { data, error } = await supabase
      .from("projects")
      .update(updates)
      .eq("id", id)
      .select();

    if (error) {
      console.error("Error updating project:", error);
      return null;
    }
    
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...data[0] } : p))
    );
    return data[0];
  }

  // Archive project
  async function archiveProject(id) {
    return updateProject(id, { archived: true });
  }

  // Load tasks with filtering
  async function loadTasks(filters = {}) {
    if (!user) return;
    setLoading(true);

    let query = supabase
      .from("tasks")
      .select(`
        *,
        project:projects(id, name),
        assigned_user:auth.users(id, email, raw_user_meta_data->display_name)
      `)
      .order("created_at", { ascending: false });

    if (projectId) {
      query = query.eq("project_id", projectId);
    }

    if (filters.status) {
      query = query.eq("status", filters.status);
    }

    if (filters.priority) {
      query = query.eq("priority", filters.priority);
    }

    if (filters.assigned_to) {
      query = query.eq("assigned_to", filters.assigned_to);
    }

    const { data, error } = await query;

    if (error) console.error("Error fetching tasks:", error);
    else setTasks(data || []);
    setLoading(false);
  }

  // Add new task with enhanced features
  async function addTask(task) {
    if (!user) return null;
    
    const taskData = {
      ...task,
      created_by: user.id,
      assigned_to: task.assigned_to || user.id,
    };

    const { data, error } = await supabase
      .from("tasks")
      .insert([taskData])
      .select();

    if (error) {
      console.error("Error adding task:", error);
      return null;
    }
    
    setTasks((prev) => [...prev, ...data]);
    return data[0];
  }

  // Update task with drag-and-drop support
  async function updateTask(id, updates) {
    const { data, error } = await supabase
      .from("tasks")
      .update(updates)
      .eq("id", id)
      .select();

    if (error) {
      console.error("Error updating task:", error);
      return null;
    }
    
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...data[0] } : t))
    );
    return data[0];
  }

  // Delete task
  async function deleteTask(id) {
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    
    if (error) {
      console.error("Error deleting task:", error);
      return false;
    }
    
    setTasks((prev) => prev.filter((t) => t.id !== id));
    return true;
  }

  // Upload file attachment
  async function uploadFile(taskId, file) {
    if (!user) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${taskId}/${Date.now()}.${fileExt}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('task-attachments')
      .upload(fileName, file);

    if (uploadError) {
      console.error("Error uploading file:", uploadError);
      return null;
    }

    const { data: attachmentData, error: attachmentError } = await supabase
      .from("task_attachments")
      .insert([{
        task_id: taskId,
        filename: file.name,
        file_url: uploadData.path,
        file_size: file.size,
        mime_type: file.type,
        uploaded_by: user.id,
      }])
      .select();

    if (attachmentError) {
      console.error("Error saving attachment:", attachmentError);
      return null;
    }

    return attachmentData[0];
  }

  // Get task attachments
  async function getTaskAttachments(taskId) {
    const { data, error } = await supabase
      .from("task_attachments")
      .select("*")
      .eq("task_id", taskId)
      .order("uploaded_at", { ascending: false });

    if (error) {
      console.error("Error fetching attachments:", error);
      return [];
    }

    return data || [];
  }

  // Subscribe to realtime updates
  useEffect(() => {
    loadProjects();
    
    if (projectId) {
      loadTasks();
    }

    const projectsChannel = supabase
      .channel("public:projects")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "projects" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setProjects((prev) => [payload.new, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setProjects((prev) =>
              prev.map((p) => (p.id === payload.new.id ? payload.new : p))
            );
          } else if (payload.eventType === "DELETE") {
            setProjects((prev) => prev.filter((p) => p.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    const tasksChannel = supabase
      .channel("public:tasks")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks" },
        (payload) => {
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
      supabase.removeChannel(projectsChannel);
      supabase.removeChannel(tasksChannel);
    };
  }, [user, projectId]);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        projects,
        loading,
        projectLoading,
        addTask,
        updateTask,
        deleteTask,
        loadTasks,
        createProject,
        updateProject,
        archiveProject,
        loadProjects,
        uploadFile,
        getTaskAttachments,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => useContext(TaskContext);