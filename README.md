# Project Management Tool

A comprehensive project management application built with React, Supabase, and Tailwind CSS, featuring kanban-style task boards, real-time collaboration, and file attachments.

## 🚀 Live Demo
Visit the live application: [https://project-management-tool5.netlify.app/](https://project-management-tool5.netlify.app/)

## ✨ Features

### 📊 Project Management
- **Create Projects**: Add new projects with name and description
- **List Projects**: View all active projects in a clean grid layout
- **Edit Projects**: Modify project details at any time
- **Archive Projects**: Soft-delete projects to keep workspace clean
- **Real-time Updates**: See project changes instantly across all users

### ✅ Task Management
- **Create Tasks**: Add tasks with rich metadata
- **Edit Tasks**: Update all task properties including drag-and-drop status changes
- **Delete Tasks**: Remove tasks with confirmation
- **Assign Tasks**: Assign tasks to team members
- **Set Status**: To Do, In Progress, Done
- **Priority Levels**: Low, Medium, High, Urgent
- **Due Dates**: Set and track task deadlines
- **Tags**: Add custom tags for categorization
- **File Attachments**: Upload and manage files with each task

### 🎯 Kanban Board
- **Drag-and-Drop**: Intuitive card-based interface
- **Status Columns**: Visual workflow with To Do → In Progress → Done
- **Real-time Sync**: All users see changes instantly
- **Filtering**: Filter by status, priority, and assignee
- **Search**: Find tasks quickly by title

### 📁 File Management
- **Upload Files**: Attach files to tasks using Supabase Storage
- **View Attachments**: See all files associated with a task
- **File Previews**: Basic file type support
- **Delete Files**: Remove attachments when no longer needed

### 👥 Collaboration
- **User Assignment**: Assign tasks to team members
- **Real-time Updates**: Supabase Realtime for live collaboration
- **User Profiles**: Display names and avatars
- **Multi-user Support**: Concurrent editing with conflict resolution

### 🔐 Authentication
- **User Registration**: Secure sign-up with email
- **User Login**: Password-protected access
- **Protected Routes**: Only authenticated users can access features

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **React Router v6** - Client-side routing
- **Tailwind CSS** - Styling framework
- **Lucide React** - Icons
- **Framer Motion** - Animations
- **React Hook Form** - Form handling

### Backend
- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - Database
- **Supabase Auth** - Authentication
- **Supabase Storage** - File storage
- **Supabase Realtime** - Live updates

### Libraries
- **@hello-pangea/dnd** - Drag and drop
- **React Query** - Data fetching and caching

## 🏗️ Architecture

### Database Schema
```sql
-- Projects
- id (UUID, PK)
- name (TEXT)
- description (TEXT)
- created_by (UUID, FK)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- archived (BOOLEAN)

-- Tasks
- id (UUID, PK)
- title (TEXT)
- description (TEXT)
- status (ENUM: todo, in_progress, done)
- priority (ENUM: low, medium, high, urgent)
- tags (TEXT[])
- due_date (DATE)
- project_id (UUID, FK)
- assigned_to (UUID, FK)
- created_by (UUID, FK)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

-- Task Attachments
- id (UUID, PK)
- task_id (UUID, FK)
- filename (TEXT)
- file_url (TEXT)
- file_size (INTEGER)
- mime_type (TEXT)
- uploaded_by (UUID, FK)
- uploaded_at (TIMESTAMP)

-- Project Members
- id (UUID, PK)
- project_id (UUID, FK)
- user_id (UUID, FK)
- role (ENUM: owner, admin, member)
- joined_at (TIMESTAMP)
```

### Component Structure
```
src/
├── components/
│   ├── ProjectBoard.jsx      # Main kanban board
│   ├── ProjectModal.jsx      # Create/edit projects
│   ├── TaskBoard.jsx         # Task management component
│   ├── TaskCard.jsx          # Individual task display
│   ├── TaskModal.jsx         # Create/edit tasks
│   ├── Navbar.jsx            # Navigation component
│   └── Sidebar.jsx           # Project sidebar
├── context/
│   ├── AuthContext.jsx       # Authentication state
│   └── TaskContext.jsx       # Global task/project state
├── pages/
│   ├── Dashboard.jsx         # Main dashboard
│   ├── Login.jsx             # Login page
│   ├── Register.jsx          # Registration page
│   └── TaskBoard.jsx         # Task board page
├── services/
│   └── TaskService.js        # API service layer
├── utils/
│   ├── supabaseClient.js     # Supabase client setup
│   └── storageConfig.js      # File storage utilities
└── styles/
    └── globals.css           # Global styles
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm
- Supabase account
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Seer5Developer/Project-management-tool.git
cd Project-management-tool
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Set up Supabase**
- Create a new Supabase project
- Run the database schema from `database-schema.sql`
- Enable Row Level Security (RLS) policies
- Set up authentication providers
- Create storage bucket named "task-attachments"

5. **Start the development server**
```bash
npm run dev
```

6. **Build for production**
```bash
npm run build
```

## 🔧 Configuration

### Supabase Setup
1. **Database Tables**: Run the SQL schema provided in `database-schema.sql`
2. **Storage**: Create a storage bucket named "task-attachments"
3. **Authentication**: Enable email/password authentication
4. **Policies**: The schema includes comprehensive RLS policies

### Environment Variables
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 📱 Usage Guide

### Creating Projects
1. Click "New Project" on the main dashboard
2. Enter project name and description
3. Click "Save Project" to create

### Managing Tasks
1. Select a project from the project list
2. Click "New Task" to create a task
3. Fill in task details:
   - Title and description
   - Status (To Do/In Progress/Done)
   - Priority level
   - Due date
   - Tags
   - Assignee
4. Click "Save Task" to create

### Kanban Board
- **Drag and Drop**: Move tasks between columns to update status
- **Edit Tasks**: Click the edit icon on any task card
- **Delete Tasks**: Click the trash icon with confirmation
- **Filter**: Use dropdown filters to view specific tasks

### File Attachments
1. When creating or editing a task
2. Click "Choose File" to select an attachment
3. Files are automatically uploaded to Supabase Storage
4. View attachments in task details

## 🔒 Security Features

- **Row Level Security (RLS)**: Database-level access control
- **Authentication**: Secure user authentication with Supabase Auth
- **File Security**: Storage bucket policies for file access
- **Data Validation**: Input validation and sanitization
- **HTTPS**: All communications encrypted

## 🎯 Performance Optimizations

- **Database Indexes**: Optimized queries with proper indexing
- **Real-time Updates**: Efficient WebSocket connections
- **Lazy Loading**: Components load as needed
- **Image Optimization**: Automatic file compression
- **Caching**: React Query for data caching

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

For support, please open an issue on the GitHub repository or contact the development team.

## 🔄 Changelog

### v2.0.0 - Enhanced Features
- ✅ Added comprehensive project management
- ✅ Enhanced task management with priority, tags, due dates
- ✅ Kanban board with drag-and-drop
- ✅ File attachments support
- ✅ Real-time collaboration
- ✅ User assignment system
- ✅ Archive functionality
- ✅ Advanced filtering and search
- ✅ Responsive design improvements

### v1.0.0 - Initial Release
- ✅ Basic task management
- ✅ User authentication
- ✅ Supabase integration
- ✅ Basic UI components