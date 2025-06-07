
import React from 'react';
import { Calendar, Palette, User, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Artwork {
  id: string;
  title: string;
  image_url: string;
  description?: string;
  medium?: string;
  year?: number;
  created_at: string;
  user_id: string;
  published?: boolean;
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
      `Visionary artist pushing boundaries through experimental digital mediums, showc${artworkCount} thought-provoking compositions.`,
      `Minimalist virtuoso creating powerful statements through simplicity, with ${artworkCount} pieces that speak volumes in silence.`,
      `Bold colorist and form experimenter, delivering ${artworkCount} dynamic works that pulse with creative energy.`
    ];
    
    // Use email hash to consistently assign same bio to same artist
    const index = email.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % bios.length;
    return bios[index];
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
            {artistWorks.map((artwork) => (
              <div 
                key={artwork.id}
                className="group cursor-pointer relative"
                onClick={() => onArtworkClick(artwork)}
              >
                <div className="relative overflow-hidden bg-card border border-border transition-all duration-300 hover:border-foreground">
                  <div className="relative overflow-hidden">
                    <img 
                      src={artwork.image_url} 
                      alt={artwork.title}
                      className="w-full h-64 object-cover transition-all duration-500 ease-out group-hover:scale-[1.02] group-hover:contrast-110"
                    />
                    
                    {/* Delete button - only show for artwork owner */}
                    {user && user.id === artwork.user_id && (
                      <div className="absolute top-3 right-3 z-10">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={(e) => handleDeleteArtwork(artwork, e)}
                          className="h-8 w-8 p-0 bg-destructive/90 hover:bg-destructive backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                    
                    {/* Minimalist hover overlay */}
                    <div className="absolute inset-0 bg-background/0 group-hover:bg-background/85 transition-all duration-300 ease-out pointer-events-none">
                      <div className="absolute inset-0 p-8 flex flex-col justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                        {/* Centered artwork info */}
                        <div className="text-center space-y-4">
                          <h3 className="font-light tracking-[0.1em] text-foreground text-xl uppercase">
                            {artwork.title}
                          </h3>
                          
                          <div className="w-12 h-px bg-foreground mx-auto"></div>
                          
                          <div className="text-xs text-muted-foreground tracking-[0.05em] uppercase">
                            {artwork.profiles?.artist_name || artwork.profiles?.email?.split('@')[0] || 'Unknown Artist'}
                          </div>
                          
                          {artwork.description && (
                            <p className="text-sm text-muted-foreground leading-relaxed font-light max-w-xs mx-auto">
                              {artwork.description}
                            </p>
                          )}
                          
                          <div className="flex justify-center gap-6 text-xs">
                            {artwork.year && (
                              <div className="flex flex-col items-center gap-1">
                                <Calendar className="h-3 w-3 text-muted-foreground" />
                                <span className="text-muted-foreground tracking-wide">{artwork.year}</span>
                              </div>
                            )}
                            {artwork.medium && (
                              <div className="flex flex-col items-center gap-1">
                                <Palette className="h-3 w-3 text-muted-foreground" />
                                <span className="text-muted-foreground tracking-wide">{artwork.medium}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Minimal corner indicator */}
                    <div className="absolute top-6 right-6 w-0 h-0 border-l border-b border-foreground/0 group-hover:border-foreground/60 group-hover:w-3 group-hover:h-3 transition-all duration-200 ease-out delay-200 pointer-events-none"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ArtworkGrid;
