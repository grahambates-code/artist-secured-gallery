
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Image } from 'lucide-react';

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

interface SimpleThreeCardProps {
  artwork: Artwork;
  canDelete: boolean;
  onClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
}

const SimpleThreeCard = ({ artwork, canDelete, onClick, onDelete }: SimpleThreeCardProps) => {
  const renderPreview = () => {
    // Check if we have a screenshot image URL
    if (artwork.content?.image_url) {
      return (
        <img 
          src={artwork.content.image_url} 
          alt={artwork.title}
          className="w-full h-full object-cover object-center transition-all duration-500 ease-out group-hover:scale-[1.02] group-hover:contrast-110"
        />
      );
    }

    // Fallback for older 3D scenes without screenshots
    return (
      <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white/60 text-sm flex items-center gap-2">
          <Image className="w-4 h-4" />
          3D Scene
        </div>
      </div>
    );
  };

  return (
    <Card 
      className="gallery-card group hover:bg-accent/50 transition-colors relative cursor-pointer"
      onClick={onClick}
    >
      {/* Force square aspect ratio to match image cards */}
      <div className="w-full aspect-square relative">
        <div className="relative overflow-hidden bg-card border border-border transition-all duration-300 hover:border-foreground w-full h-full rounded-lg">
          {renderPreview()}
          
          {canDelete && (
            <div className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="sm"
                variant="destructive"
                onClick={onDelete}
                className="h-8 w-8 p-0 bg-destructive/90 hover:bg-destructive backdrop-blur-sm"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          )}

          {/* Metadata overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <h3 className="text-white font-light text-lg mb-1 truncate">{artwork.title}</h3>
            <div className="flex items-center justify-between text-white/80 text-sm">
              <span>{artwork.year || 'Year not specified'}</span>
              <span className="text-xs bg-white/20 px-2 py-1 rounded backdrop-blur-sm">
                3D Scene
              </span>
            </div>
          </div>

          {/* Minimal corner indicator */}
          <div className="absolute top-6 right-6 w-0 h-0 border-l border-b border-foreground/0 group-hover:border-foreground/60 group-hover:w-3 group-hover:h-3 transition-all duration-200 ease-out delay-200 pointer-events-none"></div>
        </div>
      </div>
    </Card>
  );
};

export default SimpleThreeCard;
