
import React from 'react';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card';

interface ArtworkGridProps {
  artworks: any[];
  onArtworkClick: (artwork: any) => void;
}

const ArtworkGrid = ({ artworks, onArtworkClick }: ArtworkGridProps) => {
  // Group artworks by artist email
  const groupedArtworks = artworks.reduce((groups, artwork) => {
    const artistEmail = artwork.profiles?.email || 'Unknown Artist';
    if (!groups[artistEmail]) {
      groups[artistEmail] = [];
    }
    groups[artistEmail].push(artwork);
    return groups;
  }, {} as Record<string, any[]>);

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
              <HoverCard key={artwork.id} openDelay={200} closeDelay={100}>
                <HoverCardTrigger asChild>
                  <div 
                    className="group cursor-pointer transition-all duration-300 hover:scale-[1.02]"
                    onClick={() => onArtworkClick(artwork)}
                  >
                    <div className="relative overflow-hidden bg-card border border-border">
                      <img 
                        src={artwork.image_url} 
                        alt={artwork.title}
                        className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-background/0 group-hover:bg-background/20 transition-colors duration-300"></div>
                      
                      {/* Title overlay on hover */}
                      <div className="absolute bottom-0 left-0 right-0 bg-background/90 backdrop-blur-sm p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <h3 className="font-light tracking-wide text-foreground text-lg">{artwork.title}</h3>
                        {artwork.year && (
                          <p className="text-muted-foreground text-sm font-light">{artwork.year}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </HoverCardTrigger>
                
                <HoverCardContent 
                  side="top" 
                  className="w-80 bg-card border border-border p-4"
                >
                  <div className="space-y-3">
                    <h3 className="font-light tracking-wide text-foreground">{artwork.title}</h3>
                    {artwork.medium && (
                      <p className="text-sm text-muted-foreground font-light">Medium: {artwork.medium}</p>
                    )}
                    {artwork.description && (
                      <p className="text-sm text-muted-foreground font-light leading-relaxed">
                        {artwork.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground font-light">
                      {new Date(artwork.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </HoverCardContent>
              </HoverCard>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ArtworkGrid;
