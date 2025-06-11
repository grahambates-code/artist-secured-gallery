
import * as THREE from 'three';
import { renderQueue } from './renderQueue';

interface ThreeData {
  color: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
}

export const captureThreeScene = async (
  threeData: ThreeData,
  width: number = 512,
  height: number = 512
): Promise<string> => {
  return renderQueue.add(async () => {
    // Create off-screen renderer with better color preservation
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      preserveDrawingBuffer: true,
      powerPreference: "high-performance",
      alpha: false
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(1);
    
    // Enable better color output
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.toneMappingExposure = 1.0;
    
    try {
      // Create scene
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x1e293b); // slate-800
      
      // Create camera
      const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      camera.position.set(0, 0, 5);
      
      // Add brighter lighting to ensure colors show properly
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);
      
      const pointLight = new THREE.PointLight(0xffffff, 1.2, 0);
      pointLight.position.set(5, 5, 5);
      scene.add(pointLight);
      
      // Add a second light from the opposite side
      const pointLight2 = new THREE.PointLight(0xffffff, 0.8, 0);
      pointLight2.position.set(-5, -5, 5);
      scene.add(pointLight2);
      
      // Create cube with proper color handling
      const geometry = new THREE.BoxGeometry(2, 2, 2);
      
      // Convert color string to Three.js Color object and ensure it's bright
      const color = new THREE.Color(threeData.color);
      const material = new THREE.MeshStandardMaterial({ 
        color: color,
        metalness: 0.1,
        roughness: 0.4
      });
      
      const cube = new THREE.Mesh(geometry, material);
      
      // Apply transformations
      cube.position.set(threeData.position.x, threeData.position.y, threeData.position.z);
      cube.rotation.set(threeData.rotation.x, threeData.rotation.y, threeData.rotation.z);
      cube.scale.set(threeData.scale.x, threeData.scale.y, threeData.scale.z);
      
      scene.add(cube);
      
      // Add a slight rotation for more dynamic look
      cube.rotation.x += 0.3;
      cube.rotation.y += 0.3;
      
      // Render scene multiple times to ensure proper color output
      renderer.render(scene, camera);
      renderer.render(scene, camera);
      
      // Capture as data URL with maximum quality
      const dataURL = renderer.domElement.toDataURL('image/png', 1.0);
      
      // Clean up
      geometry.dispose();
      material.dispose();
      
      return dataURL;
    } finally {
      // Always dispose renderer
      renderer.dispose();
    }
  });
};

// Cache for captured images to avoid re-rendering identical scenes
const captureCache = new Map<string, string>();

export const getCachedThreeCapture = async (threeData: ThreeData): Promise<string> => {
  // Create cache key from scene data
  const cacheKey = JSON.stringify({
    color: threeData.color,
    position: threeData.position,
    rotation: threeData.rotation,
    scale: threeData.scale
  });
  
  if (captureCache.has(cacheKey)) {
    return captureCache.get(cacheKey)!;
  }
  
  try {
    const dataURL = await captureThreeScene(threeData);
    captureCache.set(cacheKey, dataURL);
    return dataURL;
  } catch (error) {
    console.error('Failed to capture Three.js scene:', error);
    // Return a fallback placeholder
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI1MTIiIGhlaWdodD0iNTEyIiBmaWxsPSIjMUUyOTNCIi8+CjxyZWN0IHg9IjE3NiIgeT0iMTc2IiB3aWR0aD0iMTYwIiBoZWlnaHQ9IjE2MCIgZmlsbD0iIzAwRkYwMCIgZmlsbC1vcGFjaXR5PSIwLjgiLz4KPHN2Zz4=';
  }
};
