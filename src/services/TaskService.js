import { supabase } from "../utils/supabaseClient";

// Fetch all tasks for current user
export async function getTasksForUser(user) {
  const { data, error } = await supabase
    from("tasks")
    .select("*")
    .eq("assigned_to_auth", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

// Add new task
export async function addTask(task) {
  const { data, error } = await supabase.from("tasks").insert([task]).select();
  if (error) throw error;
  return data[0];
}

// Update task
export async function updateTask(id, updates) {
  const { data, error } = await supabase.from("tasks").update(updates).eq("id", id).select();
  if (error) throw error;
  return data[0];
}

// Delete task
export async function deleteTask(id) {
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) throw error;
}
