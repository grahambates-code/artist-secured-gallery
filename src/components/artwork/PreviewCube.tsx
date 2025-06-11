
import React from 'react';

interface PreviewCubeProps {
  color: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale?: { x: number; y: number; z: number };
}

const PreviewCube = ({ color, position, rotation, scale = { x: 1, y: 1, z: 1 } }: PreviewCubeProps) => {
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

export default PreviewCube;
