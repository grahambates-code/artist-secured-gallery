
import React from 'react';

interface Artwork {
  id: string;
  title: string;
  image_url: string;
  description?: string;
  medium?: string;
  year?: number;
  created_at: string;
  user_id: string;
  profiles?: {
    email: string;
    artist_name?: string;
  };
}

interface ArtworkGridProps {
  artworks: Artwork[];
  onArtworkClick: (artwork: Artwork) => void;
}

const ArtworkGrid = ({ artworks, onArtworkClick }: ArtworkGridProps) => {
  // Group artworks by artist email
  const groupedArtworks = artworks.reduce((groups: Record<string, Artwork[]>, artwork) => {
    const artistEmail = artwork.profiles?.email || 'Unknown Artist';
    if (!groups[artistEmail]) {
      groups[artistEmail] = [];
    }
    groups[artistEmail].push(artwork);
    return groups;
  }, {} as Record<string, Artwork[]>);

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
              <div 
                key={artwork.id}
                className="group cursor-pointer transition-all duration-500 ease-out hover:scale-[1.03] hover:shadow-2xl hover:shadow-foreground/20"
                onClick={() => onArtworkClick(artwork)}
              >
                <div className="relative overflow-hidden bg-card border border-border transition-all duration-500 hover:border-foreground/30">
                  <div className="relative overflow-hidden">
                    <img 
                      src={artwork.image_url} 
                      alt={artwork.title}
                      className="w-full h-64 object-cover transition-all duration-700 ease-out group-hover:scale-110 group-hover:brightness-110"
                    />
                    
                    {/* Gradient overlay that appears on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    {/* Elegant title overlay with slide-up animation */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out">
                      <div className="space-y-2">
                        <h3 className="font-light tracking-wide text-foreground text-xl leading-tight">{artwork.title}</h3>
                        <div className="flex items-center gap-3 text-sm">
                          {artwork.year && (
                            <span className="text-muted-foreground font-light bg-background/60 backdrop-blur-sm px-2 py-1 rounded">
                              {artwork.year}
                            </span>
                          )}
                          {artwork.medium && (
                            <span className="text-muted-foreground font-light bg-background/60 backdrop-blur-sm px-2 py-1 rounded">
                              {artwork.medium}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Subtle corner accent that appears on hover */}
                    <div className="absolute top-4 right-4 w-0 h-0 border-l-2 border-b-2 border-foreground opacity-0 group-hover:opacity-60 group-hover:w-4 group-hover:h-4 transition-all duration-300 ease-out"></div>
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
