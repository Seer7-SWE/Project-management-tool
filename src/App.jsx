import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Register from './pages/Register'
import TaskBoard from './pages/TaskBoard'

function Protected({ children }) {
  const { user } = useAuth()
 export default function App() {
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Protected><Dashboard /></Protected>} />
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/tasks" element={<Taskboard />} />
        <Route path="/tasks" element={<TaskBoard />} />
      </Routes>
    </AuthProvider>
  )
