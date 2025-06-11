
import React, { useRef, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import PreviewCube from './PreviewCube';
import * as THREE from 'three';

interface ThreeViewerProps {
  sceneData: {
    position?: { x: number; y: number; z: number };
    rotation?: { x: number; y: number; z: number };
    scale?: { x: number; y: number; z: number };
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
  scale,
  onPositionChange, 
  isDragging, 
  setIsDragging 
}: {
  color: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
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
    
    // Ensure final position is captured when drag ends
    if (meshRef.current) {
      const finalPosition = meshRef.current.position;
      console.log('Final drag position:', finalPosition);
      onPositionChange({
        x: parseFloat(finalPosition.x.toFixed(2)),
        y: parseFloat(finalPosition.y.toFixed(2)),
        z: parseFloat(finalPosition.z.toFixed(2))
      });
    }
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
      
      // Update position in real-time during drag - this will update the display immediately
      const roundedPosition = {
        x: parseFloat(newPosition.x.toFixed(2)),
        y: parseFloat(newPosition.y.toFixed(2)),
        z: parseFloat(newPosition.z.toFixed(2))
      };
      
      console.log('Dragging to position:', roundedPosition);
      onPositionChange(roundedPosition);
    }
  };

  return (
    <mesh 
      ref={meshRef}
      position={[position.x, position.y, position.z]}
      rotation={[rotation.x, rotation.y, rotation.z]}
      scale={[scale.x, scale.y, scale.z]}
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

const InteractiveCube = ({ color, position, rotation, scale }: {
  color: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
}) => {
  return (
    <mesh 
      position={[position.x, position.y, position.z]}
      rotation={[rotation.x, rotation.y, rotation.z]}
      scale={[scale.x, scale.y, scale.z]}
    >
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

const ThreeViewer = ({ sceneData, artworkId, canEdit = false, onSceneUpdate }: ThreeViewerProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentData, setCurrentData] = useState({
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    color: '#00ff00',
    ...sceneData
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSliders, setShowSliders] = useState(false);

  const handlePositionChange = (newPosition: { x: number; y: number; z: number }) => {
    console.log('Position change received:', newPosition);
    const updatedData = {
      ...currentData,
      position: newPosition
    };
    setCurrentData(updatedData);
    console.log('Updated currentData:', updatedData);
  };

  const handleSliderChange = (property: string, axis: string, value: number[]) => {
    const newValue = value[0];
    setCurrentData(prev => ({
      ...prev,
      [property]: {
        ...prev[property as keyof typeof prev],
        [axis]: newValue
      }
    }));
  };

  const handleColorChange = (color: string) => {
    setCurrentData(prev => ({
      ...prev,
      color
    }));
  };

  const handleSave = async () => {
    if (!artworkId || !user) return;

    console.log('Saving data:', currentData);
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

      // Invalidate and refetch artwork data
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
    setCurrentData({
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      color: '#00ff00',
      ...sceneData
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-4">
      <div className="w-full h-96 border border-border rounded-lg overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 relative">
        <Canvas camera={{ position: [0, 0, 5] }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          
          {isEditing ? (
            <DraggableCube 
              color={currentData.color}
              position={currentData.position}
              rotation={currentData.rotation}
              scale={currentData.scale || { x: 1, y: 1, z: 1 }}
              onPositionChange={handlePositionChange}
              isDragging={isDragging}
              setIsDragging={setIsDragging}
            />
          ) : (
            <InteractiveCube 
              color={currentData.color}
              position={currentData.position}
              rotation={currentData.rotation}
              scale={currentData.scale || { x: 1, y: 1, z: 1 }}
            />
          )}
          
          <OrbitControls enablePan={!isDragging} enabled={!isDragging} />
        </Canvas>

        {/* Overlay Controls */}
        {showSliders && (
          <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm p-4 rounded-lg space-y-4 max-w-xs">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Position</Label>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs w-4">X:</span>
                  <Slider
                    value={[currentData.position.x]}
                    onValueChange={(value) => handleSliderChange('position', 'x', value)}
                    min={-5}
                    max={5}
                    step={0.1}
                    className="flex-1"
                  />
                  <span className="text-xs w-12">{currentData.position.x.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs w-4">Y:</span>
                  <Slider
                    value={[currentData.position.y]}
                    onValueChange={(value) => handleSliderChange('position', 'y', value)}
                    min={-3}
                    max={3}
                    step={0.1}
                    className="flex-1"
                  />
                  <span className="text-xs w-12">{currentData.position.y.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs w-4">Z:</span>
                  <Slider
                    value={[currentData.position.z]}
                    onValueChange={(value) => handleSliderChange('position', 'z', value)}
                    min={-2}
                    max={2}
                    step={0.1}
                    className="flex-1"
                  />
                  <span className="text-xs w-12">{currentData.position.z.toFixed(1)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">Rotation</Label>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs w-4">X:</span>
                  <Slider
                    value={[currentData.rotation.x]}
                    onValueChange={(value) => handleSliderChange('rotation', 'x', value)}
                    min={0}
                    max={Math.PI * 2}
                    step={0.1}
                    className="flex-1"
                  />
                  <span className="text-xs w-12">{currentData.rotation.x.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs w-4">Y:</span>
                  <Slider
                    value={[currentData.rotation.y]}
                    onValueChange={(value) => handleSliderChange('rotation', 'y', value)}
                    min={0}
                    max={Math.PI * 2}
                    step={0.1}
                    className="flex-1"
                  />
                  <span className="text-xs w-12">{currentData.rotation.y.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs w-4">Z:</span>
                  <Slider
                    value={[currentData.rotation.z]}
                    onValueChange={(value) => handleSliderChange('rotation', 'z', value)}
                    min={0}
                    max={Math.PI * 2}
                    step={0.1}
                    className="flex-1"
                  />
                  <span className="text-xs w-12">{currentData.rotation.z.toFixed(1)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">Scale</Label>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs w-4">X:</span>
                  <Slider
                    value={[(currentData.scale?.x || 1)]}
                    onValueChange={(value) => handleSliderChange('scale', 'x', value)}
                    min={0.1}
                    max={3}
                    step={0.1}
                    className="flex-1"
                  />
                  <span className="text-xs w-12">{(currentData.scale?.x || 1).toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs w-4">Y:</span>
                  <Slider
                    value={[(currentData.scale?.y || 1)]}
                    onValueChange={(value) => handleSliderChange('scale', 'y', value)}
                    min={0.1}
                    max={3}
                    step={0.1}
                    className="flex-1"
                  />
                  <span className="text-xs w-12">{(currentData.scale?.y || 1).toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs w-4">Z:</span>
                  <Slider
                    value={[(currentData.scale?.z || 1)]}
                    onValueChange={(value) => handleSliderChange('scale', 'z', value)}
                    min={0.1}
                    max={3}
                    step={0.1}
                    className="flex-1"
                  />
                  <span className="text-xs w-12">{(currentData.scale?.z || 1).toFixed(1)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">Color</Label>
              <input
                type="color"
                value={currentData.color}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-full h-8 rounded border border-border"
              />
            </div>
          </div>
        )}
      </div>

      {canEdit && user && (
        <div className="flex gap-2">
          {!isEditing ? (
            <>
              <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                Edit Position
              </Button>
              <Button 
                onClick={() => setShowSliders(!showSliders)} 
                variant="outline" 
                size="sm"
              >
                {showSliders ? 'Hide' : 'Show'} Test Sliders
              </Button>
            </>
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
              <Button 
                onClick={() => setShowSliders(!showSliders)} 
                variant="outline" 
                size="sm"
              >
                {showSliders ? 'Hide' : 'Show'} Test Sliders
              </Button>
            </>
          )}
        </div>
      )}

      {(isEditing || showSliders) && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {isEditing ? 'Click and drag the cube to reposition it. Use orbit controls to view from different angles.' : 'Use sliders to test cube properties.'}
          </p>
          <div className="text-xs text-muted-foreground font-mono bg-muted p-2 rounded">
            Position: x: {currentData.position.x.toFixed(2)}, y: {currentData.position.y.toFixed(2)}, z: {currentData.position.z.toFixed(2)}<br/>
            Rotation: x: {currentData.rotation.x.toFixed(2)}, y: {currentData.rotation.y.toFixed(2)}, z: {currentData.rotation.z.toFixed(2)}<br/>
            Scale: x: {(currentData.scale?.x || 1).toFixed(2)}, y: {(currentData.scale?.y || 1).toFixed(2)}, z: {(currentData.scale?.z || 1).toFixed(2)}<br/>
            Color: {currentData.color}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThreeViewer;
