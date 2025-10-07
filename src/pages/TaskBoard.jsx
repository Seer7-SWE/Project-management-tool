import React, { useState } from "react";
import { useTasks } from '../context/TaskContext';
import TaskCard from '../components/TaskCard';
import TaskModal from "../components/TaskModal";

export default function TaskBoard() {
  const { tasks, loading } = useTasks();
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const handleCreateTask = () => {
    setEditingTask(null);
    setShowModal(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowModal(true);
  };

  const handleSaveTask = () => {
    setShowModal(false);
    setEditingTask(null);
  };

  if (loading) return <p className="text-center mt-10">Loading tasks...</p>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Your Tasks</h1>
        <button
          onClick={handleCreateTask}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          + New Task
        </button>
      </div>

      {tasks.length === 0 ? (
        <p className="text-gray-500">No tasks yet. Add your first task above.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {tasks.map((task) => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onEdit={handleEditTask}
            />
          ))}
        </div>
      )}

      {showModal && (
        <TaskModal
          task={editingTask}
          projectId={null}
          onClose={() => setShowModal(false)}
          onSave={handleSaveTask}
        />
      )}
    </div>
  );
}