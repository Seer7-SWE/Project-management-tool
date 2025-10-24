// src/pages/ProjectTasks.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

export default function ProjectTasks() {
  const { id } = useParams();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch tasks
  const fetchTasks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("project_id", id)
      .order("created_at", { ascending: true });

    if (error) console.error("Error loading tasks:", error);
    else setTasks(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks();
  }, [id]);

  // Create new task
  const createTask = async () => {
    const title = prompt("Enter task title:");
    if (!title) return;

    const description = prompt("Enter task description (optional):") || "";
    const status = prompt("Enter status (todo / in_progress / done):", "todo");

    if (!["todo", "in_progress", "done"].includes(status)) {
      alert("Invalid status — must be todo, in_progress, or done");
      return;
    }

    const { data, error } = await supabase.from("tasks").insert([
      { project_id: id, title, description, status },
    ]);

    if (error) {
      console.error("Error creating task:", error);
      alert("Could not create task");
    } else {
      fetchTasks();
    }
  };

  // Delete task
  const deleteTask = async (taskId) => {
    if (!confirm("Delete this task?")) return;
    const { error } = await supabase.from("tasks").delete().eq("id", taskId);
    if (error) console.error("Error deleting task:", error);
    else setTasks(tasks.filter((t) => t.id !== taskId));
  };

  // Handle drag and drop
  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;

    const updatedTasks = Array.from(tasks);
    const [moved] = updatedTasks.splice(source.index, 1);
    moved.status = destination.droppableId;
    updatedTasks.splice(destination.index, 0, moved);

    setTasks(updatedTasks);

    await supabase.from("tasks").update({ status: destination.droppableId }).eq("id", draggableId);
  };

  const columns = {
    todo: { title: "Todo", color: "bg-gray-100" },
    in_progress: { title: "In Progress", color: "bg-gray-100" },
    done: { title: "Done", color: "bg-gray-100" },
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Tasks</h1>
        <button
          onClick={createTask}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + New Task
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-3 gap-6">
            {Object.entries(columns).map(([status, { title, color }]) => (
              <Droppable droppableId={status} key={status}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`p-4 rounded-lg ${color} min-h-[400px]`}
                  >
                    <h2 className="text-lg font-bold mb-2">{title}</h2>
                    {tasks
                      .filter((t) => t.status === status)
                      .map((task, index) => (
                        <Draggable
                          key={task.id}
                          draggableId={task.id}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="bg-white p-3 rounded shadow mb-2 flex justify-between items-center"
                            >
                              <div>
                                <p className="font-medium">{task.title}</p>
                                {task.description && (
                                  <p className="text-sm text-gray-500">
                                    {task.description}
                                  </p>
                                )}
                              </div>
                              <button
                                onClick={() => deleteTask(task.id)}
                                className="text-red-500 hover:text-red-700 font-bold"
                              >
                                ✕
                              </button>
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
