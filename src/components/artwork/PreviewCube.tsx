
import React from 'react';

interface PreviewCubeProps {
  color: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
}

const PreviewCube = ({ color, position, rotation }: PreviewCubeProps) => {
  return (
    <mesh 
      position={[position.x, position.y, position.z]}
      rotation={[rotation.x, rotation.y, rotation.z]}
    >
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

export default PreviewCube;
