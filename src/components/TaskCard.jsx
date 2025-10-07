import React, { useState } from 'react';
import { Calendar, Tag, Paperclip, User, Clock, Trash2, Edit } from 'lucide-react';
import { useTasks } from '../context/TaskContext';

export default function TaskCard({ task, onEdit }) {
  const { deleteTask } = useTasks();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const PRIORITY_COLORS = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800'
  };

  const STATUS_COLORS = {
    todo: 'bg-gray-100 text-gray-800',
    in_progress: 'bg-blue-100 text-blue-800',
    done: 'bg-green-100 text-green-800'
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return `Due in ${diffDays} days`;
  };

  const handleDelete = async () => {
    if (await deleteTask(task.id)) {
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-gray-900 text-sm">{task.title}</h3>
        <div className="flex gap-1">
          <button
            onClick={() => onEdit(task)}
            className="p-1 text-gray-400 hover:text-indigo-600"
          >
            <Edit size={14} />
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-1 text-gray-400 hover:text-red-600"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {task.description && (
        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="flex flex-wrap gap-1 mb-2">
        <span className={`text-xs px-2 py-1 rounded-full ${PRIORITY_COLORS[task.priority]}`}>
          {task.priority}
        </span>
        <span className={`text-xs px-2 py-1 rounded-full ${STATUS_COLORS[task.status]}`}>
          {task.status.replace('_', ' ')}
        </span>
      </div>

      <div className="space-y-1 text-xs text-gray-600">
        {task.due_date && (
          <div className="flex items-center gap-1">
            <Calendar size={12} />
            <span>{formatDate(task.due_date)}</span>
          </div>
        )}

        {task.tags && task.tags.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap">
            <Tag size={12} />
            {task.tags.map((tag, index) => (
              <span key={index} className="bg-gray-100 px-2 py-0.5 rounded">
                {tag}
              </span>
            ))}
          </div>
        )}

        {task.assigned_user && (
          <div className="flex items-center gap-1">
            <User size={12} />
            <span>{task.assigned_user.raw_user_meta_data?.display_name || task.assigned_user.email}</span>
          </div>
        )}

        {task.attachments && task.attachments.length > 0 && (
          <div className="flex items-center gap-1">
            <Paperclip size={12} />
            <span>{task.attachments.length} attachment{task.attachments.length > 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-white bg-opacity-95 flex items-center justify-center rounded-lg">
          <div className="text-center p-2">
            <p className="text-xs mb-2">Delete task?</p>
            <div className="flex gap-1">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="text-xs px-2 py-1 bg-gray-200 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="text-xs px-2 py-1 bg-red-500 text-white rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}