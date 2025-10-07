-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  archived BOOLEAN DEFAULT FALSE
);

-- Tasks table with enhanced features
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  tags TEXT[] DEFAULT '{}',
  due_date DATE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES auth.users(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Task attachments table
CREATE TABLE IF NOT EXISTS task_attachments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project members table for collaboration
CREATE TABLE IF NOT EXISTS project_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;

-- Create policies for projects
CREATE POLICY "Users can view their own projects" ON projects
  FOR SELECT USING (
    created_by = auth.uid() OR 
    id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create projects" ON projects
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own projects" ON projects
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can archive their own projects" ON projects
  FOR UPDATE USING (created_by = auth.uid());

-- Create policies for tasks
CREATE POLICY "Users can view tasks in their projects" ON tasks
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM projects WHERE 
        created_by = auth.uid() OR 
        id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Users can create tasks in their projects" ON tasks
  FOR INSERT WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE 
        created_by = auth.uid() OR 
        id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Users can update tasks in their projects" ON tasks
  FOR UPDATE USING (
    project_id IN (
      SELECT id FROM projects WHERE 
        created_by = auth.uid() OR 
        id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Users can delete tasks in their projects" ON tasks
  FOR DELETE USING (
    project_id IN (
      SELECT id FROM projects WHERE 
        created_by = auth.uid() OR 
        id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid())
    )
  );

-- Create policies for attachments
CREATE POLICY "Users can view attachments in their tasks" ON task_attachments
  FOR SELECT USING (
    task_id IN (
      SELECT id FROM tasks WHERE 
        project_id IN (
          SELECT id FROM projects WHERE 
            created_by = auth.uid() OR 
            id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid())
        )
    )
  );

CREATE POLICY "Users can upload attachments to their tasks" ON task_attachments
  FOR INSERT WITH CHECK (
    task_id IN (
      SELECT id FROM tasks WHERE 
        project_id IN (
          SELECT id FROM projects WHERE 
            created_by = auth.uid() OR 
            id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid())
        )
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_project_members_project_id ON project_members(project_id);
CREATE INDEX idx_task_attachments_task_id ON task_attachments(task_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();