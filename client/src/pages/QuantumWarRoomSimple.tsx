import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Box } from '@react-three/drei';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Shield } from 'lucide-react';

function RotatingBox() {
  return (
    <mesh position={[0, 0, 0]}>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={0.5} />
    </mesh>
  );
}

export default function QuantumWarRoomSimple() {
  return (
    <div className="h-screen w-full relative bg-gradient-to-br from-gray-900 via-black to-purple-900">
      {/* Header */}
      <div className="absolute top-4 left-4 z-10 bg-black/80 border border-cyan-500 rounded-lg p-4 text-white">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-cyan-400" />
          <div>
            <div className="font-bold text-cyan-400">QUANTUM WAR ROOM</div>
            <div className="text-xs text-gray-400">Simplified 3D Test Version</div>
          </div>
        </div>
      </div>

      {/* Loading indicator */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <div className="text-cyan-400 text-2xl font-bold animate-pulse">
          Loading 3D Scene...
        </div>
      </div>

      {/* Instructions */}
      <Card className="absolute bottom-4 left-4 w-80 z-10 bg-black/80 border-cyan-500">
        <CardHeader>
          <CardTitle className="text-cyan-400">Controls</CardTitle>
        </CardHeader>
        <CardContent className="text-white text-sm space-y-2">
          <p>• Click and drag to rotate</p>
          <p>• Scroll to zoom in/out</p>
          <p>• Right-click and drag to pan</p>
          <p className="text-cyan-400 mt-4">✓ If you see a rotating cyan cube, 3D is working!</p>
        </CardContent>
      </Card>

      {/* 3D Canvas */}
      <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4444ff" />
          
          {/* Background */}
          <color attach="background" args={['#000033']} />
          
          {/* Grid */}
          <gridHelper args={[20, 20, '#00ffff', '#004444']} />
          
          {/* Test Box */}
          <RotatingBox />
          
          {/* Additional spheres to show depth */}
          <mesh position={[3, 1, 0]}>
            <sphereGeometry args={[0.5, 16, 16]} />
            <meshStandardMaterial color="#ff0088" />
          </mesh>
          
          <mesh position={[-3, 1, 0]}>
            <sphereGeometry args={[0.5, 16, 16]} />
            <meshStandardMaterial color="#00ff88" />
          </mesh>
          
          <mesh position={[0, 1, 3]}>
            <sphereGeometry args={[0.5, 16, 16]} />
            <meshStandardMaterial color="#ffaa00" />
          </mesh>
          
          {/* Controls */}
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

