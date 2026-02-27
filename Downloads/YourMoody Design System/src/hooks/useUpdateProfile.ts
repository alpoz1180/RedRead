import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export function useUpdateProfile() {
  const [loading, setLoading] = useState(false);

  const updateProfile = async (fullName: string, avatarEmoji: string) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Kullanıcı bulunamadı');
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          avatar_emoji: avatarEmoji,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Profil güncellendi! 🎉');
      return true;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error updating profile:', error);
      }
      toast.error('Profil güncellenemedi');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    updateProfile,
    loading,
  };
}
