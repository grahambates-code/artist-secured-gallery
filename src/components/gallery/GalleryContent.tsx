
import React from 'react';
import ArtworkGrid from '@/components/artwork/ArtworkGrid';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { User } from '@supabase/supabase-js';

interface Artwork {
  id: string;
  title: string;
  description?: string;
  medium?: string;
  year?: number;
  created_at: string;
  user_id: string;
  published?: boolean;
  type?: string;
  content?: any;
  profiles?: {
    email: string;
    artist_name?: string;
  };
}

interface GalleryContentProps {
  user: User | null;
  artworkData: Artwork[] | undefined;
  artworkLoading: boolean;
  onArtworkClick: (artwork: Artwork) => void;
  onArtworkDeleted: () => void;
}

const GalleryContent = ({ 
  user, 
  artworkData, 
  artworkLoading, 
  onArtworkClick, 
  onArtworkDeleted 
}: GalleryContentProps) => {
  return (
    <main className="container mx-auto px-6 py-12">
      <div className="mb-16">
        {artworkLoading ? (
          <div className="flex items-center justify-center py-24">
            <LoadingSpinner />
          </div>
        ) : artworkData && artworkData.length > 0 ? (
          <ArtworkGrid 
            artworks={artworkData} 
            onArtworkClick={onArtworkClick}
            onArtworkDeleted={onArtworkDeleted}
          />
        ) : (
          <div className="text-center py-24 border border-border">
            <p className="text-muted-foreground font-light text-lg">
              {user ? 'You haven\'t uploaded any artwork yet.' : 'No artwork available in the gallery yet.'}
            </p>
          </div>
        )}
      </div>
    </main>
  );
};

export default GalleryContent;
