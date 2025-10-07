import React, { useEffect, useState } from 'react'
import { supabase } from '../utils/supabaseClient'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import TaskBoard from '../components/TaskBoard'
import TaskModal from '../components/TaskModal'
import { TaskProvider } from '../context/TaskContext'

export default function Dashboard() {
  const [projects, setProjects] = useState([])
  const [activeProject, setActiveProject] = useState(null)
  const [taskModalOpen, setTaskModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)

  useEffect(() => {
    loadProjects()
    const ch = supabase.channel('projects-list').on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => loadProjects()).subscribe()
    return () => supabase.removeChannel(ch)
  }, [])

  async function loadProjects() {
    const { data, error } = supabase.from('projects').select('*').order('created_at', { ascending: false })
    if (error) console.error(error)
    else setProjects(data || [])
  }

  async function createProject() {
    const name = prompt('Project name')
    if (!name) return
    const { error } = supabase.from('projects').insert([{ name }])
    if (error) alert(error.message)
  }

  function openNewTask() {
    setEditingTask(null)
    setTaskModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="p-6 grid md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <Sidebar>
            <div className="mb-4">
              <button onClick={createProject} className="w-full bg-indigo-600 text-white px-3 py-2 rounded">+ New Project</button>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Projects</h4>
              <ul className="space-y-2">
                {projects.map(p => (
                  <li key={p.id}>
                    <button onClick={() => setActiveProject(p)} className={`w-full text-left p-2 rounded ${activeProject?.id === p.id ? 'bg-slate-200' : ''}`}>{p.name}</button>
                  </li>
                ))}
              </ul>
            </div>
          </Sidebar>
        </div>

        <div className="md:col-span-3">
          {!activeProject ? (
            <div className="bg-white p-6 rounded shadow text-center">
              <h3 className="text-lg font-semibold">Select or create a project</h3>
              <p className="text-sm text-slate-500 mt-2">Click a project on the left (or create a new one).</p>
            </div>
          ) : (
            <TaskProvider projectId={activeProject.id}>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-2xl font-semibold">{activeProject.name}</h2>
                  <p className="text-sm text-slate-500">{activeProject.description}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={openNewTask} className="bg-indigo-600 text-white px-3 py-2 rounded">New Task</button>
                </div>
              </div>

              <TaskBoard onEdit={(t)=>{ setEditingTask(t); setTaskModalOpen(true) }} />
              {taskModalOpen && <TaskModal projectId={activeProject.id} task={editingTask} onClose={() => setTaskModalOpen(false)} />}
            </TaskProvider>
          )}
        </div>
      </div>
    </div>
  )
}
