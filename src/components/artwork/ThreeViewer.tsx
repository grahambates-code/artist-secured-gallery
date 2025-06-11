import React, { useRef, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import * as THREE from 'three';

interface ThreeViewerProps {
  sceneData: {
    position?: { x: number; y: number; z: number };
    rotation?: { x: number; y: number; z: number };
    color?: string;
  };
  artworkId?: string;
  canEdit?: boolean;
  onSceneUpdate?: (newData: any) => void;
}

const DraggableCube = ({ 
  color, 
  position, 
  rotation, 
  onPositionChange, 
  isDragging, 
  setIsDragging 
}: {
  color: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  onPositionChange: (position: { x: number; y: number; z: number }) => void;
  isDragging: boolean;
  setIsDragging: (dragging: boolean) => void;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { camera, gl } = useThree();
  const dragOffset = useRef<THREE.Vector3>(new THREE.Vector3());
  
  const handlePointerDown = (event: any) => {
    event.stopPropagation();
    setIsDragging(true);
    gl.domElement.style.cursor = 'grabbing';
    
    // Calculate offset from click point to cube center
    if (meshRef.current) {
      const cubePosition = meshRef.current.position.clone();
      dragOffset.current.copy(event.point).sub(cubePosition);
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    gl.domElement.style.cursor = 'grab';
  };

  const handlePointerMove = (event: any) => {
    if (isDragging && meshRef.current) {
      event.stopPropagation();
      
      // Apply the offset to maintain relative position from click point
      const newPosition = event.point.clone().sub(dragOffset.current);
      
      // Clamp the position to reasonable bounds
      newPosition.x = Math.max(-5, Math.min(5, newPosition.x));
      newPosition.y = Math.max(-3, Math.min(3, newPosition.y));
      newPosition.z = Math.max(-2, Math.min(2, newPosition.z));
      
      meshRef.current.position.copy(newPosition);
      onPositionChange({
        x: newPosition.x,
        y: newPosition.y,
        z: newPosition.z
      });
    }
  };

  return (
    <mesh 
      ref={meshRef}
      position={[position.x, position.y, position.z]}
      rotation={[rotation.x, rotation.y, rotation.z]}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMove={handlePointerMove}
      onPointerEnter={() => gl.domElement.style.cursor = 'grab'}
      onPointerLeave={() => !isDragging && (gl.domElement.style.cursor = 'default')}
    >
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

const InteractiveCube = ({ color, position, rotation }: {
  color: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
}) => {
  const meshRef = useRef<THREE.Mesh>(null);

  return (
    <mesh 
      ref={meshRef}
      position={[position.x, position.y, position.z]}
      rotation={[rotation.x, rotation.y, rotation.z]}
    >
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

const ThreeViewer = ({ sceneData, artworkId, canEdit = false, onSceneUpdate }: ThreeViewerProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentData, setCurrentData] = useState({
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    color: '#00ff00',
    ...sceneData
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handlePositionChange = (newPosition: { x: number; y: number; z: number }) => {
    const updatedData = {
      ...currentData,
      position: newPosition
    };
    setCurrentData(updatedData);
  };

  const handleSave = async () => {
    if (!artworkId || !user) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('artwork')
        .update({ content: currentData })
        .eq('id', artworkId);

      if (error) throw error;

      toast({
        title: "Scene updated!",
        description: "Your 3D scene changes have been saved"
      });

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
    setCurrentData({
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      color: '#00ff00',
      ...sceneData
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-4">
      <div className="w-full h-96 border border-border rounded-lg overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800">
        <Canvas camera={{ position: [0, 0, 5] }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          
          {isEditing ? (
            <DraggableCube 
              color={currentData.color}
              position={currentData.position}
              rotation={currentData.rotation}
              onPositionChange={handlePositionChange}
              isDragging={isDragging}
              setIsDragging={setIsDragging}
            />
          ) : (
            <InteractiveCube 
              color={currentData.color}
              position={currentData.position}
              rotation={currentData.rotation}
            />
          )}
          
          <OrbitControls enablePan={!isDragging} enabled={!isDragging} />
        </Canvas>
      </div>

      {canEdit && user && (
        <div className="flex gap-2">
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
              Edit Position
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
        <p className="text-sm text-muted-foreground">
          Click and drag the cube to reposition it. Use orbit controls to view from different angles.
        </p>
      )}
    </div>
  );
};

export default ThreeViewer;
