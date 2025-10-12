import React, { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { useParams } from "react-router-dom";

const STATUSES = ["todo", "in_progress", "done"];

export default function ProjectBoard() {
  const { projectId } = useParams();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;
    fetchTasks();

    // Real-time updates
    const channel = supabase
      .channel("tasks-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks", filter: `project_id=eq.${projectId}` },
        () => fetchTasks()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  async function fetchTasks() {
    setLoading(true);
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setTasks([]);
    } else {
      setTasks(data);
    }
    setLoading(false);
  }

  async function createTask() {
    const title = prompt("Enter task title:");
    if (!title?.trim()) return;

    const { error } = await supabase.from("tasks").insert([
      { project_id: projectId, title, status: "todo" },
    ]);
    if (error) alert("Error creating task: " + error.message);
    else await fetchTasks();
  }

  if (loading) return <div>Loading tasks...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Project Tasks</h1>
        <button
          onClick={createTask}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          + New Task
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {STATUSES.map((status) => (
          <div key={status} className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold capitalize mb-4">
              {status.replace("_", " ")}
            </h2>
            {tasks
              .filter((t) => t.status === status)
              .map((task) => (
                <div
                  key={task.id}
                  className="border rounded p-3 mb-3 bg-gray-50 hover:bg-gray-100"
                >
                  <p className="font-medium">{task.title}</p>
                  <p className="text-sm text-gray-500">
                    Priority: {task.priority || "Normal"}
                  </p>
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}
