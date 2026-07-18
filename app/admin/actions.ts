'use server'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function verifyStudent(profileId: string, status: 'verified' | 'rejected') {
  const supabase = await createClient()
  const { error } = await supabase
    .from('profiles')
    .update({ verification_status: status })
    .eq('id', profileId)

  if (error) {
    return { error: error.message }
  }
  
  revalidatePath('/admin')
  return { success: true }
}
