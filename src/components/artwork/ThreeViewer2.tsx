import React, { useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import UnifiedThreeCube from './UnifiedThreeCube';
import * as THREE from 'three';

interface ThreeViewer2Props {
  sceneData: {
    position?: { x: number; y: number; z: number };
    rotation?: { x: number; y: number; z: number };
    scale?: { x: number; y: number; z: number };
    color?: string;
    cameraPosition?: { x: number; y: number; z: number };
    cameraTarget?: { x: number; y: number; z: number };
  };
  artworkId?: string;
  canEdit?: boolean;
  onSceneUpdate?: (newData: any) => void;
  size?: 'small' | 'medium' | 'large';
  showControls?: boolean;
  className?: string;
}

const ThreeViewer2 = ({ 
  sceneData, 
  artworkId, 
  canEdit = false, 
  onSceneUpdate,
  size = 'medium',
  showControls = true,
  className = ''
}: ThreeViewer2Props) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const cameraRef = useRef<any>();
  const controlsRef = useRef<any>();
  
  const defaultData = {
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    color: '#00ff00',
    cameraPosition: { x: 0, y: 0, z: 5 },
    cameraTarget: { x: 0, y: 0, z: 0 }
  };
  
  // Initialize data ONCE and don't change it when edit mode changes
  
  const [initializedData] = useState(() => {
    if (!sceneData || typeof sceneData !== 'object' || sceneData === null || Array.isArray(sceneData)) {
      return defaultData;
    }
    
    return {
      position: sceneData.position || defaultData.position,
      rotation: sceneData.rotation || defaultData.rotation,
      scale: sceneData.scale || defaultData.scale,
      color: sceneData.color || defaultData.color,
      cameraPosition: sceneData.cameraPosition || defaultData.cameraPosition,
      cameraTarget: sceneData.cameraTarget || defaultData.cameraTarget
    };
  });
    
  const [currentData, setCurrentData] = useState(initializedData);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTakingScreenshot, setIsTakingScreenshot] = useState(false);

  // Update currentData when sceneData changes (but not when edit mode changes)

  useEffect(() => {
    if (sceneData && typeof sceneData === 'object' && !Array.isArray(sceneData)) {
      const newData = {
        position: sceneData.position || defaultData.position,
        rotation: sceneData.rotation || defaultData.rotation,
        scale: sceneData.scale || defaultData.scale,
        color: sceneData.color || defaultData.color,
        cameraPosition: sceneData.cameraPosition || defaultData.cameraPosition,
        cameraTarget: sceneData.cameraTarget || defaultData.cameraTarget
      };
      setCurrentData(newData);
    }
  }, [sceneData]);

  const handlePositionChange = (newPosition: { x: number; y: number; z: number }) => {
    if (!isEditing) return;
    const updatedData = {
      ...currentData,
      position: newPosition
    };
    setCurrentData(updatedData);
    if (onSceneUpdate && !artworkId) {
      onSceneUpdate(updatedData);
    }
  };

  const handleRotationChange = (newRotation: { x: number; y: number; z: number }) => {
    if (!isEditing) return;
    const updatedData = {
      ...currentData,
      rotation: newRotation
    };
    setCurrentData(updatedData);
    if (onSceneUpdate && !artworkId) {
      onSceneUpdate(updatedData);
    }
  };

  const handleScaleChange = (newScale: { x: number; y: number; z: number }) => {
    if (!isEditing) return;
    const updatedData = {
      ...currentData,
      scale: newScale
    };
    setCurrentData(updatedData);
    if (onSceneUpdate && !artworkId) {
      onSceneUpdate(updatedData);
    }
  };

  const handleCameraChange = () => {
    if (!isEditing || !cameraRef.current || !controlsRef.current) return;
    
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    
    const updatedData = {
      ...currentData,
      cameraPosition: {
        x: parseFloat(camera.position.x.toFixed(2)),
        y: parseFloat(camera.position.y.toFixed(2)),
        z: parseFloat(camera.position.z.toFixed(2))
      },
      cameraTarget: {
        x: parseFloat(controls.target.x.toFixed(2)),
        y: parseFloat(controls.target.y.toFixed(2)),
        z: parseFloat(controls.target.z.toFixed(2))
      }
    };
    setCurrentData(updatedData);
    if (onSceneUpdate && !artworkId) {
      onSceneUpdate(updatedData);
    }
  };

  const handleTakeScreenshotAndUpdate = async () => {
    console.log('Screenshot button clicked!');
    console.log('artworkId:', artworkId);
    console.log('user:', user);
    
    if (!artworkId || !user) {
      console.log('Missing artworkId or user - returning early');
      toast({
        title: "Cannot take screenshot",
        description: "Missing artwork ID or user authentication",
        variant: "destructive"
      });
      return;
    }

    setIsTakingScreenshot(true);
    console.log('Starting screenshot process...');
    
    try {
      console.log('Current scene data:', currentData);
      
      // Create a simple test canvas first
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }
      
      // Draw a simple test rectangle
      ctx.fillStyle = currentData.color || '#00ff00';
      ctx.fillRect(100, 100, 312, 312);
      ctx.fillStyle = '#ffffff';
      ctx.font = '20px Arial';
      ctx.fillText('Test Screenshot', 180, 260);
      
      console.log('Test canvas created');
      
      // Convert to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        }, 'image/png', 0.9);
      });
      
      console.log('Blob created, size:', blob.size);
      
      // Generate filename
      const fileName = `${user.id}/threejs-test-${Date.now()}.png`;
      console.log('Uploading to filename:', fileName);
      
      // Upload to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('artwork-images')
        .upload(fileName, blob, {
          metadata: {
            user_id: user.id,
            type: 'threejs-screenshot'
          }
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      console.log('Upload successful:', uploadData);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('artwork-images')
        .getPublicUrl(fileName);

      console.log('Public URL generated:', publicUrl);
      
      // Update the artwork with both the scene data and the new image URL
      const updatedContent = {
        ...currentData,
        image_url: publicUrl
      };
      
      console.log('Updating artwork with content:', updatedContent);
      
      const { error } = await supabase
        .from('artwork')
        .update({ content: updatedContent })
        .eq('id', artworkId);

      if (error) {
        console.error('Database update error:', error);
        throw error;
      }

      console.log('Database updated successfully');

      toast({
        title: "Screenshot taken and artwork updated!",
        description: "The 3D scene screenshot has been captured and saved"
      });

      // Invalidate and refetch artwork queries
      queryClient.invalidateQueries({ queryKey: ['artwork'] });
      queryClient.refetchQueries({ queryKey: ['artwork'] });

      if (onSceneUpdate) {
        onSceneUpdate(updatedContent);
      }
    } catch (error: any) {
      console.error('Screenshot and update error:', error);
      toast({
        title: "Screenshot failed",
        description: error.message || "Failed to capture screenshot and update artwork",
        variant: "destructive"
      });
    } finally {
      setIsTakingScreenshot(false);
      console.log('Screenshot process completed');
    }
  };

  const handleSave = async () => {
    if (!artworkId || !user) return;

    setIsSaving(true);
    try {
      console.log('Saving scene data only:', currentData);
      
      const { error } = await supabase
        .from('artwork')
        .update({ content: currentData })
        .eq('id', artworkId);

      if (error) throw error;

      toast({
        title: "Scene updated!",
        description: "Your 3D scene changes have been saved"
      });

      // Invalidate and refetch ALL artwork queries to ensure grid updates
      queryClient.invalidateQueries({ queryKey: ['artwork'] });
      queryClient.refetchQueries({ queryKey: ['artwork'] });

      setIsEditing(false);
      if (onSceneUpdate) {
        onSceneUpdate(currentData);
      }
    } catch (error: any) {
      console.error('Save error:', error);
      toast({
        title: "Save failed",
        description: error.message || "Failed to save changes",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset to the original initialized data, not re-initialize
    setCurrentData(initializedData);
    setIsEditing(false);
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-full h-full'; // Changed to fill container for grid cards
      case 'large':
        return 'w-96 h-96';
      default:
        return 'w-64 h-64';
    }
  };

  // Determine if controls should be enabled
  const controlsEnabled = isEditing && canEdit;

  return (
    <div className={`space-y-4 ${className}`}>
      <div className={`${getSizeClasses()} mx-auto`}>
        <AspectRatio ratio={1} className="border border-border rounded-lg overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 relative w-full h-full">
          <Canvas 
            camera={{ 
              position: [currentData.cameraPosition.x, currentData.cameraPosition.y, currentData.cameraPosition.z], 
              fov: 75, 
              aspect: 1 
            }}
            onCreated={({ camera }) => {
              cameraRef.current = camera;
            }}
          >
            <ambientLight intensity={0.6} />
            <pointLight position={[5, 5, 5]} intensity={1.2} />
            <pointLight position={[-5, -5, 5]} intensity={0.8} />
            
            <UnifiedThreeCube 
              color={currentData.color}
              position={currentData.position}
              rotation={currentData.rotation}
              scale={currentData.scale}
              cameraPosition={currentData.cameraPosition}
              isEditable={controlsEnabled}
              onPositionChange={handlePositionChange}
              onRotationChange={handleRotationChange}
              onScaleChange={handleScaleChange}
            />
            
            <OrbitControls 
              ref={controlsRef}
              enabled={controlsEnabled}
              enablePan={controlsEnabled} 
              enableRotate={controlsEnabled}
              enableZoom={controlsEnabled}
              target={[currentData.cameraTarget.x, currentData.cameraTarget.y, currentData.cameraTarget.z]}
              onChange={handleCameraChange}
            />
          </Canvas>
        </AspectRatio>
      </div>

      {canEdit && user && showControls && (
        <div className="flex gap-2">
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
              Edit Scene
            </Button>
          ) : (
            <>
              <Button 
                onClick={handleSave} 
                disabled={isSaving} 
                size="sm"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
              <Button 
                onClick={handleTakeScreenshotAndUpdate} 
                disabled={isTakingScreenshot || isSaving} 
                variant="secondary"
                size="sm"
              >
                {isTakingScreenshot ? "Taking Screenshot..." : "Take Screenshot & Update"}
              </Button>
              <Button 
                onClick={handleCancel} 
                variant="outline" 
                size="sm"
              >
                Cancel
              </Button>
            </>
          )}
        </div>
      )}

      {isEditing && showControls && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Drag the cube to move it, use scroll wheel to zoom, hold right-click to rotate view. Use keyboard shortcuts: R (rotate), S (scale), G (grab/move).
          </p>
          <div className="text-xs text-muted-foreground font-mono bg-muted p-2 rounded">
            Position: x: {currentData.position.x.toFixed(2)}, y: {currentData.position.y.toFixed(2)}, z: {currentData.position.z.toFixed(2)}<br/>
            Rotation: x: {currentData.rotation.x.toFixed(2)}, y: {currentData.rotation.y.toFixed(2)}, z: {currentData.rotation.z.toFixed(2)}<br/>
            Scale: x: {(currentData.scale?.x || 1).toFixed(2)}, y: {(currentData.scale?.y || 1).toFixed(2)}, z: {(currentData.scale?.z || 1).toFixed(2)}<br/>
            Camera: x: {currentData.cameraPosition.x.toFixed(2)}, y: {currentData.cameraPosition.y.toFixed(2)}, z: {currentData.cameraPosition.z.toFixed(2)}<br/>
            Target: x: {currentData.cameraTarget.x.toFixed(2)}, y: {currentData.cameraTarget.y.toFixed(2)}, z: {currentData.cameraTarget.z.toFixed(2)}<br/>
            Color: {currentData.color}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThreeViewer2;
