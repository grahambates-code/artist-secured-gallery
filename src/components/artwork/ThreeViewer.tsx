
import React, { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

interface ThreeViewerProps {
  sceneData: {
    position?: { x: number; y: number; z: number };
    rotation?: { x: number; y: number; z: number };
    color?: string;
  };
}

const InteractiveCube = ({ color, position, rotation }: {
  color: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
}) => {
  const meshRef = useRef();

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

const ThreeViewer = ({ sceneData }: ThreeViewerProps) => {
  const defaultData = {
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    color: '#00ff00',
    ...sceneData
  };

  return (
    <div className="w-full h-96 border border-border rounded-lg overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <InteractiveCube 
          color={defaultData.color}
          position={defaultData.position}
          rotation={defaultData.rotation}
        />
        <OrbitControls enablePan={false} />
      </Canvas>
    </div>
  );
};

export default ThreeViewer;
