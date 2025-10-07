import { supabase } from "../utils/supabaseClient";

// Project services
export async function getProjects(user) {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .or(`created_by.eq.${user.id},archived.eq.false`)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createProject(project) {
  const { data, error } = await supabase
    .from("projects")
    .insert([project])
    .select();

  if (error) throw error;
  return data[0];
}

export async function updateProject(id, updates) {
  const { data, error } = await supabase
    .from("projects")
    .update(updates)
    .eq("id", id)
    .select();

  if (error) throw error;
  return data[0];
}

export async function archiveProject(id) {
  return updateProject(id, { archived: true });
}

export async function deleteProject(id) {
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw error;
  return true;
}

// Task services
export async function getTasksForProject(projectId, filters = {}) {
  let query = supabase
    .from("tasks")
    .select(`
      *,
      project:projects(id, name),
      assigned_user:auth.users(id, email, raw_user_meta_data->display_name),
      attachments:task_attachments(*)
    `)
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (filters.status && filters.status !== 'all') {
    query = query.eq("status", filters.status);
  }

  if (filters.priority && filters.priority !== 'all') {
    query = query.eq("priority", filters.priority);
  }

  if (filters.assigned_to) {
    query = query.eq("assigned_to", filters.assigned_to);
  }

  if (filters.search) {
    query = query.ilike("title", `%${filters.search}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getTasksForUser(user) {
  const { data, error } = await supabase
    .from("tasks")
    .select(`
      *,
      project:projects(id, name),
      assigned_user:auth.users(id, email, raw_user_meta_data->display_name),
      attachments:task_attachments(*)
    `)
    .or(`assigned_to.eq.${user.id},created_by.eq.${user.id}`)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function addTask(task) {
  const { data, error } = await supabase
    .from("tasks")
    .insert([task])
    .select(`
      *,
      project:projects(id, name),
      assigned_user:auth.users(id, email, raw_user_meta_data->display_name),
      attachments:task_attachments(*)
    `);

  if (error) throw error;
  return data[0];
}

export async function updateTask(id, updates) {
  const { data, error } = await supabase
    .from("tasks")
    .update(updates)
    .eq("id", id)
    .select(`
      *,
      project:projects(id, name),
      assigned_user:auth.users(id, email, raw_user_meta_data->display_name),
      attachments:task_attachments(*)
    `);

  if (error) throw error;
  return data[0];
}

export async function deleteTask(id) {
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) throw error;
  return true;
}

// Attachment services
export async function uploadAttachment(taskId, file, userId) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${taskId}/${Date.now()}.${fileExt}`;
  
  // Upload to storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('task-attachments')
    .upload(fileName, file);

  if (uploadError) throw uploadError;

  // Save attachment record
  const { data, error } = await supabase
    .from("task_attachments")
    .insert([{
      task_id: taskId,
      filename: file.name,
      file_url: uploadData.path,
      file_size: file.size,
      mime_type: file.type,
      uploaded_by: userId,
    }])
    .select();

  if (error) throw error;
  return data[0];
}

export async function getTaskAttachments(taskId) {
  const { data, error } = await supabase
    .from("task_attachments")
    .select("*")
    .eq("task_id", taskId)
    .order("uploaded_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function deleteAttachment(id) {
  const { error } = await supabase.from("task_attachments").delete().eq("id", id);
  if (error) throw error;
  return true;
}

// User services
export async function getUsers() {
  const { data, error } = await supabase
    .from("auth.users")
    .select("id, email, raw_user_meta_data->display_name");

  if (error) throw error;
  return data || [];
}

// Realtime subscriptions
export function subscribeToTasks(callback) {
  return supabase
    .channel("public:tasks")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "tasks" },
      callback
    )
    .subscribe();
}

export function subscribeToProjects(callback) {
  return supabase
    .channel("public:projects")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "projects" },
      callback
    )
    .subscribe();
}