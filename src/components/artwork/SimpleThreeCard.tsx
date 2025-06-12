import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, Calendar, User, Box, Loader } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { getCachedThreeCapture } from '@/utils/threeCapture';
import UnifiedThreeCube from './UnifiedThreeCube';

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
  const [is3DMode, setIs3DMode] = useState(false);
  
  const lastTapTimeRef = useRef<number>(0);
  const doubleTapDelayRef = useRef<NodeJS.Timeout | null>(null);
  
  // Ensure all required properties are present with proper defaults
  const defaultData = {
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    color: '#00ff00',
    cameraPosition: { x: 0, y: 0, z: 5 }
  };

  const threeData = {
    ...defaultData,
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

    if (!is3DMode) {
      captureScene();
    }
  }, [threeData.color, threeData.position.x, threeData.position.y, threeData.position.z, threeData.rotation.x, threeData.rotation.y, threeData.rotation.z, threeData.scale.x, threeData.scale.y, threeData.scale.z, threeData.cameraPosition.x, threeData.cameraPosition.y, threeData.cameraPosition.z, is3DMode]);

  const handleClick = (e: React.MouseEvent) => {
    const currentTime = new Date().getTime();
    const timeDiff = currentTime - lastTapTimeRef.current;
    
    // Check if this is a double tap (within 300ms)
    if (timeDiff < 300 && timeDiff > 0) {
      // Double tap detected - toggle 3D mode
      setIs3DMode(!is3DMode);
      
      // Clear any pending single tap
      if (doubleTapDelayRef.current) {
        clearTimeout(doubleTapDelayRef.current);
        doubleTapDelayRef.current = null;
      }
    } else {
      // Single tap - delay the onClick to see if there's a second tap
      doubleTapDelayRef.current = setTimeout(() => {
        if (!is3DMode) {
          onClick();
        }
        doubleTapDelayRef.current = null;
      }, 300);
    }
    
    lastTapTimeRef.current = currentTime;
  };

  // Prevent event propagation for 3D interactions
  const handle3DClick = (e: React.MouseEvent) => {
    if (is3DMode) {
      e.stopPropagation();
    }
  };

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
      className="gallery-card group hover:bg-accent/50 transition-colors relative"
      style={{ cursor: is3DMode ? 'default' : 'pointer' }}
    >
      {/* Force square aspect ratio container */}
      <div 
        className="w-full aspect-square relative"
        onClick={handleClick}
      >
        <AspectRatio ratio={1} className="bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center overflow-hidden">
          {is3DMode ? (
            <Canvas 
              camera={{ 
                position: [threeData.cameraPosition.x, threeData.cameraPosition.y, threeData.cameraPosition.z], 
                fov: 75,
                aspect: 1,
                near: 0.1,
                far: 1000
              }}
              className="w-full h-full"
              onClick={handle3DClick}
            >
              <ambientLight intensity={0.6} />
              <pointLight position={[5, 5, 5]} intensity={1.2} />
              <pointLight position={[-5, -5, 5]} intensity={0.8} />
              
              <UnifiedThreeCube 
                color={threeData.color}
                position={threeData.position}
                rotation={threeData.rotation}
                scale={threeData.scale}
                cameraPosition={threeData.cameraPosition}
                isEditable={false}
              />
              
              <OrbitControls 
                enablePan={true}
                enableRotate={true}
                enableZoom={true}
                enableDamping={true}
                dampingFactor={0.05}
                target={[threeData.position.x, threeData.position.y, threeData.position.z]}
              />
            </Canvas>
          ) : (
            <>
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
            </>
          )}
          
          {/* Mode indicator badges */}
          <div className="absolute top-2 right-2 flex gap-1">
            {is3DMode && (
              <Badge variant="secondary" className="bg-blue-500/80 text-white font-light text-xs flex items-center gap-1">
                <Box className="h-3 w-3" />
                Interactive 3D
              </Badge>
            )}
            {!is3DMode && isCapturing && (
              <Badge variant="secondary" className="bg-orange-500/80 text-white font-light text-xs flex items-center gap-1">
                <Loader className="h-3 w-3 animate-spin" />
                Rendering
              </Badge>
            )}
            {!is3DMode && capturedImage && !isCapturing && (
              <Badge variant="outline" className="bg-green-500/80 text-white font-light text-xs">
                Image
              </Badge>
            )}
            {!is3DMode && !capturedImage && !isCapturing && (
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

          {/* Instructions overlay */}
          {!is3DMode && (
            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-background/90 backdrop-blur-sm px-2 py-1 rounded text-xs text-muted-foreground">
                Double tap for 3D mode
              </div>
            </div>
          )}

          {/* Debug overlay showing current values - only in non-3D mode */}
          {!is3DMode && (
            <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-background/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-mono">
                <div>Pos: {threeData.position.x.toFixed(1)}, {threeData.position.y.toFixed(1)}, {threeData.position.z.toFixed(1)}</div>
                <div>Scale: {threeData.scale.x.toFixed(1)}, {threeData.scale.y.toFixed(1)}, {threeData.scale.z.toFixed(1)}</div>
                <div>Cam: {threeData.cameraPosition.x.toFixed(1)}, {threeData.cameraPosition.y.toFixed(1)}, {threeData.cameraPosition.z.toFixed(1)}</div>
              </div>
            </div>
          )}
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
              {is3DMode ? 'Interactive 3D Cube' : 'Static 3D Preview'}
            </span>
          </div>

          {/* Show current cube properties */}
          <div className="text-xs text-muted-foreground font-mono bg-muted/50 p-2 rounded space-y-1">
            <div>Position: ({threeData.position.x.toFixed(2)}, {threeData.position.y.toFixed(2)}, {threeData.position.z.toFixed(2)})</div>
            <div>Rotation: ({threeData.rotation.x.toFixed(2)}, {threeData.rotation.y.toFixed(2)}, {threeData.rotation.z.toFixed(2)})</div>
            <div>Scale: ({threeData.scale.x.toFixed(2)}, {threeData.scale.y.toFixed(2)}, {threeData.scale.z.toFixed(2)})</div>
            <div>Camera: ({threeData.cameraPosition.x.toFixed(2)}, {threeData.cameraPosition.y.toFixed(2)}, {threeData.cameraPosition.z.toFixed(2)})</div>
            <div>Color: {threeData.color}</div>
            {is3DMode && <div className="text-blue-400">Mode: Interactive 3D - Use mouse to explore!</div>}
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
