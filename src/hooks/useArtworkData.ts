
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export const useArtworkData = (user: User | null) => {
  return useQuery({
    queryKey: ['artwork', user?.id],
    queryFn: async () => {
      if (user) {
        // Fetch user's own artwork (both published and unpublished)
        const { data, error } = await supabase
          .from('artwork')
          .select(`
            id, 
            title, 
            created_at, 
            description,
            medium,
            year,
            user_id,
            published,
            type,
            content,
            profiles!inner (
              email,
              artist_name
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching user artwork:', error);
          return [];
        }

        return data || [];
      } else {
        // Fetch all published artwork for non-authenticated users
        const { data, error } = await supabase
          .from('artwork')
          .select(`
            id, 
            title, 
            created_at, 
            description,
            medium,
            year,
            user_id,
            type,
            content,
            profiles!inner (
              email,
              artist_name
            )
          `)
          .eq('published', true)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching artwork:', error);
          return [];
        }

        return data || [];
      }
    },
  });
};
