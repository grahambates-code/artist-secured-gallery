
import React, { useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import UnifiedThreeCube from './UnifiedThreeCube';

interface ThreeViewerProps {
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
}

const ThreeViewer = ({ sceneData, artworkId, canEdit = false, onSceneUpdate }: ThreeViewerProps) => {
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
  
  const initializeData = () => {
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
  };
    
  const [currentData, setCurrentData] = useState(initializeData());
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handlePositionChange = (newPosition: { x: number; y: number; z: number }) => {
    const updatedData = {
      ...currentData,
      position: newPosition
    };
    setCurrentData(updatedData);
  };

  const handleRotationChange = (newRotation: { x: number; y: number; z: number }) => {
    const updatedData = {
      ...currentData,
      rotation: newRotation
    };
    setCurrentData(updatedData);
  };

  const handleScaleChange = (newScale: { x: number; y: number; z: number }) => {
    const updatedData = {
      ...currentData,
      scale: newScale
    };
    setCurrentData(updatedData);
  };

  const handleCameraChange = () => {
    if (cameraRef.current && controlsRef.current && isEditing) {
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
      
      console.log('Camera state updated:', {
        position: updatedData.cameraPosition,
        target: updatedData.cameraTarget
      });
    }
  };

  const handleSave = async () => {
    if (!artworkId || !user) return;

    setIsSaving(true);
    try {
      console.log('Saving scene data:', currentData);
      
      const { error } = await supabase
        .from('artwork')
        .update({ content: currentData })
        .eq('id', artworkId);

      if (error) throw error;

      toast({
        title: "Scene updated!",
        description: "Your 3D scene changes have been saved"
      });

      queryClient.invalidateQueries({ queryKey: ['artwork'] });

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
    setCurrentData(initializeData());
    setIsEditing(false);
  };

  return (
    <div className="space-y-4">
      <div className="w-64 h-64 mx-auto">
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
              isEditable={isEditing}
              onPositionChange={handlePositionChange}
              onRotationChange={handleRotationChange}
              onScaleChange={handleScaleChange}
            />
            
            <OrbitControls 
              ref={controlsRef}
              enabled={true}
              enablePan={true} 
              enableRotate={true}
              enableZoom={true}
              target={[currentData.cameraTarget.x, currentData.cameraTarget.y, currentData.cameraTarget.z]}
              onChange={handleCameraChange}
            />
          </Canvas>
        </AspectRatio>
      </div>

      {canEdit && user && (
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

      {isEditing && (
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

export default ThreeViewer;
