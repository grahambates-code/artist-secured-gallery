
import React from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ImageCardProps {
  artwork: {
    id: string;
    title: string;
    content?: any;
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
  };
  canDelete?: boolean;
  onClick: () => void;
  onDelete: (event: React.MouseEvent) => void;
}

const ImageCard = ({ artwork, canDelete, onClick, onDelete }: ImageCardProps) => {
  // Get image URL from the content field
  const imageUrl = artwork.content?.image_url;

  return (
    <Card 
      className="gallery-card group cursor-pointer hover:bg-accent/50 transition-colors relative"
      onClick={onClick}
    >
      {/* Force square aspect ratio with fixed container */}
      <div className="w-full aspect-square relative">
        <div className="relative overflow-hidden bg-card border border-border transition-all duration-300 hover:border-foreground w-full h-full">
          <div className="relative overflow-hidden w-full h-full">
            <img 
              src={imageUrl} 
              alt={artwork.title}
              className="w-full h-full object-cover transition-all duration-500 ease-out group-hover:scale-[1.02] group-hover:contrast-110"
            />
            
            {/* Delete button - only show for artwork owner */}
            {canDelete && (
              <div className="absolute top-3 right-3 z-20">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={onDelete}
                  className="h-8 w-8 p-0 bg-destructive/90 hover:bg-destructive backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200"
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
                  Image
                </span>
              </div>
            </div>

            {/* Minimal corner indicator */}
            <div className="absolute top-6 right-6 w-0 h-0 border-l border-b border-foreground/0 group-hover:border-foreground/60 group-hover:w-3 group-hover:h-3 transition-all duration-200 ease-out delay-200 pointer-events-none"></div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ImageCard;
