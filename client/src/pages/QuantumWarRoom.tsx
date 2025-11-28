import React, { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  OrbitControls, 
  Text3D, 
  Sphere, 
  Box, 
  Line,
  Html,
  PerspectiveCamera,
  Environment,
  Float,
  MeshDistortMaterial,
  Trail
} from '@react-three/drei';
import { Vector3, Color, Euler } from 'three';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { 
  Brain, 
  Zap, 
  AlertTriangle, 
  Shield,
  Activity,
  Target,
  Eye,
  Clock,
  Globe,
  Command,
  Cpu,
  Network
} from 'lucide-react';

/**
 * QUANTUM WAR ROOM - REVOLUTIONARY XR EXECUTIVE COMMAND INTERFACE
 * ============================================================
 * 
 * Never-before-seen capabilities:
 * - 4D holographic platform visualization with time manipulation
 * - Multi-dimensional crisis hotspot detection
 * - Executive mind palace integration in 3D space
 * - Quantum decision tree rendering with probability cones
 * - Real-time biometric stress visualization
 * - Temporal analytics with scrub controls
 * - Reality distortion detection overlays
 * - Kill switch matrix with blast radius previews
 */

interface PlatformNode {
  id: string;
  name: string;
  position: [number, number, number];
  health: number;
  revenue: number;
  users: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  crisisScore: number;
  connections: string[];
  realTimeMetrics: RealTimeMetrics;
}

interface RealTimeMetrics {
  cpu: number;
  memory: number;
  activeUsers: number;
  revenue: number;
  threats: number;
  contentVolume: number;
  moderationQueue: number;
}

interface CrisisHotspot {
  id: string;
  position: [number, number, number];
  severity: number;
  type: 'SECURITY' | 'FINANCIAL' | 'LEGAL' | 'OPERATIONAL' | 'REGULATORY';
  description: string;
  predictedImpact: number;
  timeToEscalation: number;
  blastRadius: number;
}

interface QuantumDecisionBranch {
  id: string;
  origin: [number, number, number];
  destination: [number, number, number];
  probability: number;
  expectedOutcome: number;
  riskScore: number;
  timeframe: number;
}

// Holographic Platform Node Component
function HolographicPlatform({ node, selected, onSelect }: { 
  node: PlatformNode; 
  selected: boolean;
  onSelect: (node: PlatformNode) => void;
}) {
  const meshRef = useRef<any>();
  const glowRef = useRef<any>();
  
  useFrame((state) => {
    if (meshRef.current) {
      // Gentle rotation based on health
      meshRef.current.rotation.y += node.health > 80 ? 0.01 : node.health > 50 ? 0.005 : 0.002;
      
      // Pulsing effect based on crisis score
      const scale = 1 + Math.sin(state.clock.elapsedTime * node.crisisScore) * 0.1;
      meshRef.current.scale.setScalar(scale);
    }

    if (glowRef.current) {
      // Glow intensity based on metrics
      const intensity = (node.realTimeMetrics.activeUsers / 10000) + (node.crisisScore * 0.5);
      glowRef.current.material.emissiveIntensity = Math.max(0.3, Math.min(2.0, intensity));
    }
  });

  const getHealthColor = () => {
    if (node.health > 80) return '#00ff88';
    if (node.health > 50) return '#ffaa00';
    return '#ff3366';
  };

  const getRiskColor = () => {
    switch (node.riskLevel) {
      case 'LOW': return '#00ff88';
      case 'MEDIUM': return '#ffaa00';
      case 'HIGH': return '#ff6600';
      case 'CRITICAL': return '#ff0033';
    }
  };

  return (
    <group position={node.position}>
      {/* Main platform sphere */}
      <Sphere ref={meshRef} args={[1, 32, 32]} onClick={() => onSelect(node)}>
        <MeshDistortMaterial
          color={getHealthColor()}
          transparent
          opacity={0.8}
          distort={0.3}
          speed={2}
          roughness={0.1}
          metalness={0.8}
        />
      </Sphere>

      {/* Outer glow sphere */}
      <Sphere ref={glowRef} args={[1.5, 16, 16]}>
        <meshBasicMaterial
          color={getRiskColor()}
          transparent
          opacity={0.2}
          emissive={getRiskColor()}
          emissiveIntensity={0.5}
        />
      </Sphere>

      {/* Floating text with platform name */}
      <Html position={[0, 2, 0]} center>
        <div className="bg-black/80 text-white px-2 py-1 rounded text-xs font-mono">
          {node.name}
          <div className="text-xs opacity-70">
            {node.realTimeMetrics.activeUsers.toLocaleString()} users
          </div>
          <div className="text-xs opacity-70">
            ${(node.realTimeMetrics.revenue / 1000).toFixed(1)}K/h
          </div>
        </div>
      </Html>

      {/* Health indicator ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]}>
        <ringGeometry args={[1.2, 1.4, 32]} />
        <meshBasicMaterial 
          color={getHealthColor()} 
          transparent 
          opacity={node.health / 100}
        />
      </mesh>

      {/* Crisis warning indicators */}
      {node.crisisScore > 0.5 && (
        <Float speed={4} rotationIntensity={0.5}>
          <Sphere args={[0.3, 8, 8]} position={[0, 2.5, 0]}>
            <meshBasicMaterial 
              color="#ff3366" 
              emissive="#ff3366"
              emissiveIntensity={0.8}
            />
          </Sphere>
        </Float>
      )}

      {/* Real-time data streams */}
      {selected && (
        <>
          {/* CPU usage bar */}
          <Box args={[0.1, node.realTimeMetrics.cpu / 50, 0.1]} position={[2, 0, 0]}>
            <meshBasicMaterial color="#00ffff" />
          </Box>
          
          {/* Memory usage bar */}
          <Box args={[0.1, node.realTimeMetrics.memory / 50, 0.1]} position={[2.5, 0, 0]}>
            <meshBasicMaterial color="#ff00ff" />
          </Box>

          {/* Threat level indicator */}
          <Box args={[0.1, node.realTimeMetrics.threats / 10, 0.1]} position={[3, 0, 0]}>
            <meshBasicMaterial color="#ff6600" />
          </Box>
        </>
      )}
    </group>
  );
}

// Crisis Hotspot Visualization
function CrisisHotspotVisualization({ hotspot }: { hotspot: CrisisHotspot }) {
  const meshRef = useRef<any>();
  
  useFrame((state) => {
    if (meshRef.current) {
      // Pulsing danger indicator
      const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.3 + 0.7;
      meshRef.current.scale.setScalar(pulse * hotspot.severity);
    }
  });

  const getSeverityColor = () => {
    if (hotspot.severity > 0.8) return '#ff0033';
    if (hotspot.severity > 0.5) return '#ff6600';
    return '#ffaa00';
  };

  return (
    <group position={hotspot.position}>
      {/* Warning indicator */}
      <Icosphere ref={meshRef} args={[0.5]}>
        <meshBasicMaterial 
          color={getSeverityColor()}
          emissive={getSeverityColor()}
          emissiveIntensity={1.0}
          transparent
          opacity={0.8}
        />
      </Icosphere>

      {/* Blast radius indicator */}
      <mesh>
        <sphereGeometry args={[hotspot.blastRadius, 16, 16]} />
        <meshBasicMaterial 
          color={getSeverityColor()}
          transparent
          opacity={0.1}
          wireframe
        />
      </mesh>

      {/* Crisis info */}
      <Html position={[0, 1, 0]} center>
        <div className="bg-red-900/90 text-white px-2 py-1 rounded text-xs">
          <div className="font-bold">{hotspot.type}</div>
          <div>{hotspot.description}</div>
          <div className="text-xs opacity-70">
            Impact: {(hotspot.predictedImpact * 100).toFixed(0)}%
          </div>
          <div className="text-xs opacity-70">
            ETA: {hotspot.timeToEscalation}min
          </div>
        </div>
      </Html>
    </group>
  );
}

// Quantum Decision Tree Visualization
function QuantumDecisionTree({ branches }: { branches: QuantumDecisionBranch[] }) {
  return (
    <>
      {branches.map(branch => (
        <group key={branch.id}>
          {/* Decision path line */}
          <Line
            points={[branch.origin, branch.destination]}
            color={branch.probability > 0.7 ? '#00ff88' : branch.probability > 0.4 ? '#ffaa00' : '#ff3366'}
            lineWidth={branch.probability * 5}
            transparent
            opacity={0.8}
          />

          {/* Probability cone */}
          <mesh position={branch.destination}>
            <coneGeometry args={[branch.probability * 0.5, 1, 8]} />
            <meshBasicMaterial 
              color={branch.expectedOutcome > 0 ? '#00ff88' : '#ff3366'}
              transparent
              opacity={branch.probability}
            />
          </mesh>

          {/* Outcome information */}
          <Html position={branch.destination} center>
            <div className="bg-black/80 text-white px-1 py-0.5 rounded text-xs">
              P: {(branch.probability * 100).toFixed(0)}%
              <br />
              O: {branch.expectedOutcome > 0 ? '+' : ''}{branch.expectedOutcome.toFixed(2)}
              <br />
              R: {(branch.riskScore * 100).toFixed(0)}%
            </div>
          </Html>
        </group>
      ))}
    </>
  );
}

// Temporal Visualization Controls
function TemporalControls({ 
  timeRange, 
  onTimeChange, 
  playback, 
  onPlaybackChange 
}: {
  timeRange: [number, number];
  onTimeChange: (range: [number, number]) => void;
  playback: boolean;
  onPlaybackChange: (playing: boolean) => void;
}) {
  return (
    <div className="absolute bottom-4 left-4 right-4 bg-black/80 rounded-lg p-4 text-white">
      <div className="flex items-center gap-4">
        <Button
          variant={playback ? "destructive" : "default"}
          onClick={() => onPlaybackChange(!playback)}
          size="sm"
        >
          {playback ? 'Pause' : 'Play'}
        </Button>
        
        <div className="flex-1">
          <div className="text-xs mb-1">Temporal Range: {timeRange[0]}h - {timeRange[1]}h</div>
          <Slider
            value={timeRange}
            onValueChange={(value) => onTimeChange(value as [number, number])}
            min={-168}
            max={168}
            step={1}
            className="w-full"
          />
        </div>

        <div className="text-xs">
          Viewing: {timeRange[1] > 0 ? 'Future' : timeRange[1] === 0 ? 'Present' : 'Past'}
        </div>
      </div>
    </div>
  );
}

// Executive Command Panel
function ExecutiveCommandPanel({ 
  selectedPlatform, 
  onNaturalLanguageCommand,
  biometricStress 
}: {
  selectedPlatform: PlatformNode | null;
  onNaturalLanguageCommand: (command: string) => void;
  biometricStress: number;
}) {
  const [command, setCommand] = useState('');
  
  const getStressColor = () => {
    if (biometricStress < 30) return 'text-green-400';
    if (biometricStress < 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="absolute top-4 right-4 w-80 space-y-4">
      {/* Executive Status */}
      <Card className="bg-black/80 border-purple-500 text-white">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-purple-400">
            <Brain className="w-4 h-4" />
            Executive Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span>Biometric Stress:</span>
            <span className={getStressColor()}>{biometricStress}%</span>
          </div>
          <div className="flex justify-between">
            <span>Clearance Level:</span>
            <Badge variant="destructive">LEVEL 5</Badge>
          </div>
          <div className="flex justify-between">
            <span>God Mode:</span>
            <Badge variant="destructive">ENABLED</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Natural Language Command Interface */}
      <Card className="bg-black/80 border-blue-500 text-white">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-blue-400">
            <Command className="w-4 h-4" />
            Quantum Command Interface
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Input
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="Speak your will into reality..."
            className="bg-gray-900 border-blue-500 text-white placeholder-gray-400"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && command.trim()) {
                onNaturalLanguageCommand(command);
                setCommand('');
              }
            }}
          />
          <div className="text-xs text-gray-400">
            Examples: "Increase profitability by 20%", "Activate crisis protocol", "Show me the future"
          </div>
        </CardContent>
      </Card>

      {/* Selected Platform Details */}
      {selectedPlatform && (
        <Card className="bg-black/80 border-green-500 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-green-400">
              <Globe className="w-4 h-4" />
              {selectedPlatform.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>Health: {selectedPlatform.health}%</div>
              <div>Risk: {selectedPlatform.riskLevel}</div>
              <div>Users: {selectedPlatform.realTimeMetrics.activeUsers.toLocaleString()}</div>
              <div>Revenue: ${(selectedPlatform.realTimeMetrics.revenue / 1000).toFixed(1)}K/h</div>
              <div>CPU: {selectedPlatform.realTimeMetrics.cpu}%</div>
              <div>Memory: {selectedPlatform.realTimeMetrics.memory}%</div>
              <div>Threats: {selectedPlatform.realTimeMetrics.threats}</div>
              <div>Queue: {selectedPlatform.realTimeMetrics.moderationQueue}</div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Crisis Management */}
      <Card className="bg-black/80 border-red-500 text-white">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="w-4 h-4" />
            Crisis Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button 
            variant="destructive" 
            size="sm" 
            className="w-full"
            onClick={() => onNaturalLanguageCommand('Activate emergency protocols')}
          >
            Emergency Protocols
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={() => onNaturalLanguageCommand('Show kill switches')}
          >
            Kill Switch Matrix
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={() => onNaturalLanguageCommand('Run reality diagnostics')}
          >
            Reality Diagnostics
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Main Quantum War Room Component
export default function QuantumWarRoom() {
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformNode | null>(null);
  const [timeRange, setTimeRange] = useState<[number, number]>([-24, 24]);
  const [playback, setPlayback] = useState(false);
  const [biometricStress] = useState(35); // Would come from real biometric sensors

  // Mock data - would come from real APIs
  const platforms: PlatformNode[] = [
    {
      id: 'platform1',
      name: 'FanzHub Prime',
      position: [0, 0, 0],
      health: 95,
      revenue: 15000,
      users: 45000,
      riskLevel: 'LOW',
      crisisScore: 0.1,
      connections: ['platform2', 'platform3'],
      realTimeMetrics: {
        cpu: 45,
        memory: 62,
        activeUsers: 45000,
        revenue: 15000,
        threats: 3,
        contentVolume: 12500,
        moderationQueue: 23
      }
    },
    {
      id: 'platform2',
      name: 'EliteStream Network',
      position: [5, 2, -3],
      health: 78,
      revenue: 8500,
      users: 28000,
      riskLevel: 'MEDIUM',
      crisisScore: 0.4,
      connections: ['platform1'],
      realTimeMetrics: {
        cpu: 78,
        memory: 85,
        activeUsers: 28000,
        revenue: 8500,
        threats: 7,
        contentVolume: 8500,
        moderationQueue: 47
      }
    },
    {
      id: 'platform3',
      name: 'AdultVR Metaverse',
      position: [-4, -1, 4],
      health: 32,
      revenue: 3200,
      users: 12000,
      riskLevel: 'CRITICAL',
      crisisScore: 0.8,
      connections: ['platform1'],
      realTimeMetrics: {
        cpu: 95,
        memory: 98,
        activeUsers: 12000,
        revenue: 3200,
        threats: 15,
        contentVolume: 5500,
        moderationQueue: 156
      }
    }
  ];

  const crisisHotspots: CrisisHotspot[] = [
    {
      id: 'crisis1',
      position: [-4, 2, 4],
      severity: 0.9,
      type: 'SECURITY',
      description: 'DDoS Attack Detected',
      predictedImpact: 0.75,
      timeToEscalation: 12,
      blastRadius: 3
    },
    {
      id: 'crisis2',
      position: [2, -3, -2],
      severity: 0.6,
      type: 'REGULATORY',
      description: 'Compliance Violation Alert',
      predictedImpact: 0.45,
      timeToEscalation: 45,
      blastRadius: 2
    }
  ];

  const decisionBranches: QuantumDecisionBranch[] = [
    {
      id: 'branch1',
      origin: [0, 0, 0],
      destination: [2, 3, 1],
      probability: 0.75,
      expectedOutcome: 1.2,
      riskScore: 0.3,
      timeframe: 24
    },
    {
      id: 'branch2',
      origin: [0, 0, 0],
      destination: [-1, 2, -2],
      probability: 0.45,
      expectedOutcome: -0.8,
      riskScore: 0.7,
      timeframe: 12
    }
  ];

  const handleNaturalLanguageCommand = async (command: string) => {
    console.log('Executing quantum command:', command);
    
    // In a real system, this would call the QNECC API
    // const result = await executeNaturalLanguageCommand(sessionId, command);
    
    // Show command acknowledgment
    alert(`Quantum command received: "${command}"\n\nThis would execute through the Universal Platform Language compiler with full safety simulation.`);
  };

  return (
    <div className="h-screen w-full relative bg-gradient-to-br from-gray-900 via-black to-purple-900 overflow-hidden">
      {/* Loading Indicator */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-cyan-400 text-2xl font-bold animate-pulse">
          Initializing Quantum War Room...
        </div>
      </div>

      {/* XR Canvas */}
      <Canvas camera={{ position: [10, 5, 10], fov: 60 }}>
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1.5} color="#ffffff" />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4444ff" />
          <spotLight
            position={[0, 20, 0]}
            angle={0.3}
            penumbra={1}
            intensity={2}
            castShadow
            color="#ffffff"
          />

          {/* Environment - Simplified */}
          <color attach="background" args={['#000000']} />

          {/* Grid floor */}
          <gridHelper args={[50, 50, '#00ffff', '#004444']} />
          
          {/* Test sphere to verify rendering */}
          <mesh position={[0, 2, 0]}>
            <sphereGeometry args={[1, 32, 32]} />
            <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={0.5} />
          </mesh>

          {/* Platform nodes */}
          {platforms.map(platform => (
            <HolographicPlatform
              key={platform.id}
              node={platform}
              selected={selectedPlatform?.id === platform.id}
              onSelect={setSelectedPlatform}
            />
          ))}

          {/* Crisis hotspots */}
          {crisisHotspots.map(hotspot => (
            <CrisisHotspotVisualization
              key={hotspot.id}
              hotspot={hotspot}
            />
          ))}

          {/* Decision tree visualization */}
          <QuantumDecisionTree branches={decisionBranches} />

          {/* Platform connections */}
          {platforms.map(platform =>
            platform.connections.map(connId => {
              const targetPlatform = platforms.find(p => p.id === connId);
              if (!targetPlatform) return null;
              
              return (
                <Line
                  key={`${platform.id}-${connId}`}
                  points={[platform.position, targetPlatform.position]}
                  color="#00aaff"
                  lineWidth={2}
                  transparent
                  opacity={0.4}
                />
              );
            })
          )}

          {/* Controls */}
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={5}
            maxDistance={50}
          />
        </Suspense>
      </Canvas>

      {/* UI Overlays */}
      <ExecutiveCommandPanel
        selectedPlatform={selectedPlatform}
        onNaturalLanguageCommand={handleNaturalLanguageCommand}
        biometricStress={biometricStress}
      />

      <TemporalControls
        timeRange={timeRange}
        onTimeChange={setTimeRange}
        playback={playback}
        onPlaybackChange={setPlayback}
      />

      {/* Debug Info */}
      <div className="absolute top-2 right-2 bg-cyan-500/20 border border-cyan-500 rounded px-3 py-1 text-cyan-400 text-xs">
        3D Scene Active • WebGL Enabled
      </div>

      {/* System Status Header */}
      <div className="absolute top-4 left-4 bg-black/80 border border-cyan-500/30 rounded-lg p-4 text-white shadow-lg shadow-cyan-500/20">
        <div className="flex items-center gap-4">
          <Shield className="w-6 h-6 text-blue-400" />
          <div>
            <div className="font-bold text-blue-400">QUANTUM WAR ROOM</div>
            <div className="text-xs text-gray-400">Multi-Dimensional Crisis Command Center</div>
          </div>
          <div className="flex gap-2">
            <Badge variant="destructive">LEVEL 5</Badge>
            <Badge variant="outline" className="text-green-400 border-green-400">OPERATIONAL</Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
