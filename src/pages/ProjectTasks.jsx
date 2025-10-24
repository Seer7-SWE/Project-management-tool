// src/pages/ProjectTasks.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

export default function ProjectTasks() {
  // IMPORTANT: use the same param name your route defines.
  // If your App route is "/projects/:projectId/tasks" use projectId here.
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const columns = {
    todo: { title: "Todo", color: "bg-gray-100" },
    in_progress: { title: "In Progress", color: "bg-gray-100" },
    done: { title: "Done", color: "bg-gray-100" },
  };

  useEffect(() => {
    if (!projectId) return;
    fetchTasks();

    // optional: realtime updates for this project tasks
    const channel = supabase
      .channel(`tasks-project-${projectId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks", filter: `project_id=eq.${projectId}` },
        (payload) => {
          // simple strategy: re-fetch on any change
          fetchTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  async function fetchTasks() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("fetchTasks error:", error);
        setTasks([]);
      } else {
        setTasks(data || []);
      }
    } catch (err) {
      console.error("Unexpected fetchTasks error:", err);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }

  // Create task using prompt (keeps UI minimal). Improved error handling below.
  async function createTask() {
    if (!projectId) return alert("Invalid project id. Cannot create task.");

    const title = prompt("Enter task title (required):");
    if (!title || !title.trim()) return alert("Title is required.");

    const description = prompt("Enter description (optional):") || "";
    const status = prompt("Enter status (todo / in_progress / done):", "todo") || "todo";

    if (!["todo", "in_progress", "done"].includes(status)) {
      return alert("Invalid status — use todo, in_progress, or done.");
    }

    try {
      // Insert and return created row
      const { data, error } = await supabase
        .from("tasks")
        .insert([
          {
            project_id: projectId,
            title: title.trim(),
            description: description || null,
            status,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Supabase insert error:", error);
        alert("Could not create task: " + (error.message || JSON.stringify(error)));
        return;
      }

      // optimistic update: push task to UI (or re-fetch)
      setTasks(prev => [data, ...prev]);
    } catch (err) {
      console.error("Unexpected createTask error:", err);
      alert("Could not create task (unexpected error). See console for details.");
    }
  }

  async function deleteTask(taskId) {
    if (!confirm("Delete this task?")) return;
    try {
      const { error } = await supabase.from("tasks").delete().eq("id", taskId);
      if (error) {
        console.error("deleteTask error:", error);
        alert("Delete failed: " + error.message);
        return;
      }
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (err) {
      console.error("Unexpected deleteTask error:", err);
      alert("Delete failed (unexpected). See console.");
    }
  }

  // Drag end: update status in DB and in UI
  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;
    const newStatus = destination.droppableId;

    // find moved task object
    const movedTask = tasks.find(t => t.id === draggableId);
    if (!movedTask) return;

    // Optimistic UI update
    const newTasks = Array.from(tasks);
    const [removed] = newTasks.splice(source.index, 1);
    removed.status = newStatus;
    newTasks.splice(destination.index, 0, removed);
    setTasks(newTasks);

    // Persist status change
    try {
      const { error } = await supabase.from("tasks").update({ status: newStatus }).eq("id", draggableId);
      if (error) {
        console.error("onDragEnd update error:", error);
        // revert by re-fetching
        fetchTasks();
      }
    } catch (err) {
      console.error("Unexpected onDragEnd error:", err);
      fetchTasks();
    }
  };

  if (!projectId) {
    return (
      <div className="p-6">
        <p className="text-red-600">No project selected. Go back to dashboard and choose a project.</p>
        <button onClick={() => navigate("/")} className="mt-4 px-4 py-2 bg-gray-200 rounded">Back</button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Tasks</h1>
        <div className="flex gap-2">
          <button onClick={() => navigate("/")} className="px-3 py-1 bg-gray-200 rounded">Back</button>
          <button onClick={createTask} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">+ New Task</button>
        </div>
      </div>

      {loading ? (
        <p>Loading tasks...</p>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-3 gap-6">
            {Object.entries(columns).map(([status, { title, color }]) => (
              <Droppable droppableId={status} key={status}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`p-4 rounded-lg ${color} min-h-[240px]`}
                  >
                    <h2 className="text-lg font-bold mb-2">{title}</h2>

                    {tasks
                      .filter((t) => (t.status || "todo") === status)
                      .map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="bg-white p-3 rounded shadow mb-2 flex justify-between items-center"
                            >
                              <div>
                                <div className="font-medium">{task.title}</div>
                                {task.description && <div className="text-sm text-gray-500">{task.description}</div>}
                              </div>
                              <button onClick={() => deleteTask(task.id)} className="text-red-500 font-bold">✕</button>
                            </div>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
      )}
    </div>
  );
}
