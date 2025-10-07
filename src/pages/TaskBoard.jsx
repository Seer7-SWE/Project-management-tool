import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { useTasks } from '../context/TaskContext';
import TaskCard from '../components/TaskCard';
import { getTasksForUser, deleteTask } from "../services/TaskService";
import TaskModal from "../components/TaskModal";

export default function TaskBoard() {
  const { tasks, loading } = useTasks();

  if (loading) return <p className="text-center mt-10">Loading tasks...</p>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Your Tasks</h1>
        <TaskModal />
      </div>

      {tasks.length === 0 ? (
        <p className="text-gray-500">No tasks yet. Add your first task above.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
}


// export default function TaskBoard() {
//   const [tasks, setTasks] = useState([]);
//   const [user, setUser] = useState(null);
//   const [showModal, setShowModal] = useState(false);

//   useEffect(() => {
//     const session = supabase.auth.getSession();
//     session.then(({ data }) => setUser(data?.session?.user));
//   }, []);

//   useEffect(() => {
//     if (user) {
//       loadTasks();
//     }
//   }, [user]);

//   async function loadTasks() {
//     try {
//       const all = await getTasksForUser(user);
//       setTasks(all);
//     } catch (err) {
//       console.error("Error loading tasks:", err.message);
//     }
//   }

//   async function handleDelete(id) {
//     await deleteTask(id);
//     setTasks(tasks.filter((t) => t.id !== id));
//   }

//   return (
//     <div className="p-6">
//       <div className="flex justify-between items-center mb-4">
//         <h2 className="text-2xl font-semibold">Your Tasks</h2>
//         <button
//           className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
//           onClick={() => setShowModal(true)}
//         >
//           + New Task
//         </button>
//       </div>

//       {tasks.length === 0 ? (
//         <p className="text-gray-500">No tasks yet. Create one!</p>
//       ) : (
//         <div className="grid gap-4">
//           {tasks.map((task) => (
//             <div
//               key={task.id}
//               className="bg-white p-4 rounded-xl shadow flex justify-between items-center"
//             >
//               <div>
//                 <h3 className="font-bold">{task.title}</h3>
//                 <p className="text-sm text-gray-500">{task.status}</p>
//               </div>
//               <div className="flex gap-2">
//                 <button
//                   onClick={() => handleDelete(task.id)}
//                   className="text-red-500 hover:text-red-700"
//                 >
//                   Delete
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       {showModal && (
//         <TaskModal
//           user={user}
//           onClose={() => setShowModal(false)}
//           onAdded={loadTasks}
//         />
//       )}
//     </div>
//   );
// }
