import { supabase } from '../utils/supabaseClient';

export default function FileUpload({ taskId, onUploaded }) {
  async function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const filePath = `task-files/${taskId}/${file.name}`;
    const { data, error } = await supabase.storage.from('attachments').upload(filePath, file);
    if (error) { alert(error.message); return; }
    // Save file URL/path to task row in DB
    const publicUrl = supabase.storage.from('attachments').getPublicUrl(filePath).data.publicUrl;
    await supabase.from('tasks').update({ file_url: publicUrl }).eq('id', taskId);
    onUploaded && onUploaded(publicUrl);
  }
  return <input type="file" onChange={handleFileChange} />;
}
