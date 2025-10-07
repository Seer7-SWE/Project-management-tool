import { supabase } from './supabaseClient';

export const storage = {
  bucketName: 'task-attachments',
  
  async uploadFile(file, path) {
    const { data, error } = await supabase.storage
      .from(this.bucketName)
      .upload(path, file);
    
    if (error) throw error;
    return data;
  },

  async getFileUrl(path) {
    const { data } = supabase.storage
      .from(this.bucketName)
      .getPublicUrl(path);
    
    return data.publicUrl;
  },

  async deleteFile(path) {
    const { error } = await supabase.storage
      .from(this.bucketName)
      .remove([path]);
    
    if (error) throw error;
    return true;
  },

  async listFiles(prefix = '') {
    const { data, error } = await supabase.storage
      .from(this.bucketName)
      .list(prefix);
    
    if (error) throw error;
    return data;
  }
};