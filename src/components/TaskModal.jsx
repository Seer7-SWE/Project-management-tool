import { useState } from "react";
import { addTask } from "../services/TaskService";

export default function TaskModal({ user, onClose, onAdded }) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title) return alert("Title required");

    await addTask({
      title,
      description: desc,
      assigned_to_auth: user.id,
      status: "todo",
      priority: "Normal",
    });

    onAdded();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
      <div className="bg-white p-6 rounded-xl w-96">
        <h2 className="text-xl font-semibold mb-4">Add Task</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Task title"
            className="border w-full mb-3 p-2 rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            placeholder="Description"
            className="border w-full mb-3 p-2 rounded"
            rows="3"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          ></textarea>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 px-4 py-2 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
