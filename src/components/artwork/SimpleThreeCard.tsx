
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, Calendar, User, Box } from 'lucide-react';
import ThreeViewer2 from './ThreeViewer2';

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
  return (
    <Card 
      className="gallery-card group hover:bg-accent/50 transition-colors relative cursor-pointer"
      onClick={onClick}
    >
      {/* Three.js Viewer */}
      <div className="relative">
        <ThreeViewer2
          sceneData={artwork.content}
          size="small"
          showControls={false}
          className="pointer-events-none"
        />
        
        {canDelete && (
          <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              variant="destructive"
              onClick={onDelete}
              className="h-8 w-8 p-0 font-light"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        )}
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
            <Box className="h-4 w-4 text-muted-foreground" />
            <span className="font-mono text-xs bg-muted px-2 py-1 rounded text-muted-foreground font-light">
              3D Cube Scene
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

export default SimpleThreeCard;
