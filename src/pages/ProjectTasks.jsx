// src/pages/ProjectTasks.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

export default function ProjectTasks() {
  const { projectId } = useParams();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const statuses = ["todo", "in_progress", "done"];

  // Fetch tasks
  const fetchTasks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true });
    if (!error) setTasks(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  const createTask = async () => {
    const title = prompt("Enter task title:");
    if (!title) return;
    const { error } = await supabase.from("tasks").insert([
      { project_id: projectId, title }
    ]);
    if (!error) fetchTasks();
  };

  const deleteTask = async (id) => {
    await supabase.from("tasks").delete().eq("id", id);
    fetchTasks();
  };

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    const newStatus = destination.droppableId;

    await supabase.from("tasks").update({ status: newStatus }).eq("id", draggableId);
    fetchTasks();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Tasks</h1>
        <Button onClick={createTask}>+ New Task</Button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-3 gap-4">
            {statuses.map((status) => (
              <Droppable droppableId={status} key={status}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="bg-gray-100 p-4 rounded-lg min-h-[300px]"
                  >
                    <h2 className="text-lg font-bold mb-2 capitalize">{status.replace("_", " ")}</h2>
                    {tasks
                      .filter((t) => t.status === status)
                      .map((task, index) => (
                        <Draggable draggableId={task.id} index={index} key={task.id}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="bg-white shadow p-2 rounded mb-2 flex justify-between items-center"
                            >
                              <span>{task.title}</span>
                              <button
                                onClick={() => deleteTask(task.id)}
                                className="text-red-600 text-sm"
                              >
                                Delete
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
