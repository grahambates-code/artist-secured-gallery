
import * as THREE from 'three';
import { renderQueue } from './renderQueue';

interface ThreeData {
  color: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale?: { x: number; y: number; z: number };
  cameraPosition?: { x: number; y: number; z: number };
}

export const captureThreeScene = async (
  threeData: ThreeData,
  width: number = 512,
  height: number = 512
): Promise<string> => {
  console.log('captureThreeScene called with:', { threeData, width, height });
  
  return renderQueue.add(async () => {
    console.log('Inside render queue task, creating renderer...');
    
    // Create off-screen canvas with exact dimensions
    const canvas = document.createElement('canvas');
    
    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      preserveDrawingBuffer: true,
      powerPreference: "high-performance",
      alpha: false
    });
    
    console.log('Renderer created, setting size and viewport...');
    
    // Set pixel ratio to 1 first to avoid scaling issues
    renderer.setPixelRatio(1);
    
    // Set size with updateStyle=false to prevent CSS scaling
    renderer.setSize(width, height, false);
    
    // Manually set canvas dimensions to ensure they match exactly
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    
    // Set viewport to match canvas exactly
    renderer.setViewport(0, 0, width, height);
    
    // Disable tone mapping to preserve original colors
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.toneMappingExposure = 1.0;
    
    try {
      console.log('Creating scene and camera...');
      
      // Create scene
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x1e293b); // slate-800
      
      // Create camera with correct aspect ratio
      const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      const cameraPos = threeData.cameraPosition || { x: 0, y: 0, z: 5 };
      camera.position.set(cameraPos.x, cameraPos.y, cameraPos.z);
      camera.updateProjectionMatrix();
      
      console.log('Adding lights...');
      
      // Use the exact same lighting setup as the interactive mode
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);
      
      const pointLight = new THREE.PointLight(0xffffff, 1.2, 0);
      pointLight.position.set(5, 5, 5);
      scene.add(pointLight);
      
      const pointLight2 = new THREE.PointLight(0xffffff, 0.8, 0);
      pointLight2.position.set(-5, -5, 5);
      scene.add(pointLight2);
      
      console.log('Creating cube with data:', threeData);
      
      // Create cube with exact same material properties as interactive mode
      const geometry = new THREE.BoxGeometry(2, 2, 2);
      
      // Use the exact same material settings as the interactive component
      const color = new THREE.Color(threeData.color);
      const material = new THREE.MeshStandardMaterial({ 
        color: color,
        metalness: 0.1,
        roughness: 0.4
      });
      
      const cube = new THREE.Mesh(geometry, material);
      
      // Apply transformations exactly as stored in database
      cube.position.set(threeData.position.x, threeData.position.y, threeData.position.z);
      cube.rotation.set(threeData.rotation.x, threeData.rotation.y, threeData.rotation.z);
      
      // Handle missing scale data with default values
      const scaleData = threeData.scale || { x: 1, y: 1, z: 1 };
      cube.scale.set(scaleData.x, scaleData.y, scaleData.z);
      
      scene.add(cube);
      
      console.log('Rendering scene...');
      
      // Clear and render the scene
      renderer.clear();
      renderer.render(scene, camera);
      
      console.log('Capturing data URL from canvas...');
      
      // Force a read from the framebuffer to ensure rendering is complete
      const gl = renderer.getContext();
      gl.finish();
      
      // Verify canvas dimensions before capture
      console.log('Canvas actual dimensions:', canvas.width, 'x', canvas.height);
      console.log('Canvas style dimensions:', canvas.style.width, 'x', canvas.style.height);
      
      // Capture as data URL with maximum quality
      const dataURL = canvas.toDataURL('image/png', 1.0);
      
      console.log('Data URL captured, length:', dataURL.length, 'canvas size:', canvas.width, 'x', canvas.height);
      
      // Clean up
      geometry.dispose();
      material.dispose();
      
      console.log('Cleanup completed, returning data URL');
      return dataURL;
    } catch (error) {
      console.error('Error in captureThreeScene:', error);
      throw error;
    } finally {
      // Always dispose renderer
      console.log('Disposing renderer...');
      renderer.dispose();
    }
  });
};

// Cache for captured images to avoid re-rendering identical scenes
const captureCache = new Map<string, string>();

export const getCachedThreeCapture = async (threeData: ThreeData): Promise<string> => {
  // Create cache key from scene data including camera position
  const cacheKey = JSON.stringify({
    color: threeData.color,
    position: threeData.position,
    rotation: threeData.rotation,
    scale: threeData.scale,
    cameraPosition: threeData.cameraPosition
  });
  
  if (captureCache.has(cacheKey)) {
    console.log('Using cached capture for key:', cacheKey);
    return captureCache.get(cacheKey)!;
  }
  
  try {
    console.log('Capturing new scene for cache key:', cacheKey);
    const dataURL = await captureThreeScene(threeData);
    captureCache.set(cacheKey, dataURL);
    return dataURL;
  } catch (error) {
    console.error('Failed to capture Three.js scene:', error);
    // Return a fallback placeholder
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI1MTIiIGhlaWdodD0iNTEyIiBmaWxsPSIjMUUyOTNCIi8+CjxyZWN0IHg9IjE3NiIgeT0iMTc2IiB3aWR0aD0iMTYwIiBoZWlnaHQ9IjE2MCIgZmlsbD0iIzAwRkYwMCIgZmlsbC1vcGFjaXR5PSIwLjgiLz4KPHN2Zz4=';
  }
};
