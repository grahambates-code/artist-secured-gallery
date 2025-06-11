
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, Calendar, User, Box, Loader } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { getCachedThreeCapture } from '@/utils/threeCapture';

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
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  // Ensure all required properties are present with proper defaults
  const threeData = {
    color: '#00ff00',
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    ...artwork.content
  };

  useEffect(() => {
    const captureScene = async () => {
      try {
        setIsCapturing(true);
        setHasError(false);
        const imageData = await getCachedThreeCapture(threeData);
        setCapturedImage(imageData);
      } catch (error) {
        console.error('Failed to capture Three.js scene:', error);
        setHasError(true);
      } finally {
        setIsCapturing(false);
      }
    };

    captureScene();
  }, [threeData.color, threeData.position.x, threeData.position.y, threeData.position.z, threeData.rotation.x, threeData.rotation.y, threeData.rotation.z, threeData.scale.x, threeData.scale.y, threeData.scale.z]);

  // Fallback component for when capture fails
  const ThreeFallback = () => (
    <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
      <div className="text-center">
        <Box className="h-12 w-12 mx-auto text-white mb-2" />
        <p className="text-white text-sm">3D Preview</p>
        <p className="text-white/70 text-xs">
          {isCapturing ? 'Rendering...' : 'Preview Unavailable'}
        </p>
      </div>
    </div>
  );

  return (
    <Card 
      className="gallery-card group cursor-pointer hover:bg-accent/50 transition-colors relative"
      onClick={onClick}
    >
      {/* Force square aspect ratio container */}
      <div className="w-full aspect-square relative">
        <AspectRatio ratio={1} className="bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center overflow-hidden">
          {hasError || (!capturedImage && !isCapturing) ? (
            <ThreeFallback />
          ) : capturedImage ? (
            <img 
              src={capturedImage} 
              alt={`3D Scene: ${artwork.title}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <ThreeFallback />
          )}
          
          {/* Render status indicator */}
          <div className="absolute top-2 right-2 flex gap-1">
            {isCapturing && (
              <Badge variant="secondary" className="bg-orange-500/80 text-white font-light text-xs flex items-center gap-1">
                <Loader className="h-3 w-3 animate-spin" />
                Rendering
              </Badge>
            )}
            {capturedImage && !isCapturing && (
              <Badge variant="outline" className="bg-green-500/80 text-white font-light text-xs">
                Image
              </Badge>
            )}
            {!capturedImage && !isCapturing && (
              <Badge variant="outline" className="bg-background/80 text-foreground font-light text-xs">
                3D Scene
              </Badge>
            )}
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

          {/* Debug overlay showing current values */}
          <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-background/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-mono">
              <div>Pos: {threeData.position.x.toFixed(1)}, {threeData.position.y.toFixed(1)}, {threeData.position.z.toFixed(1)}</div>
              <div>Scale: {threeData.scale.x.toFixed(1)}, {threeData.scale.y.toFixed(1)}, {threeData.scale.z.toFixed(1)}</div>
            </div>
          </div>
        </AspectRatio>
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

          {/* Show current cube properties */}
          <div className="text-xs text-muted-foreground font-mono bg-muted/50 p-2 rounded space-y-1">
            <div>Position: ({threeData.position.x.toFixed(2)}, {threeData.position.y.toFixed(2)}, {threeData.position.z.toFixed(2)})</div>
            <div>Rotation: ({threeData.rotation.x.toFixed(2)}, {threeData.rotation.y.toFixed(2)}, {threeData.rotation.z.toFixed(2)})</div>
            <div>Scale: ({threeData.scale.x.toFixed(2)}, {threeData.scale.y.toFixed(2)}, {threeData.scale.z.toFixed(2)})</div>
            <div>Color: {threeData.color}</div>
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
