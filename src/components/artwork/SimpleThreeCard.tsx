
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, Calendar, User, Box } from 'lucide-react';

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
  const threeData = artwork.content || { color: '#00ff00', position: { x: 0, y: 0, z: 5 }, rotation: { x: 0, y: 0, z: 0 } };

  return (
    <Card 
      className="gallery-card group cursor-pointer hover:bg-accent/50 transition-colors relative"
      onClick={onClick}
    >
      <div className="aspect-square relative bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center overflow-hidden">
        {/* Improved 3D cube preview */}
        <div className="relative w-24 h-24 transform-gpu perspective-1000">
          {/* Main cube face */}
          <div 
            className="absolute inset-0 transform rotate-12 shadow-xl transition-transform group-hover:rotate-[18deg] group-hover:scale-110 duration-300"
            style={{ 
              backgroundColor: threeData.color || '#00ff00',
              borderRadius: '4px',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          />
          
          {/* Top face for 3D effect */}
          <div 
            className="absolute -top-2 -left-2 w-24 h-24 transform rotate-12 -skew-x-12 -skew-y-12 opacity-60 transition-transform group-hover:rotate-[18deg] group-hover:scale-110 duration-300"
            style={{ 
              backgroundColor: threeData.color || '#00ff00',
              filter: 'brightness(1.2)',
              borderRadius: '4px',
              border: '1px solid rgba(255,255,255,0.2)'
            }}
          />
          
          {/* Right face for 3D effect */}
          <div 
            className="absolute -top-1 -right-2 w-24 h-24 transform rotate-12 skew-x-12 -skew-y-12 opacity-40 transition-transform group-hover:rotate-[18deg] group-hover:scale-110 duration-300"
            style={{ 
              backgroundColor: threeData.color || '#00ff00',
              filter: 'brightness(0.8)',
              borderRadius: '4px',
              border: '1px solid rgba(0,0,0,0.2)'
            }}
          />

          {/* Subtle glow effect */}
          <div 
            className="absolute inset-0 transform rotate-12 opacity-20 blur-sm transition-transform group-hover:rotate-[18deg] group-hover:scale-110 duration-300"
            style={{ 
              backgroundColor: threeData.color || '#00ff00',
              borderRadius: '8px'
            }}
          />
        </div>
        
        <div className="absolute top-2 right-2">
          <Badge variant="outline" className="bg-background/80 text-foreground font-light">
            3D Scene
          </Badge>
        </div>

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
              Interactive 3D Cube
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
