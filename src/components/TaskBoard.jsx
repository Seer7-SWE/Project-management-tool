

import React from "react";
import { useTasks } from "../context/TaskContext";

export default function TaskBoard() {
  const { tasks, loading } = useTasks();

  if (loading) return <p className="p-4 text-gray-500">Loading tasks...</p>;
  if (!tasks.length)
    return <p className="p-4 text-gray-500">No tasks yet. Add one!</p>;

  const groups = {
    todo: tasks.filter((t) => t.status === "todo"),
    in_progress: tasks.filter((t) => t.status === "in_progress"),
    done: tasks.filter((t) => t.status === "done"),
  };

  return (
    <div className="grid grid-cols-3 gap-4 p-4">
      {Object.entries(groups).map(([status, list]) => (
        <div
          key={status}
          className="bg-gray-100 rounded-lg p-3 shadow-sm min-h-[300px]"
        >
          <h2 className="text-lg font-semibold mb-2 capitalize">
            {status.replace("_", " ")}
          </h2>
          {list.map((task) => (
            <div
              key={task.id}
              className="bg-white p-3 rounded-lg mb-2 shadow-sm border border-gray-200"
            >
              <p className="font-medium">{task.title}</p>
              {task.description && (
                <p className="text-sm text-gray-600">{task.description}</p>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}



// import React from 'react'
// import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
// import TaskCard from './TaskCard'
// import { useTasks } from '../context/TaskContext'
// import { supabase } from '../utils/supabaseClient'

// const STATUS = ['todo', 'in_progress', 'done']
// const LABELS = { todo: 'To Do', in_progress: 'In Progress', done: 'Done' }

// export default function TaskBoard({ onEdit }) {
//   const { tasks, loading, updateTask, deleteTask } = useTasks()

//   if (loading) return <div>Loading tasks...</div>

//   const grouped = {
//     todo: tasks.filter(t => t.status === 'todo'),
//     in_progress: tasks.filter(t => t.status === 'in_progress'),
//     done: tasks.filter(t => t.status === 'done')
//   }

//   async function onDragEnd(result) {
//     const { destination, source, draggableId } = result
//     if (!destination) return
//     if (destination.droppableId === source.droppableId) return

//     const newStatus = destination.droppableId
//     try {
//       await supabase.from('tasks').update({ status: newStatus }).eq('id', draggableId)
//     } catch (err) {
//       console.error('drag update error', err)
//     }
//   }

//   return (
//     <DragDropContext onDragEnd={onDragEnd}>
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         {STATUS.map(status => (
//           <Droppable droppableId={status} key={status}>
//             {(provided) => (
//               <div ref={provided.innerRef} {...provided.droppableProps} className="bg-white p-4 rounded shadow min-h-[300px]">
//                 <h3 className="font-semibold mb-3">{LABELS[status]}</h3>
//                 <div>
//                   {grouped[status].map((task, idx) => (
//                     <Draggable key={task.id} draggableId={task.id} index={idx}>
//                       {(prov) => (
//                         <div ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps}>
//                           <TaskCard task={task} onEdit={onEdit} onDelete={deleteTask} />
//                         </div>
//                       )}
//                     </Draggable>
//                   ))}
//                   {provided.placeholder}
//                 </div>
//               </div>
//             )}
//           </Droppable>
//         ))}
//       </div>
//     </DragDropContext>
//   )
// }
