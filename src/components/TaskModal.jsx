import React, { useEffect, useState } from 'react'
import { uploadAttachment } from '../hooks/useSupabaseCRUD'
import { useTasks } from '../context/TaskContext'

export default function TaskModal({ projectId, task, onClose }) {
  const { createTask, updateTask } = useTasks()
  const [title, setTitle] = useState(task?.title || '')
  const [description, setDescription] = useState(task?.description || '')
  const [dueDate, setDueDate] = useState(task?.due_date || '')
  const [priority, setPriority] = useState(task?.priority || 'Normal')
  const [status, setStatus] = useState(task?.status || 'todo')
  const [fileUploading, setFileUploading] = useState(false)

  useEffect(() => {
    setTitle(task?.title || '')
    setDescription(task?.description || '')
    setDueDate(task?.due_date || '')
    setPriority(task?.priority || 'Normal')
    setStatus(task?.status || 'todo')
  }, [task])

  async function onSave(e) {
    e.preventDefault()
    const payload = {
      title, description, due_date: dueDate || null, priority, status,
      project_id: projectId
    }
    try {
      if (task) await updateTask(task.id, payload)
      else await createTask(payload)
      onClose()
    } catch (err) {
      alert(err.message)
    }
  }

  async function onFileChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setFileUploading(true)
    try {
      const url = await uploadAttachment(projectId, file)
      setDescription(prev => `${prev}\n\nAttachment: ${url}`)
    } catch (err) {
      alert('Upload error')
    } finally {
      setFileUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <form onSubmit={onSave} className="bg-white p-6 rounded shadow z-10 w-full max-w-lg">
        <h3 className="text-lg font-semibold mb-4">{task ? 'Edit Task' : 'New Task'}</h3>
        <input required value={title} onChange={e=>setTitle(e.target.value)} className="w-full p-2 border rounded mb-2" placeholder="Title" />
        <textarea value={description} onChange={e=>setDescription(e.target.value)} className="w-full p-2 border rounded mb-2" rows={4} placeholder="Description" />
        <div className="flex gap-2 mb-2">
          <input type="date" value={dueDate || ''} onChange={e=>setDueDate(e.target.value)} className="p-2 border rounded" />
          <select value={priority} onChange={e=>setPriority(e.target.value)} className="p-2 border rounded">
            <option>Low</option>
            <option>Normal</option>
            <option>High</option>
          </select>
          <select value={status} onChange={e=>setStatus(e.target.value)} className="p-2 border rounded">
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>
        <div className="mb-4">
          <input type="file" onChange={onFileChange} />
          {fileUploading && <div className="text-xs text-slate-500 mt-1">Uploading...</div>}
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-3 py-2 rounded border">Cancel</button>
          <button type="submit" className="px-3 py-2 rounded bg-indigo-600 text-white">Save</button>
        </div>
      </form>
    </div>
  )
}
