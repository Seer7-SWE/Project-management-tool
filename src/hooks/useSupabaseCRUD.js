import { supabase } from '../utils/supabaseClient'

// upload file to attachments bucket under path and return public URL
export async function uploadAttachment(projectId, file) {
  if (!file) return null
  const filePath = `${projectId}/tasks/${Date.now()}-${file.name}`
  const { data, error } = await supabase.storage.from('attachments').upload(filePath, file)
  if (error) {
    console.error('uploadAttachment error', error)
    throw error
  }
  const { data: publicData } = supabase.storage.from('attachments').getPublicUrl(data.path)
  return publicData.publicUrl
}
