/**
 * 🌌 FanzDash 3D - Revolutionary Holographic Admin Interface
 * 
 * The world's first 3D/VR admin dashboard for adult content platforms
 * Features:
 * - Real-time 3D data visualization
 * - Holographic performance metrics
 * - WebXR-ready for VR headsets
 * - Gesture-based controls
 * - AI-powered threat detection visualization
 * - Multi-dimensional user behavior mapping
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useLoader, extend } from '@react-three/fiber';
import { 
  OrbitControls, 
  Text, 
  Box, 
  Sphere, 
  Line,
  Billboard,
  Html,
  useGLTF,
  Environment,
  PerspectiveCamera,
  useAnimations
} from '@react-three/drei';
import { VRButton, XR, Interactive, useXR } from '@react-three/xr';
import { Suspense } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

// Extend Three.js for custom materials
extend({ 
  // Custom shaders for holographic effects
});

interface DashboardData {
  revenue: {
    total: number;
    trend: number[];
    platforms: Record<string, number>;
  };
  users: {
    active: number;
    growth: number;
    geographic: Array<{ country: string; count: number; coords: [number, number, number] }>;
  };
  content: {
    uploads: number;
    moderation: {
      pending: number;
      flagged: number;
      approved: number;
    };
  };
  security: {
    threats: Array<{
      id: string;
      type: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      position: [number, number, number];
      timestamp: string;
    }>;
    systemHealth: number;
  };
  aiInsights: {
    predictions: Array<{
      metric: string;
      value: number;
      confidence: number;
      recommendation: string;
    }>;
  };
}

// 3D Data Visualization Components
const RevenueVisualization: React.FC<{ data: DashboardData['revenue'] }> = ({ data }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
      meshRef.current.scale.setScalar(hovered ? 1.1 : 1);
    }
  });

  // Create 3D revenue towers for each platform
  const platformTowers = Object.entries(data.platforms).map(([platform, revenue], index) => {
    const height = (revenue / Math.max(...Object.values(data.platforms))) * 5;
    const color = platform === 'BoyFanz' ? '#FF6B35' : 
                  platform === 'GirlFanz' ? '#FF1B8D' : 
                  platform === 'PupFanz' ? '#8B5CF6' : '#F59E0B';

    return (
      <mesh 
        key={platform} 
        position={[index * 3 - 4.5, height / 2, 0]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={[1.5, height, 1.5]} />
        <meshStandardMaterial 
          color={color} 
          transparent 
          opacity={0.8}
          emissive={color}
          emissiveIntensity={0.2}
        />
        <Html distanceFactor={10}>
          <div className="bg-black/80 text-white px-2 py-1 rounded text-xs">
            {platform}: ${revenue.toLocaleString()}
          </div>
        </Html>
      </mesh>
    );
  });

  return (
    <group ref={meshRef}>
      {platformTowers}
      <Text
        position={[0, -2, 0]}
        fontSize={0.5}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        Platform Revenue
      </Text>
    </group>
  );
};

const UserActivityGlobe: React.FC<{ data: DashboardData['users'] }> = ({ data }) => {
  const globeRef = useRef<THREE.Mesh>(null!);

  useFrame(() => {
    if (globeRef.current) {
      globeRef.current.rotation.y += 0.002;
    }
  });

  const userPoints = data.geographic.map((location, index) => (
    <mesh key={location.country} position={location.coords}>
      <sphereGeometry args={[0.05 + (location.count / 1000) * 0.2, 8, 8]} />
      <meshStandardMaterial 
        color="#00FF88" 
        emissive="#00FF88"
        emissiveIntensity={0.5}
        transparent
        opacity={0.8}
      />
      <Html distanceFactor={20}>
        <div className="bg-green-900/80 text-green-100 px-1 py-0.5 rounded text-xs">
          {location.country}: {location.count}
        </div>
      </Html>
    </mesh>
  ));

  return (
    <group>
      <mesh ref={globeRef}>
        <sphereGeometry args={[2, 32, 32]} />
        <meshStandardMaterial 
          color="#1a1a2e" 
          transparent 
          opacity={0.3}
          wireframe
        />
      </mesh>
      {userPoints}
      <Text
        position={[0, -3, 0]}
        fontSize={0.4}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        Global Users: {data.active.toLocaleString()}
      </Text>
    </group>
  );
};

const SecurityThreatVisualization: React.FC<{ threats: DashboardData['security']['threats'] }> = ({ threats }) => {
  const threatColors = {
    low: '#22c55e',
    medium: '#f59e0b',
    high: '#ef4444',
    critical: '#dc2626'
  };

  const threatSpheres = threats.map((threat) => (
    <Interactive key={threat.id}>
      <mesh position={threat.position}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial 
          color={threatColors[threat.severity]}
          emissive={threatColors[threat.severity]}
          emissiveIntensity={threat.severity === 'critical' ? 0.8 : 0.3}
          transparent
          opacity={0.7}
        />
        <Html distanceFactor={15}>
          <div className="bg-red-900/90 text-white px-2 py-1 rounded text-xs max-w-32">
            <div className="font-bold">{threat.type}</div>
            <div className="text-xs opacity-75">{threat.severity}</div>
          </div>
        </Html>
      </mesh>
    </Interactive>
  ));

  return (
    <group>
      {threatSpheres}
      <Text
        position={[0, 4, 0]}
        fontSize={0.3}
        color="#ff4444"
        anchorX="center"
        anchorY="middle"
      >
        Security Threats: {threats.length}
      </Text>
    </group>
  );
};

const AIInsightsVisualization: React.FC<{ insights: DashboardData['aiInsights'] }> = ({ insights }) => {
  const [currentInsight, setCurrentInsight] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentInsight((prev) => (prev + 1) % insights.predictions.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [insights.predictions.length]);

  const insight = insights.predictions[currentInsight];
  
  return (
    <group>
      <mesh>
        <boxGeometry args={[4, 2, 0.1]} />
        <meshStandardMaterial 
          color="#7C3AED" 
          transparent 
          opacity={0.8}
          emissive="#7C3AED"
          emissiveIntensity={0.3}
        />
      </mesh>
      <Html transform distanceFactor={10}>
        <div className="bg-gradient-to-r from-purple-900/90 to-pink-900/90 text-white p-4 rounded-lg w-96">
          <h3 className="text-lg font-bold mb-2">🧠 AI Insight</h3>
          <div className="space-y-2">
            <div><strong>{insight?.metric}:</strong> {insight?.value}</div>
            <div className="text-sm opacity-75">Confidence: {(insight?.confidence * 100).toFixed(1)}%</div>
            <div className="text-xs bg-purple-800/50 p-2 rounded">
              {insight?.recommendation}
            </div>
          </div>
        </div>
      </Html>
    </group>
  );
};

const HolographicInterface: React.FC<{ onAction: (action: string) => void }> = ({ onAction }) => {
  const { player } = useXR();

  const buttons = [
    { label: 'User Management', action: 'users', color: '#3B82F6' },
    { label: 'Content Moderation', action: 'moderation', color: '#EF4444' },
    { label: 'Financial Reports', action: 'finance', color: '#10B981' },
    { label: 'Security Center', action: 'security', color: '#F59E0B' },
    { label: 'AI Analytics', action: 'ai', color: '#8B5CF6' },
    { label: 'System Health', action: 'health', color: '#06B6D4' },
  ];

  return (
    <group position={[0, 0, -8]}>
      {buttons.map((button, index) => {
        const angle = (index / buttons.length) * Math.PI * 2;
        const radius = 3;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        return (
          <Interactive
            key={button.action}
            onSelect={() => onAction(button.action)}
          >
            <mesh position={[x, 0, z]}>
              <boxGeometry args={[1.5, 0.8, 0.2]} />
              <meshStandardMaterial 
                color={button.color}
                transparent
                opacity={0.8}
                emissive={button.color}
                emissiveIntensity={0.2}
              />
              <Html transform distanceFactor={10}>
                <div 
                  className="bg-black/80 text-white px-3 py-2 rounded text-center cursor-pointer hover:bg-black/90 transition-colors"
                  style={{ color: button.color }}
                >
                  {button.label}
                </div>
              </Html>
            </mesh>
          </Interactive>
        );
      })}
      
      <Text
        position={[0, 2, 0]}
        fontSize={0.6}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        FANZ Command Center
      </Text>
    </group>
  );
};

const Scene3D: React.FC<{ data: DashboardData }> = ({ data }) => {
  const { toast } = useToast();

  const handleAction = useCallback((action: string) => {
    toast({
      title: "Action Triggered",
      description: `Opening ${action} module...`,
    });
  }, [toast]);

  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />
      
      {/* Revenue Visualization */}
      <group position={[-8, 2, 0]}>
        <RevenueVisualization data={data.revenue} />
      </group>

      {/* User Activity Globe */}
      <group position={[8, 2, 0]}>
        <UserActivityGlobe data={data.users} />
      </group>

      {/* Security Threats */}
      <group position={[0, 6, 0]}>
        <SecurityThreatVisualization threats={data.security.threats} />
      </group>

      {/* AI Insights */}
      <group position={[0, -4, 0]}>
        <AIInsightsVisualization insights={data.aiInsights} />
      </group>

      {/* Holographic Interface */}
      <HolographicInterface onAction={handleAction} />

      {/* Environment */}
      <Environment preset="city" />
      
      {/* Particle effects */}
      <mesh>
        <bufferGeometry>
          {/* Add particle system for ambient effects */}
        </bufferGeometry>
        <pointsMaterial size={0.05} color="#ffffff" transparent opacity={0.6} />
      </mesh>
    </>
  );
};

interface FanzDash3DProps {
  data: DashboardData;
  enableVR?: boolean;
}

export const FanzDash3D: React.FC<FanzDash3DProps> = ({ data, enableVR = true }) => {
  const [isVRMode, setIsVRMode] = useState(false);

  return (
    <div className="w-full h-screen bg-black relative">
      {/* VR/3D Toggle Controls */}
      <div className="absolute top-4 left-4 z-10 space-y-2">
        <Card className="bg-black/80 text-white p-4">
          <div className="flex items-center space-x-4">
            <Badge variant={isVRMode ? "default" : "secondary"}>
              {isVRMode ? "VR Mode" : "3D Mode"}
            </Badge>
            {enableVR && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsVRMode(!isVRMode)}
              >
                Toggle VR
              </Button>
            )}
          </div>
        </Card>
      </div>

      {/* Performance Stats */}
      <div className="absolute top-4 right-4 z-10">
        <Card className="bg-black/80 text-white p-4">
          <div className="space-y-2 text-sm">
            <div>System Health: {data.security.systemHealth}%</div>
            <div>Active Users: {data.users.active.toLocaleString()}</div>
            <div>Total Revenue: ${data.revenue.total.toLocaleString()}</div>
            <div className="text-xs text-green-400">
              🟢 All systems operational
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="absolute bottom-4 left-4 z-10">
        <Card className="bg-black/80 text-white p-4">
          <div className="flex space-x-2">
            <Button size="sm" variant="destructive">
              🚨 Emergency Stop
            </Button>
            <Button size="sm" variant="outline">
              📊 Export Data
            </Button>
            <Button size="sm" variant="outline">
              🔄 Refresh
            </Button>
          </div>
        </Card>
      </div>

      {/* 3D Canvas */}
      {enableVR && isVRMode ? (
        <div className="w-full h-full">
          <VRButton />
          <Canvas>
            <XR>
              <Suspense fallback={null}>
                <Scene3D data={data} />
              </Suspense>
              <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
            </XR>
          </Canvas>
        </div>
      ) : (
        <Canvas camera={{ position: [0, 5, 15], fov: 75 }}>
          <Suspense fallback={null}>
            <Scene3D data={data} />
          </Suspense>
          <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
        </Canvas>
      )}
    </div>
  );
};

// Hook for real-time dashboard data
export const useDashboardData = () => {
  const [data, setData] = useState<DashboardData>({
    revenue: {
      total: 2847293,
      trend: [100, 120, 145, 132, 165, 189, 203],
      platforms: {
        'BoyFanz': 1247583,
        'GirlFanz': 956842,
        'PupFanz': 432109,
        'TabooFanz': 210759
      }
    },
    users: {
      active: 89432,
      growth: 12.4,
      geographic: [
        { country: 'USA', count: 35420, coords: [-2, 1, 1] },
        { country: 'UK', count: 12890, coords: [0, 1.5, 0.5] },
        { country: 'Germany', count: 8734, coords: [0.5, 1.3, 0.3] },
        { country: 'Canada', count: 7820, coords: [-1.8, 1.7, 0.8] },
        { country: 'Australia', count: 5940, coords: [1.5, -1, -0.5] },
      ]
    },
    content: {
      uploads: 1847,
      moderation: {
        pending: 23,
        flagged: 7,
        approved: 1817
      }
    },
    security: {
      threats: [
        {
          id: '1',
          type: 'DDoS Attempt',
          severity: 'medium',
          position: [2, 2, 1],
          timestamp: '2024-01-15T10:30:00Z'
        },
        {
          id: '2',
          type: 'Brute Force',
          severity: 'low',
          position: [-1, 3, -2],
          timestamp: '2024-01-15T09:15:00Z'
        }
      ],
      systemHealth: 97
    },
    aiInsights: {
      predictions: [
        {
          metric: 'Revenue Growth',
          value: 23.5,
          confidence: 0.89,
          recommendation: 'Increase marketing spend on BoyFanz by 15% for optimal ROI'
        },
        {
          metric: 'User Retention',
          value: 78.2,
          confidence: 0.92,
          recommendation: 'Implement creator loyalty program to boost retention by 8%'
        },
        {
          metric: 'Content Engagement',
          value: 156.3,
          confidence: 0.85,
          recommendation: 'Focus on interactive content types for 25% engagement increase'
        }
      ]
    }
  });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setData(prevData => ({
        ...prevData,
        users: {
          ...prevData.users,
          active: prevData.users.active + Math.floor(Math.random() * 20) - 10
        },
        security: {
          ...prevData.security,
          systemHealth: Math.max(90, Math.min(100, prevData.security.systemHealth + (Math.random() - 0.5) * 2))
        }
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return data;
};

export default FanzDash3D;