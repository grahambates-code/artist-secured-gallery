
import React, { useRef, useState, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ThreeCubeProps {
  color: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  isEditable?: boolean;
  onPositionChange?: (position: { x: number; y: number; z: number }) => void;
  onRotationChange?: (rotation: { x: number; y: number; z: number }) => void;
  onScaleChange?: (scale: { x: number; y: number; z: number }) => void;
}

const ThreeCube = ({ 
  color, 
  position, 
  rotation,
  scale,
  isEditable = false,
  onPositionChange,
  onRotationChange,
  onScaleChange
}: ThreeCubeProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [editMode, setEditMode] = useState<'move' | 'rotate' | 'scale'>('move');
  const dragOffset = useRef<THREE.Vector3>(new THREE.Vector3());
  const lastMousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  
  const { gl } = useThree();

  // Handle keyboard shortcuts for edit modes
  useEffect(() => {
    if (!isEditable) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key.toLowerCase()) {
        case 'g':
          setEditMode('move');
          break;
        case 'r':
          setEditMode('rotate');
          break;
        case 's':
          setEditMode('scale');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditable]);
  
  const handlePointerDown = (event: any) => {
    if (!isEditable) return;
    
    event.stopPropagation();
    setIsDragging(true);
    gl.domElement.style.cursor = 'grabbing';
    
    lastMousePos.current = { x: event.clientX, y: event.clientY };
    
    if (meshRef.current && editMode === 'move') {
      const cubePosition = meshRef.current.position.clone();
      dragOffset.current.copy(event.point).sub(cubePosition);
    }
  };

  const handlePointerUp = () => {
    if (!isEditable) return;
    
    setIsDragging(false);
    gl.domElement.style.cursor = 'grab';
    
    if (meshRef.current) {
      if (editMode === 'move' && onPositionChange) {
        const finalPosition = meshRef.current.position;
        onPositionChange({
          x: parseFloat(finalPosition.x.toFixed(2)),
          y: parseFloat(finalPosition.y.toFixed(2)),
          z: parseFloat(finalPosition.z.toFixed(2))
        });
      } else if (editMode === 'rotate' && onRotationChange) {
        const finalRotation = meshRef.current.rotation;
        onRotationChange({
          x: parseFloat(finalRotation.x.toFixed(2)),
          y: parseFloat(finalRotation.y.toFixed(2)),
          z: parseFloat(finalRotation.z.toFixed(2))
        });
      } else if (editMode === 'scale' && onScaleChange) {
        const finalScale = meshRef.current.scale;
        onScaleChange({
          x: parseFloat(finalScale.x.toFixed(2)),
          y: parseFloat(finalScale.y.toFixed(2)),
          z: parseFloat(finalScale.z.toFixed(2))
        });
      }
    }
  };

  const handlePointerMove = (event: any) => {
    if (!isEditable || !isDragging || !meshRef.current) return;
    
    event.stopPropagation();
    
    const deltaX = event.clientX - lastMousePos.current.x;
    const deltaY = event.clientY - lastMousePos.current.y;
    lastMousePos.current = { x: event.clientX, y: event.clientY };
    
    if (editMode === 'move') {
      const newPosition = event.point.clone().sub(dragOffset.current);
      
      newPosition.x = Math.max(-5, Math.min(5, newPosition.x));
      newPosition.y = Math.max(-3, Math.min(3, newPosition.y));
      newPosition.z = Math.max(-2, Math.min(2, newPosition.z));
      
      meshRef.current.position.copy(newPosition);
      
      if (onPositionChange) {
        const roundedPosition = {
          x: parseFloat(newPosition.x.toFixed(2)),
          y: parseFloat(newPosition.y.toFixed(2)),
          z: parseFloat(newPosition.z.toFixed(2))
        };
        onPositionChange(roundedPosition);
      }
    } else if (editMode === 'rotate') {
      const rotationSpeed = 0.01;
      meshRef.current.rotation.y += deltaX * rotationSpeed;
      meshRef.current.rotation.x += deltaY * rotationSpeed;
      
      if (onRotationChange) {
        onRotationChange({
          x: parseFloat(meshRef.current.rotation.x.toFixed(2)),
          y: parseFloat(meshRef.current.rotation.y.toFixed(2)),
          z: parseFloat(meshRef.current.rotation.z.toFixed(2))
        });
      }
    } else if (editMode === 'scale') {
      const scaleSpeed = 0.01;
      const scaleDelta = deltaY * scaleSpeed;
      const newScale = Math.max(0.1, Math.min(3, meshRef.current.scale.x - scaleDelta));
      
      meshRef.current.scale.set(newScale, newScale, newScale);
      
      if (onScaleChange) {
        onScaleChange({
          x: parseFloat(newScale.toFixed(2)),
          y: parseFloat(newScale.toFixed(2)),
          z: parseFloat(newScale.toFixed(2))
        });
      }
    }
  };

  const handlePointerEnter = () => {
    if (isEditable) {
      gl.domElement.style.cursor = 'grab';
    }
  };

  const handlePointerLeave = () => {
    if (isEditable && !isDragging) {
      gl.domElement.style.cursor = 'default';
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
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial 
        color={color} 
        metalness={0.1} 
        roughness={0.4}
        emissive={isEditable && editMode === 'rotate' ? '#001100' : 
                 isEditable && editMode === 'scale' ? '#110000' : 
                 isEditable && editMode === 'move' ? '#000011' : '#000000'}
      />
    </mesh>
  );
};

export default ThreeCube;
