import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ImageCard from './ImageCard';
import TextCard from './TextCard';
import SimpleThreeCard from './SimpleThreeCard';

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

interface ArtworkGridProps {
  artworks: Artwork[];
  onArtworkClick: (artwork: Artwork) => void;
  onArtworkDeleted?: () => void;
}

const ArtworkGrid = ({ artworks, onArtworkClick, onArtworkDeleted }: ArtworkGridProps) => {
  const { user } = useAuth();
  const { toast } = useToast();

  // Group artworks by artist email
  const groupedArtworks = artworks.reduce((groups: Record<string, Artwork[]>, artwork) => {
    const artistEmail = artwork.profiles?.email || 'Unknown Artist';
    if (!groups[artistEmail]) {
      groups[artistEmail] = [];
    }
    groups[artistEmail].push(artwork);
    return groups;
  }, {} as Record<string, Artwork[]>);

  const handleDeleteArtwork = async (artwork: Artwork, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent artwork click event
    
    if (!user || user.id !== artwork.user_id) {
      toast({
        title: "Permission denied",
        description: "You can only delete your own artwork",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('artwork')
        .delete()
        .eq('id', artwork.id);

      if (error) throw error;

      toast({
        title: "Artwork deleted",
        description: `"${artwork.title}" has been successfully deleted`,
      });

      // Trigger refresh of artwork list
      if (onArtworkDeleted) {
        onArtworkDeleted();
      }
    } catch (error: any) {
      console.error('Error deleting artwork:', error);
      toast({
        title: "Error deleting artwork",
        description: error.message || "Failed to delete artwork",
        variant: "destructive"
      });
    }
  };

  // Generate artist bios
  const getArtistBio = (email: string, artworkCount: number) => {
    const bios = [
      `A contemporary digital artist exploring the intersection of technology and human emotion through ${artworkCount} captivating pieces.`,
      `Master of light and shadow, this artist brings depth to digital canvases with ${artworkCount} stunning works that challenge perception.`,
      `An emerging talent in the digital art world, crafting ${artworkCount} unique pieces that blend traditional techniques with modern innovation.`,
      `Visionary artist pushing boundaries through experimental digital mediums, showcasing ${artworkCount} thought-provoking compositions.`,
      `Minimalist virtuoso creating powerful statements through simplicity, with ${artworkCount} pieces that speak volumes in silence.`,
      `Bold colorist and form experimenter, delivering ${artworkCount} dynamic works that pulse with creative energy.`
    ];
    
    // Use email hash to consistently assign same bio to same artist
    const index = email.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % bios.length;
    return bios[index];
  };

  const renderArtworkCard = (artwork: Artwork) => {
    const canDelete = user && user.id === artwork.user_id;
    const artworkType = artwork.type || 'image'; // Default to 'image' for backward compatibility

    if (artworkType === 'text') {
      return (
        <TextCard
          key={artwork.id}
          artwork={artwork}
          canDelete={canDelete}
          onClick={() => onArtworkClick(artwork)}
          onDelete={(e) => handleDeleteArtwork(artwork, e)}
        />
      );
    }

    if (artworkType === 'threejs') {
      return (
        <SimpleThreeCard
          key={artwork.id}
          artwork={artwork}
          canDelete={canDelete}
          onClick={() => onArtworkClick(artwork)}
          onDelete={(e) => handleDeleteArtwork(artwork, e)}
        />
      );
    }

    // Default to image card for 'image' type or any other type
    return (
      <ImageCard
        key={artwork.id}
        artwork={artwork}
        canDelete={canDelete}
        onClick={() => onArtworkClick(artwork)}
        onDelete={(e) => handleDeleteArtwork(artwork, e)}
      />
    );
  };

  return (
    <div className="space-y-16">
      {Object.entries(groupedArtworks).map(([artistEmail, artistWorks]) => (
        <div key={artistEmail} className="space-y-8">
          {/* Artist Header */}
          <div className="border-b border-border pb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-2 h-2 bg-foreground"></div>
              <h2 className="text-2xl font-light tracking-[0.15em] text-foreground uppercase">
                {artistWorks[0]?.profiles?.artist_name || artistEmail.split('@')[0]}
              </h2>
              <div className="flex-1 h-px bg-border"></div>
            </div>
            <p className="text-muted-foreground font-light leading-relaxed max-w-2xl">
              {getArtistBio(artistEmail, artistWorks.length)}
            </p>
          </div>

          {/* Artwork Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {artistWorks.map(renderArtworkCard)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ArtworkGrid;
