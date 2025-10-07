// src/components/TaskCard.jsx
import { useContext } from "react"
import { TaskProvider } from "../context/TaskContext"
import { Pencil, Trash2 } from "lucide-react"

export default function TaskCard({ task }) {
  const { deleteTask, setEditingTask } = useContext(TaskProvider);

  return (
    <div className="bg-white rounded-lg shadow-md p-3 mb-3 border border-gray-200 hover:shadow-lg transition">
      <h3 className="font-semibold text-gray-800">{task.title}</h3>
      <p className="text-sm text-gray-500 mt-1">{task.description}</p>
      <div className="flex justify-between items-center mt-3">
        <span
          className={`text-xs px-2 py-1 rounded ${
            task.status === "To Do"
              ? "bg-gray-200 text-gray-700"
              : task.status === "In Progress"
              ? "bg-yellow-200 text-yellow-800"
              : "bg-green-200 text-green-800"
          }`}
        >
          {task.status}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setEditingTask(task)}
            className="text-blue-600 hover:text-blue-800"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => deleteTask(task.id)}
            className="text-red-600 hover:text-red-800"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
