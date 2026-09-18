'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment } from '@react-three/drei';

function Model({ url }: { url: string }) {
  const safeUrl = url || '/models/2024_bmw_m4_coupe_competition.glb';
  const { scene } = useGLTF(safeUrl);
  
  // Center and scale the model appropriately
  return (
    <primitive 
      object={scene} 
      scale={1} 
      position={[0, -0.5, 0]} 
      rotation={[0, -Math.PI / 4, 0]} 
    />
  );
}

// Preload models for seamless switching
useGLTF.preload('/models/2024_bmw_m4_coupe_competition.glb');
useGLTF.preload('/models/alpine_a424__www.vecarz.com.glb');
useGLTF.preload('/models/dodge_challenger_-_muscle_car_-_low-poly.glb');
useGLTF.preload('/models/free_concept_car_004_-_public_domain_cc0.glb');
useGLTF.preload('/models/mazda_rx-7_tuned.glb');

export default function ModelViewer({ modelUrl }: { modelUrl: string }) {
  return (
    <div className="w-full h-full absolute inset-0 z-20">
      <Canvas
        camera={{ position: [4, 2, 5], fov: 45 }}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <directionalLight position={[-10, 10, -5]} intensity={0.5} />
          <Environment preset="city" />
          
          <Model key={modelUrl} url={modelUrl} />
          
          <OrbitControls 
            enablePan={false}
            enableZoom={true}
            minDistance={2}
            maxDistance={10}
            autoRotate={true}
            autoRotateSpeed={1.5}
            makeDefault
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
