
import React, { useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import * as THREE from 'three';

interface ThreeArtworkFormProps {
  onBack: () => void;
  onSuccess: () => void;
}

// Interactive Cube Component
const InteractiveCube = ({ color, onPositionChange, onRotationChange }: {
  color: string;
  onPositionChange: (position: THREE.Vector3) => void;
  onRotationChange: (rotation: THREE.Euler) => void;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    const mesh = meshRef.current;
    if (mesh) {
      onPositionChange(mesh.position);
      onRotationChange(mesh.rotation);
    }
  }, [onPositionChange, onRotationChange]);

  return (
    <mesh 
      ref={meshRef}
      onPointerMove={(e) => {
        if (meshRef.current) {
          onPositionChange(meshRef.current.position);
          onRotationChange(meshRef.current.rotation);
        }
      }}
    >
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

const ThreeArtworkForm = ({ onBack, onSuccess }: ThreeArtworkFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [medium, setMedium] = useState('Interactive 3D Scene');
  const [year, setYear] = useState('');
  const [cubeColor, setCubeColor] = useState('#00ff00');
  const [uploading, setUploading] = useState(false);
  const [sceneData, setSceneData] = useState({
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    color: '#00ff00'
  });

  const handlePositionChange = (position: THREE.Vector3) => {
    setSceneData(prev => ({
      ...prev,
      position: { x: position.x, y: position.y, z: position.z }
    }));
  };

  const handleRotationChange = (rotation: THREE.Euler) => {
    setSceneData(prev => ({
      ...prev,
      rotation: { x: rotation.x, y: rotation.y, z: rotation.z }
    }));
  };

  const handleColorChange = (color: string) => {
    setCubeColor(color);
    setSceneData(prev => ({
      ...prev,
      color
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide a title for your 3D scene",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      const { error } = await supabase
        .from('artwork')
        .insert({
          title: title.trim(),
          description: description.trim() || null,
          medium: medium.trim() || null,
          year: year ? parseInt(year) : null,
          user_id: user.id,
          published: true,
          type: 'threejs',
          content: sceneData
        });

      if (error) throw error;

      toast({
        title: "3D Scene created successfully!",
        description: "Your interactive artwork has been added to the gallery"
      });

      onSuccess();

    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "An error occurred while creating your 3D scene",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <h3 className="text-lg font-medium">Create 3D Scene</h3>
      </div>

      {/* 3D Canvas Preview */}
      <div className="space-y-2">
        <Label>3D Scene Preview</Label>
        <div className="border rounded-lg overflow-hidden" style={{ height: '300px' }}>
          <Canvas camera={{ position: [0, 0, 5] }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            <InteractiveCube 
              color={cubeColor}
              onPositionChange={handlePositionChange}
              onRotationChange={handleRotationChange}
            />
            <OrbitControls enablePan={false} />
          </Canvas>
        </div>
        <p className="text-sm text-muted-foreground">
          Use your mouse to rotate the cube. The position and rotation will be saved with your artwork.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="cube-color">Cube Color</Label>
          <div className="flex gap-2 items-center">
            <Input
              id="cube-color"
              type="color"
              value={cubeColor}
              onChange={(e) => handleColorChange(e.target.value)}
              className="w-20 h-10"
            />
            <Input
              value={cubeColor}
              onChange={(e) => handleColorChange(e.target.value)}
              placeholder="#00ff00"
              className="flex-1"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter artwork title"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your 3D scene (optional)"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="medium">Medium</Label>
            <Input
              id="medium"
              value={medium}
              onChange={(e) => setMedium(e.target.value)}
              placeholder="e.g., Interactive 3D Scene"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="year">Year</Label>
            <Input
              id="year"
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="e.g., 2024"
              min="1000"
              max="9999"
            />
          </div>
        </div>

        <Button type="submit" disabled={uploading} className="w-full">
          {uploading ? "Creating 3D Scene..." : "Create 3D Scene"}
        </Button>
      </form>
    </div>
  );
};

export default ThreeArtworkForm;
