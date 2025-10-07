# Supabase Setup Guide

Follow these steps to set up your Supabase backend for the Project Management Tool.

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click "New Project"
4. Enter project details:
   - Name: `project-management-tool`
   - Database Password: (save this securely)
   - Region: Choose closest to your users

## 2. Database Setup

1. Go to the SQL Editor in your Supabase dashboard
2. Copy and paste the contents of `database-schema.sql`
3. Click "Run" to execute the SQL commands

## 3. Authentication Setup

1. Go to Authentication → Providers
2. Enable Email provider
3. Configure settings:
   - Enable "Confirm email" (optional)
   - Set "SMTP Settings" for production emails

## 4. Storage Setup

1. Go to Storage → Buckets
2. Click "New Bucket"
3. Create bucket with these settings:
   - Name: `task-attachments`
   - Public bucket: Yes
   - File size limit: 50MB (or your preference)
4. Click "Create bucket"

## 5. Environment Variables

Create a `.env` file in your project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

To find these values:
- **Supabase URL**: Go to Settings → API → Project URL
- **Anon Key**: Go to Settings → API → Project API keys → anon public

## 6. Row Level Security (RLS)

The database schema includes comprehensive RLS policies. Verify they are enabled:

1. Go to Authentication → Policies
2. You should see policies for:
   - projects
   - tasks
   - task_attachments
   - project_members

## 7. Test the Setup

1. Start your development server: `npm run dev`
2. Register a new user
3. Create your first project
4. Add tasks and test all features

## Troubleshooting

### Common Issues

1. **"TaskProvider is not defined"**
   - Ensure you've set up the environment variables correctly
   - Check that all database tables were created

2. **File uploads not working**
   - Verify the storage bucket exists and is public
   - Check storage policies are correct

3. **Real-time updates not working**
   - Ensure RLS policies are properly configured
   - Check browser console for WebSocket errors

4. **Database connection errors**
   - Verify your Supabase URL and anon key are correct
   - Check network connectivity

### Getting Help

- Check the browser console for error messages
- Review Supabase logs in your dashboard
- Ensure all dependencies are installed: `npm install`
- Check that your build succeeds: `npm run build`

## Production Deployment

When deploying to production:

1. Set up custom SMTP for authentication emails
2. Configure custom domain for Supabase
3. Set up proper CORS settings
4. Enable rate limiting
5. Set up monitoring and alerts
6. Configure backup policies

## Security Considerations

- Keep your service role key secure (never expose to frontend)
- Use strong database passwords
- Enable 2FA on your Supabase account
- Regularly review and update RLS policies
- Monitor usage and set up alerts for unusual activity