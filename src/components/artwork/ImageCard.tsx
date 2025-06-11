
import React from 'react';
import { Trash2, Calendar, User, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

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
      <div className="w-full aspect-square">
        <div className="relative overflow-hidden bg-card border border-border transition-all duration-300 hover:border-foreground w-full h-full">
          <div className="relative overflow-hidden w-full h-full">
            <img 
              src={imageUrl} 
              alt={artwork.title}
              className="w-full h-full object-cover transition-all duration-500 ease-out group-hover:scale-[1.02] group-hover:contrast-110"
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

      <CardContent className="p-4">
        <h3 className="font-light text-lg mb-2 text-foreground tracking-wide">{artwork.title}</h3>
        
        {artwork.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2 font-light">
            {artwork.description}
          </p>
        )}
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-light text-foreground">
              {artwork.profiles?.artist_name || artwork.profiles?.email?.split('@')[0] || 'Unknown Artist'}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Image className="h-4 w-4 text-muted-foreground" />
            <span className="font-mono text-xs bg-muted px-2 py-1 rounded text-muted-foreground font-light">
              {artwork.medium || 'Digital Image'}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-foreground font-light">
              {artwork.year || 'Year not specified'} • 
              {new Date(artwork.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImageCard;
