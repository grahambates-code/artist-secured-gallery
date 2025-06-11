
import React, { useRef, useState } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface ThreeCubeProps {
  color: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  isEditable?: boolean;
  onPositionChange?: (position: { x: number; y: number; z: number }) => void;
}

const ThreeCube = ({ 
  color, 
  position, 
  rotation,
  scale,
  isEditable = false,
  onPositionChange
}: ThreeCubeProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef<THREE.Vector3>(new THREE.Vector3());
  
  const { gl } = useThree();
  
  const handlePointerDown = (event: any) => {
    if (!isEditable) return;
    
    event.stopPropagation();
    setIsDragging(true);
    gl.domElement.style.cursor = 'grabbing';
    
    if (meshRef.current) {
      const cubePosition = meshRef.current.position.clone();
      dragOffset.current.copy(event.point).sub(cubePosition);
    }
  };

  const handlePointerUp = () => {
    if (!isEditable) return;
    
    setIsDragging(false);
    gl.domElement.style.cursor = 'grab';
    
    if (meshRef.current && onPositionChange) {
      const finalPosition = meshRef.current.position;
      onPositionChange({
        x: parseFloat(finalPosition.x.toFixed(2)),
        y: parseFloat(finalPosition.y.toFixed(2)),
        z: parseFloat(finalPosition.z.toFixed(2))
      });
    }
  };

  const handlePointerMove = (event: any) => {
    if (!isEditable || !isDragging) return;
    
    if (meshRef.current) {
      event.stopPropagation();
      
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
      rotation={[rotation.x + 0.3, rotation.y + 0.3, rotation.z]}
      scale={[scale.x, scale.y, scale.z]}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color={color} metalness={0.1} roughness={0.4} />
    </mesh>
  );
};

export default ThreeCube;
