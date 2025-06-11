
import React from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageCardProps {
  artwork: {
    id: string;
    title: string;
    image_url?: string;
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
  // Get image URL from either the old image_url field or new content field
  const imageUrl = artwork.content?.image_url || artwork.image_url;

  return (
    <div 
      className="group cursor-pointer relative"
      onClick={onClick}
    >
      <div className="relative overflow-hidden bg-card border border-border transition-all duration-300 hover:border-foreground">
        <div className="relative overflow-hidden">
          <img 
            src={imageUrl} 
            alt={artwork.title}
            className="w-full h-64 object-cover transition-all duration-500 ease-out group-hover:scale-[1.02] group-hover:contrast-110"
          />
          
          {/* Delete button - only show for artwork owner */}
          {canDelete && (
            <div className="absolute top-3 right-3 z-10">
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

          {/* Minimal corner indicator */}
          <div className="absolute top-6 right-6 w-0 h-0 border-l border-b border-foreground/0 group-hover:border-foreground/60 group-hover:w-3 group-hover:h-3 transition-all duration-200 ease-out delay-200 pointer-events-none"></div>
        </div>
      </div>
    </div>
  );
};

export default ImageCard;
