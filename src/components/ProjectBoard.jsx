import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, Archive, Edit, Trash2 } from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import TaskCard from './TaskCard';
import TaskModal from './TaskModal';
import ProjectModal from './ProjectModal';

export default function ProjectBoard() {
  const { user } = useAuth();
  const { 
    tasks, 
    projects, 
    loading, 
    createProject, 
    updateProject, 
    archiveProject, 
    loadTasks,
    updateTask 
  } = useTasks();
  
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  const STATUSES = [
    { id: 'todo', title: 'To Do', color: 'bg-gray-100' },
    { id: 'in_progress', title: 'In Progress', color: 'bg-blue-100' },
    { id: 'done', title: 'Done', color: 'bg-green-100' }
  ];

  const PRIORITIES = {
    low: { label: 'Low', color: 'text-green-600 bg-green-100' },
    medium: { label: 'Medium', color: 'text-yellow-600 bg-yellow-100' },
    high: { label: 'High', color: 'text-orange-600 bg-orange-100' },
    urgent: { label: 'Urgent', color: 'text-red-600 bg-red-100' }
  };

  useEffect(() => {
    if (selectedProject) {
      loadTasks({ project_id: selectedProject.id });
    }
  }, [selectedProject]);

  const filteredTasks = tasks.filter(task => {
    if (selectedProject && task.project_id !== selectedProject.id) return false;
    if (filterStatus !== 'all' && task.status !== filterStatus) return false;
    if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
    return true;
  });

  const groupedTasks = STATUSES.reduce((acc, status) => {
    acc[status.id] = filteredTasks.filter(task => task.status === status.id);
    return acc;
  }, {});

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId) return;

    const task = tasks.find(t => t.id === draggableId);
    if (!task) return;

    const newStatus = destination.droppableId;
    
    try {
      await updateTask(task.id, { status: newStatus });
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const handleCreateProject = () => {
    setEditingProject(null);
    setProjectModalOpen(true);
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setProjectModalOpen(true);
  };

  const handleArchiveProject = async (project) => {
    if (window.confirm(`Archive project "${project.name}"?`)) {
      await archiveProject(project.id);
    }
  };

  const handleSaveProject = () => {
    setProjectModalOpen(false);
    setEditingProject(null);
  };

  const handleCreateTask = () => {
    setEditingTask(null);
    setTaskModalOpen(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setTaskModalOpen(true);
  };

  const handleSaveTask = () => {
    setTaskModalOpen(false);
    setEditingTask(null);
  };

  const activeProjects = projects.filter(p => !p.archived);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Project Management</h1>
            <button
              onClick={handleCreateProject}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              <Plus size={16} />
              New Project
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Project Selection */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Projects</h2>
          {activeProjects.length === 0 ? (
            <p className="text-gray-500">No active projects. Create your first project!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {activeProjects.map(project => (
                <div key={project.id} className="bg-white p-4 rounded-lg shadow">
                  <h3 className="font-semibold mb-2">{project.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{project.description}</p>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedProject(project)}
                      className="flex-1 px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleEditProject(project)}
                      className="p-1 text-gray-600 hover:text-indigo-600"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleArchiveProject(project)}
                      className="p-1 text-gray-600 hover:text-red-600"
                    >
                      <Archive size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Project Board */}
        {selectedProject && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold">{selectedProject.name}</h2>
                  <p className="text-gray-600">{selectedProject.description}</p>
                </div>
                <button
                  onClick={handleCreateTask}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  <Plus size={16} />
                  New Task
                </button>
              </div>

              {/* Filters */}
              <div className="flex gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300"
                  >
                    <option value="all">All</option>
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Priority</label>
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300"
                  >
                    <option value="all">All</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-6">
              <DragDropContext onDragEnd={handleDragEnd}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {STATUSES.map(status => (
                    <div key={status.id} className="bg-gray-50 rounded-lg p-4">
                      <h3 className={`font-semibold mb-3 px-3 py-1 rounded ${status.color}`}>
                        {status.title}
                        <span className="ml-2 text-sm text-gray-600">
                          ({groupedTasks[status.id]?.length || 0})
                        </span>
                      </h3>
                      
                      <Droppable droppableId={status.id}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={`min-h-[200px] rounded ${
                              snapshot.isDraggingOver ? 'bg-gray-100' : ''
                            }`}
                          >
                            {groupedTasks[status.id]?.map((task, index) => (
                              <Draggable
                                key={task.id}
                                draggableId={task.id}
                                index={index}
                              >
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className={`mb-2 ${snapshot.isDragging ? 'opacity-50' : ''}`}
                                  >
                                    <TaskCard
                                      task={task}
                                      onEdit={handleEditTask}
                                    />
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  ))}
                </div>
              </DragDropContext>
            </div>
          </div>
        )}

        {/* Modals */}
        {projectModalOpen && (
          <ProjectModal
            project={editingProject}
            onClose={() => setProjectModalOpen(false)}
            onSave={handleSaveProject}
          />
        )}

        {taskModalOpen && (
          <TaskModal
            task={editingTask}
            projectId={selectedProject?.id}
            onClose={() => setTaskModalOpen(false)}
            onSave={handleSaveTask}
          />
        )}
      </div>
    </div>
  );
}