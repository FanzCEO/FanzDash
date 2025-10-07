import { EventEmitter } from "events";
import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import { join } from "path";
import { spawn } from "child_process";

export interface VRContent {
  id: string;
  type:
    | "360_video"
    | "360_image"
    | "vr_experience"
    | "ar_overlay"
    | "3d_model"
    | "spatial_audio";
  name: string;
  description: string;
  originalPath: string;
  processedPaths: {
    stereo?: string;
    mono?: string;
    cubemap?: string;
    equirectangular?: string;
    optimized?: string;
    compressed?: string;
    thumbnail?: string;
  };
  metadata: {
    resolution: string;
    format: string;
    projection: "equirectangular" | "cubemap" | "fisheye" | "cylindrical";
    stereoFormat?: "side_by_side" | "top_bottom" | "mono";
    bitrate?: number;
    framerate?: number;
    duration?: number;
    fileSize: number;
    spatialAudio: boolean;
    interactiveElements: boolean;
  };
  qualitySettings: {
    resolution: "8K" | "4K" | "2K" | "1080p" | "720p";
    bitrate: number;
    compressionLevel: "lossless" | "high" | "medium" | "low";
    optimizeForDevice: "oculus" | "vive" | "pico" | "mobile" | "web";
  };
  processing: {
    status: "pending" | "processing" | "completed" | "failed";
    progress: number;
    stages: Array<{
      name: string;
      status: "pending" | "processing" | "completed" | "failed";
      progress: number;
      startTime?: Date;
      endTime?: Date;
      error?: string;
    }>;
    startTime?: Date;
    endTime?: Date;
    totalProcessingTime?: number;
  };
  platforms: {
    [platformId: string]: {
      status: "pending" | "uploading" | "published" | "failed";
      url?: string;
      lastSync: Date;
      views: number;
      interactionMetrics: {
        timeSpent: number;
        interactions: number;
        completionRate: number;
        motionSickness: number;
      };
    };
  };
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface AROverlay {
  id: string;
  name: string;
  type:
    | "face_filter"
    | "world_anchor"
    | "marker_based"
    | "markerless"
    | "hand_tracking";
  content: {
    models: Array<{
      id: string;
      path: string;
      format: "gltf" | "fbx" | "obj" | "usd";
      size: number;
      materials: string[];
      animations: string[];
    }>;
    textures: Array<{
      id: string;
      path: string;
      resolution: string;
      format: "png" | "jpg" | "hdr" | "exr";
      size: number;
    }>;
    shaders: Array<{
      id: string;
      path: string;
      type: "vertex" | "fragment" | "compute";
      platform: "opengl" | "metal" | "vulkan" | "directx";
    }>;
  };
  triggers: Array<{
    type:
      | "face_detection"
      | "gesture"
      | "voice"
      | "location"
      | "time"
      | "custom";
    parameters: Record<string, any>;
    actions: string[];
  }>;
  platforms: {
    [platformId: string]: {
      optimizedContent: string;
      performance: {
        fps: number;
        drawCalls: number;
        vertices: number;
        memoryUsage: number;
      };
    };
  };
  analytics: {
    usage: number;
    averageSessionTime: number;
    shareRate: number;
    completionRate: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface FutureTechRoadmap {
  id: string;
  name: string;
  category:
    | "vr"
    | "ar"
    | "ai"
    | "blockchain"
    | "metaverse"
    | "neural"
    | "quantum";
  description: string;
  status:
    | "research"
    | "development"
    | "testing"
    | "rollout"
    | "deployed"
    | "deprecated";
  priority: "low" | "medium" | "high" | "critical";
  timeline: {
    researchStart: Date;
    developmentStart?: Date;
    testingStart?: Date;
    rolloutStart?: Date;
    expectedCompletion: Date;
    actualCompletion?: Date;
  };
  requirements: {
    hardware: string[];
    software: string[];
    infrastructure: string[];
    expertise: string[];
    budget: number;
  };
  milestones: Array<{
    id: string;
    name: string;
    description: string;
    targetDate: Date;
    actualDate?: Date;
    status: "pending" | "in_progress" | "completed" | "delayed" | "cancelled";
    deliverables: string[];
  }>;
  risks: Array<{
    id: string;
    description: string;
    impact: "low" | "medium" | "high" | "critical";
    probability: number;
    mitigation: string;
    owner: string;
  }>;
  dependencies: string[];
  stakeholders: Array<{
    id: string;
    name: string;
    role: string;
    involvement: "sponsor" | "owner" | "contributor" | "reviewer";
  }>;
  metrics: {
    completionPercentage: number;
    budgetSpent: number;
    teamSize: number;
    roi: number;
    userAdoption?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface SpatialAnalytics {
  contentId: string;
  sessionId: string;
  userId: string;
  headset: string;
  session: {
    startTime: Date;
    endTime?: Date;
    duration: number;
    completed: boolean;
  };
  movement: {
    headMovement: Array<{
      timestamp: Date;
      position: { x: number; y: number; z: number };
      rotation: { x: number; y: number; z: number; w: number };
    }>;
    handMovement?: Array<{
      timestamp: Date;
      leftHand: { x: number; y: number; z: number };
      rightHand: { x: number; y: number; z: number };
    }>;
    locomotion: {
      totalDistance: number;
      averageSpeed: number;
      teleportCount: number;
      walkingTime: number;
    };
  };
  interactions: Array<{
    timestamp: Date;
    type: "grab" | "touch" | "point" | "voice" | "gesture" | "gaze";
    target: string;
    position: { x: number; y: number; z: number };
    duration: number;
    successful: boolean;
  }>;
  physiological: {
    heartRate?: number[];
    galvanicSkinResponse?: number[];
    eyeTracking?: Array<{
      timestamp: Date;
      gazeDirection: { x: number; y: number; z: number };
      pupilDilation: number;
      blinkRate: number;
    }>;
  };
  comfort: {
    motionSickness: number; // 0-10 scale
    discomfort: number; // 0-10 scale
    immersion: number; // 0-10 scale
    presence: number; // 0-10 scale
  };
  performance: {
    fps: number[];
    frameDrops: number;
    latency: number[];
    gpuUsage: number[];
    cpuUsage: number[];
    memoryUsage: number[];
  };
}

export class VRRenderingEngine extends EventEmitter {
  private vrContent = new Map<string, VRContent>();
  private arOverlays = new Map<string, AROverlay>();
  private futureTech = new Map<string, FutureTechRoadmap>();
  private spatialAnalytics: SpatialAnalytics[] = [];
  private processingQueue: VRContent[] = [];
  private activeProcesses = 0;
  private maxConcurrentProcesses = 2;

  constructor() {
    super();
    this.setupDirectories();
    this.startProcessingLoop();
    this.setupFutureTechRoadmap();
  }

  private async setupDirectories() {
    const dirs = [
      "vr/content/original",
      "vr/content/processed",
      "vr/content/thumbnails",
      "vr/models/3d",
      "vr/models/optimized",
      "ar/overlays",
      "ar/filters",
      "spatial/audio",
      "future-tech/prototypes",
    ];

    for (const dir of dirs) {
      await fs.mkdir(join(process.cwd(), "media", dir), { recursive: true });
    }
  }

  private startProcessingLoop() {
    setInterval(() => {
      this.processNextVRContent();
    }, 2000);
  }

  private setupFutureTechRoadmap() {
    const futureTechItems: Omit<
      FutureTechRoadmap,
      "id" | "createdAt" | "updatedAt"
    >[] = [
      {
        name: "Neural Interface Integration",
        category: "neural",
        description:
          "Direct neural interface for thought-controlled VR experiences",
        status: "research",
        priority: "high",
        timeline: {
          researchStart: new Date("2025-01-01"),
          expectedCompletion: new Date("2027-12-31"),
        },
        requirements: {
          hardware: [
            "EEG sensors",
            "Neural processing units",
            "Custom headsets",
          ],
          software: [
            "Neural pattern recognition AI",
            "Real-time signal processing",
          ],
          infrastructure: [
            "High-performance computing cluster",
            "Medical-grade facilities",
          ],
          expertise: [
            "Neuroscientists",
            "AI researchers",
            "Hardware engineers",
          ],
          budget: 5000000,
        },
        milestones: [
          {
            id: "neural-01",
            name: "EEG Signal Mapping",
            description: "Map basic thought patterns to VR actions",
            targetDate: new Date("2025-06-01"),
            status: "in_progress",
            deliverables: [
              "Signal processing algorithm",
              "Training dataset",
              "Proof of concept",
            ],
          },
          {
            id: "neural-02",
            name: "Real-time Processing",
            description: "Achieve real-time neural signal processing",
            targetDate: new Date("2026-03-01"),
            status: "pending",
            deliverables: [
              "Real-time processing engine",
              "Latency optimization",
            ],
          },
        ],
        risks: [
          {
            id: "neural-risk-01",
            description: "Privacy and ethical concerns with neural data",
            impact: "high",
            probability: 0.8,
            mitigation:
              "Develop robust privacy framework and ethical guidelines",
            owner: "Ethics Committee",
          },
        ],
        dependencies: ["Advanced AI models", "Regulatory approval"],
        stakeholders: [
          {
            id: "cto",
            name: "Chief Technology Officer",
            role: "CTO",
            involvement: "sponsor",
          },
          {
            id: "neural-lead",
            name: "Neural Interface Lead",
            role: "Lead Engineer",
            involvement: "owner",
          },
        ],
        metrics: {
          completionPercentage: 15,
          budgetSpent: 750000,
          teamSize: 12,
          roi: 0,
        },
      },
      {
        name: "Haptic Feedback Suit",
        category: "vr",
        description:
          "Full-body haptic feedback suit for immersive tactile experiences",
        status: "development",
        priority: "high",
        timeline: {
          researchStart: new Date("2024-06-01"),
          developmentStart: new Date("2024-12-01"),
          expectedCompletion: new Date("2026-06-01"),
        },
        requirements: {
          hardware: [
            "Haptic actuators",
            "Flexible materials",
            "Wireless communication",
          ],
          software: ["Haptic rendering engine", "Real-time physics simulation"],
          infrastructure: ["Manufacturing partnership", "Testing facilities"],
          expertise: [
            "Material scientists",
            "Haptic engineers",
            "UX designers",
          ],
          budget: 3000000,
        },
        milestones: [
          {
            id: "haptic-01",
            name: "Prototype Development",
            description: "Create first working prototype of haptic suit",
            targetDate: new Date("2025-03-01"),
            status: "completed",
            actualDate: new Date("2025-02-15"),
            deliverables: [
              "Working prototype",
              "Performance metrics",
              "User testing results",
            ],
          },
          {
            id: "haptic-02",
            name: "Manufacturing Scale-up",
            description: "Prepare for mass production",
            targetDate: new Date("2025-12-01"),
            status: "in_progress",
            deliverables: ["Manufacturing process", "Quality control systems"],
          },
        ],
        risks: [
          {
            id: "haptic-risk-01",
            description: "High manufacturing costs",
            impact: "medium",
            probability: 0.6,
            mitigation:
              "Explore alternative materials and manufacturing methods",
            owner: "Manufacturing Lead",
          },
        ],
        dependencies: ["Material research", "Partner agreements"],
        stakeholders: [
          {
            id: "product-manager",
            name: "VR Product Manager",
            role: "PM",
            involvement: "owner",
          },
        ],
        metrics: {
          completionPercentage: 45,
          budgetSpent: 1350000,
          teamSize: 18,
          roi: 0,
        },
      },
      {
        name: "AI-Generated Virtual Worlds",
        category: "ai",
        description:
          "Real-time AI generation of infinite virtual worlds and experiences",
        status: "testing",
        priority: "medium",
        timeline: {
          researchStart: new Date("2024-01-01"),
          developmentStart: new Date("2024-08-01"),
          testingStart: new Date("2025-01-01"),
          expectedCompletion: new Date("2025-08-01"),
        },
        requirements: {
          hardware: ["GPU clusters", "High-speed storage"],
          software: ["Generative AI models", "Real-time rendering engine"],
          infrastructure: [
            "Cloud computing resources",
            "Content delivery network",
          ],
          expertise: ["AI researchers", "Game developers", "World designers"],
          budget: 2500000,
        },
        milestones: [
          {
            id: "ai-world-01",
            name: "Procedural Landscape Generation",
            description: "AI system for generating realistic landscapes",
            targetDate: new Date("2024-10-01"),
            status: "completed",
            actualDate: new Date("2024-09-20"),
            deliverables: ["Landscape generation AI", "Performance benchmarks"],
          },
        ],
        risks: [],
        dependencies: ["GPU infrastructure", "AI model training"],
        stakeholders: [],
        metrics: {
          completionPercentage: 70,
          budgetSpent: 1750000,
          teamSize: 15,
          roi: 0,
        },
      },
      {
        name: "Blockchain Virtual Assets",
        category: "blockchain",
        description: "NFT-based virtual assets with cross-platform ownership",
        status: "rollout",
        priority: "medium",
        timeline: {
          researchStart: new Date("2023-06-01"),
          developmentStart: new Date("2023-12-01"),
          testingStart: new Date("2024-06-01"),
          rolloutStart: new Date("2024-12-01"),
          expectedCompletion: new Date("2025-03-01"),
        },
        requirements: {
          hardware: ["Blockchain nodes", "Secure storage"],
          software: ["Smart contracts", "Asset management system"],
          infrastructure: ["Blockchain network", "Marketplace platform"],
          expertise: ["Blockchain developers", "Smart contract auditors"],
          budget: 1500000,
        },
        milestones: [
          {
            id: "nft-01",
            name: "Smart Contract Deployment",
            description: "Deploy and test smart contracts for virtual assets",
            targetDate: new Date("2024-03-01"),
            status: "completed",
            actualDate: new Date("2024-02-28"),
            deliverables: ["Smart contracts", "Security audit"],
          },
          {
            id: "nft-02",
            name: "Marketplace Launch",
            description: "Launch virtual asset marketplace",
            targetDate: new Date("2024-09-01"),
            status: "completed",
            actualDate: new Date("2024-08-15"),
            deliverables: ["Live marketplace", "User onboarding system"],
          },
        ],
        risks: [
          {
            id: "blockchain-risk-01",
            description: "Regulatory changes affecting NFTs",
            impact: "high",
            probability: 0.4,
            mitigation: "Monitor regulations and adapt compliance measures",
            owner: "Legal Team",
          },
        ],
        dependencies: ["Regulatory clarity", "Blockchain infrastructure"],
        stakeholders: [],
        metrics: {
          completionPercentage: 85,
          budgetSpent: 1275000,
          teamSize: 8,
          roi: 0.2,
          userAdoption: 12500,
        },
      },
      {
        name: "Quantum Computing Integration",
        category: "quantum",
        description:
          "Quantum computing for real-time physics simulation and AI processing",
        status: "research",
        priority: "low",
        timeline: {
          researchStart: new Date("2025-06-01"),
          expectedCompletion: new Date("2030-12-31"),
        },
        requirements: {
          hardware: ["Quantum computers", "Quantum-classical interfaces"],
          software: ["Quantum algorithms", "Hybrid processing systems"],
          infrastructure: [
            "Quantum computing access",
            "Specialized facilities",
          ],
          expertise: ["Quantum physicists", "Quantum software engineers"],
          budget: 8000000,
        },
        milestones: [],
        risks: [
          {
            id: "quantum-risk-01",
            description: "Quantum technology not mature enough",
            impact: "critical",
            probability: 0.7,
            mitigation: "Partner with quantum computing companies",
            owner: "Research Director",
          },
        ],
        dependencies: [
          "Quantum hardware availability",
          "Quantum software development",
        ],
        stakeholders: [],
        metrics: {
          completionPercentage: 5,
          budgetSpent: 200000,
          teamSize: 3,
          roi: 0,
        },
      },
    ];

    for (const tech of futureTechItems) {
      const id = randomUUID();
      this.futureTech.set(id, {
        ...tech,
        id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }

  async addVRContent(contentData: {
    type: VRContent["type"];
    name: string;
    description: string;
    originalPath: string;
    qualitySettings: VRContent["qualitySettings"];
    createdBy: string;
  }): Promise<string> {
    const contentId = randomUUID();

    // Extract metadata from file
    const metadata = await this.extractVRMetadata(
      contentData.originalPath,
      contentData.type,
    );

    const content: VRContent = {
      id: contentId,
      type: contentData.type,
      name: contentData.name,
      description: contentData.description,
      originalPath: contentData.originalPath,
      processedPaths: {},
      metadata,
      qualitySettings: contentData.qualitySettings,
      processing: {
        status: "pending",
        progress: 0,
        stages: [
          { name: "Format Conversion", status: "pending", progress: 0 },
          { name: "Spatial Optimization", status: "pending", progress: 0 },
          { name: "Quality Enhancement", status: "pending", progress: 0 },
          { name: "Platform Optimization", status: "pending", progress: 0 },
          { name: "Thumbnail Generation", status: "pending", progress: 0 },
        ],
      },
      platforms: {},
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: contentData.createdBy,
    };

    this.vrContent.set(contentId, content);
    this.processingQueue.push(content);

    this.emit("vrContentAdded", content);
    return contentId;
  }

  private async extractVRMetadata(
    filePath: string,
    type: VRContent["type"],
  ): Promise<VRContent["metadata"]> {
    return new Promise((resolve) => {
      const process = spawn("ffprobe", [
        "-v",
        "quiet",
        "-print_format",
        "json",
        "-show_format",
        "-show_streams",
        filePath,
      ]);

      let output = "";
      process.stdout.on("data", (data) => (output += data));

      process.on("close", async (code) => {
        let metadata: VRContent["metadata"] = {
          resolution: "4K",
          format: "mp4",
          projection: "equirectangular",
          fileSize: 0,
          spatialAudio: false,
          interactiveElements: false,
        };

        if (code === 0) {
          try {
            const data = JSON.parse(output);
            const videoStream = data.streams?.find(
              (s: any) => s.codec_type === "video",
            );
            const audioStream = data.streams?.find(
              (s: any) => s.codec_type === "audio",
            );
            const format = data.format;

            if (videoStream) {
              metadata.resolution = `${videoStream.width}x${videoStream.height}`;
              metadata.bitrate = parseInt(videoStream.bit_rate) || 0;
              // Parse frame rate safely (format: "30/1" or "24000/1001")
              const frameRateParts = videoStream.r_frame_rate?.split('/');
              metadata.framerate = frameRateParts?.length === 2 
                ? parseFloat(frameRateParts[0]) / parseFloat(frameRateParts[1]) 
                : 30;
              metadata.format = videoStream.codec_name;
            }

            if (format) {
              metadata.duration = parseFloat(format.duration) || 0;
              metadata.fileSize = parseInt(format.size) || 0;
            }

            if (audioStream) {
              metadata.spatialAudio = audioStream.channels > 2;
            }

            // Detect VR projection type based on aspect ratio
            if (videoStream) {
              const aspectRatio = videoStream.width / videoStream.height;
              if (aspectRatio === 2) {
                metadata.projection = "equirectangular";
              } else if (aspectRatio === 1.5) {
                metadata.projection = "cubemap";
              }
            }
          } catch (error) {
            console.error("Failed to parse VR metadata:", error);
          }
        }

        // Get file stats
        try {
          const stats = await fs.stat(filePath);
          metadata.fileSize = stats.size;
        } catch (error) {
          console.error("Failed to get file stats:", error);
        }

        resolve(metadata);
      });
    });
  }

  private async processNextVRContent() {
    if (
      this.processingQueue.length === 0 ||
      this.activeProcesses >= this.maxConcurrentProcesses
    ) {
      return;
    }

    const content = this.processingQueue.shift()!;
    this.activeProcesses++;

    try {
      await this.processVRContent(content);
    } catch (error) {
      content.processing.status = "failed";
      console.error(`VR processing failed for ${content.id}:`, error);
      this.emit("vrProcessingFailed", content, error);
    } finally {
      this.activeProcesses--;
    }
  }

  private async processVRContent(content: VRContent) {
    content.processing.status = "processing";
    content.processing.startTime = new Date();

    this.emit("vrProcessingStarted", content);

    for (const stage of content.processing.stages) {
      try {
        stage.status = "processing";
        stage.startTime = new Date();

        await this.executeProcessingStage(content, stage);

        stage.status = "completed";
        stage.endTime = new Date();
        stage.progress = 100;
      } catch (error) {
        stage.status = "failed";
        stage.endTime = new Date();
        stage.error = error instanceof Error ? error.message : "Unknown error";
        throw error;
      }
    }

    content.processing.status = "completed";
    content.processing.endTime = new Date();
    content.processing.progress = 100;
    content.processing.totalProcessingTime =
      content.processing.endTime.getTime() -
      content.processing.startTime!.getTime();

    this.emit("vrProcessingCompleted", content);
  }

  private async executeProcessingStage(
    content: VRContent,
    stage: { name: string; progress: number },
  ) {
    const outputDir = join(
      process.cwd(),
      "media",
      "vr",
      "content",
      "processed",
    );

    switch (stage.name) {
      case "Format Conversion":
        await this.convertVRFormat(content, outputDir, stage);
        break;
      case "Spatial Optimization":
        await this.optimizeForSpatial(content, outputDir, stage);
        break;
      case "Quality Enhancement":
        await this.enhanceQuality(content, outputDir, stage);
        break;
      case "Platform Optimization":
        await this.optimizeForPlatforms(content, outputDir, stage);
        break;
      case "Thumbnail Generation":
        await this.generateVRThumbnail(content, stage);
        break;
    }
  }

  private async convertVRFormat(
    content: VRContent,
    outputDir: string,
    stage: { progress: number },
  ) {
    const outputPath = join(outputDir, `${content.id}_converted.mp4`);

    return new Promise<void>((resolve, reject) => {
      const ffmpegArgs = [
        "-i",
        content.originalPath,
        "-c:v",
        "libx264",
        "-preset",
        "medium",
        "-crf",
        "20",
        "-c:a",
        "aac",
        "-b:a",
        "192k",
        "-movflags",
        "+faststart",
        "-y",
        outputPath,
      ];

      // Add VR-specific filters based on projection
      if (content.metadata.projection === "equirectangular") {
        ffmpegArgs.splice(
          -2,
          0,
          "-vf",
          "v360=e:e:cubic:out_fov=360:in_fov=360",
        );
      }

      const process = spawn("ffmpeg", ffmpegArgs);

      process.stderr?.on("data", (data) => {
        const output = data.toString();
        if (output.includes("time=")) {
          const timeMatch = output.match(/time=(\d{2}):(\d{2}):(\d{2}\.\d{2})/);
          if (timeMatch && content.metadata.duration) {
            const [, hours, minutes, seconds] = timeMatch;
            const currentTime =
              parseInt(hours) * 3600 +
              parseInt(minutes) * 60 +
              parseFloat(seconds);
            stage.progress = Math.min(
              95,
              Math.round((currentTime / content.metadata.duration) * 100),
            );
          }
        }
      });

      process.on("close", (code) => {
        if (code === 0) {
          content.processedPaths.optimized = outputPath;
          stage.progress = 100;
          resolve();
        } else {
          reject(new Error(`Format conversion failed with code ${code}`));
        }
      });
    });
  }

  private async optimizeForSpatial(
    content: VRContent,
    outputDir: string,
    stage: { progress: number },
  ) {
    // Simulate spatial optimization processing
    const steps = 20;
    for (let i = 0; i < steps; i++) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      stage.progress = Math.round(((i + 1) / steps) * 100);
    }

    // Create spatial-optimized version
    const spatialPath = join(outputDir, `${content.id}_spatial.mp4`);
    content.processedPaths.stereo = spatialPath;
  }

  private async enhanceQuality(
    content: VRContent,
    outputDir: string,
    stage: { progress: number },
  ) {
    // Simulate quality enhancement
    if (content.qualitySettings.resolution === "8K") {
      // More processing time for 8K
      const steps = 50;
      for (let i = 0; i < steps; i++) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        stage.progress = Math.round(((i + 1) / steps) * 100);
      }
    } else {
      const steps = 25;
      for (let i = 0; i < steps; i++) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        stage.progress = Math.round(((i + 1) / steps) * 100);
      }
    }

    const enhancedPath = join(outputDir, `${content.id}_enhanced.mp4`);
    content.processedPaths.compressed = enhancedPath;
  }

  private async optimizeForPlatforms(
    content: VRContent,
    outputDir: string,
    stage: { progress: number },
  ) {
    const platforms = ["oculus", "vive", "pico", "mobile"];

    for (let i = 0; i < platforms.length; i++) {
      const platform = platforms[i];

      // Simulate platform-specific optimization
      await new Promise((resolve) => setTimeout(resolve, 500));

      const platformPath = join(outputDir, `${content.id}_${platform}.mp4`);
      content.processedPaths[platform] = platformPath;

      stage.progress = Math.round(((i + 1) / platforms.length) * 100);
    }
  }

  private async generateVRThumbnail(
    content: VRContent,
    stage: { progress: number },
  ) {
    const thumbnailDir = join(
      process.cwd(),
      "media",
      "vr",
      "content",
      "thumbnails",
    );
    const thumbnailPath = join(thumbnailDir, `${content.id}_thumb.jpg`);

    return new Promise<void>((resolve, reject) => {
      const seekTime = content.metadata.duration
        ? content.metadata.duration * 0.1
        : 5;

      const process = spawn("ffmpeg", [
        "-i",
        content.originalPath,
        "-ss",
        seekTime.toString(),
        "-vframes",
        "1",
        "-vf",
        "scale=512:256,v360=e:flat:cubic",
        "-y",
        thumbnailPath,
      ]);

      process.on("close", (code) => {
        if (code === 0) {
          content.processedPaths.thumbnail = thumbnailPath;
          stage.progress = 100;
          resolve();
        } else {
          reject(new Error(`Thumbnail generation failed with code ${code}`));
        }
      });
    });
  }

  async createAROverlay(overlayData: {
    name: string;
    type: AROverlay["type"];
    models: AROverlay["content"]["models"];
    textures: AROverlay["content"]["textures"];
    triggers: AROverlay["triggers"];
  }): Promise<string> {
    const overlayId = randomUUID();

    const overlay: AROverlay = {
      id: overlayId,
      name: overlayData.name,
      type: overlayData.type,
      content: {
        models: overlayData.models,
        textures: overlayData.textures,
        shaders: [],
      },
      triggers: overlayData.triggers,
      platforms: {},
      analytics: {
        usage: 0,
        averageSessionTime: 0,
        shareRate: 0,
        completionRate: 0,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.arOverlays.set(overlayId, overlay);
    this.emit("arOverlayCreated", overlay);

    return overlayId;
  }

  async trackSpatialAnalytics(
    analyticsData: Omit<SpatialAnalytics, "session"> & {
      sessionStart: Date;
      sessionEnd?: Date;
    },
  ): Promise<void> {
    const analytics: SpatialAnalytics = {
      ...analyticsData,
      session: {
        startTime: analyticsData.sessionStart,
        endTime: analyticsData.sessionEnd,
        duration: analyticsData.sessionEnd
          ? analyticsData.sessionEnd.getTime() -
            analyticsData.sessionStart.getTime()
          : 0,
        completed: !!analyticsData.sessionEnd,
      },
    };

    this.spatialAnalytics.push(analytics);

    // Keep only last 10000 analytics entries
    if (this.spatialAnalytics.length > 10000) {
      this.spatialAnalytics = this.spatialAnalytics.slice(-10000);
    }

    this.emit("spatialAnalyticsTracked", analytics);
  }

  updateFutureTechProgress(
    techId: string,
    updates: {
      status?: FutureTechRoadmap["status"];
      completionPercentage?: number;
      budgetSpent?: number;
      milestoneUpdate?: {
        milestoneId: string;
        status: FutureTechRoadmap["milestones"][0]["status"];
        actualDate?: Date;
      };
    },
  ): boolean {
    const tech = this.futureTech.get(techId);
    if (!tech) return false;

    if (updates.status) tech.status = updates.status;
    if (updates.completionPercentage !== undefined) {
      tech.metrics.completionPercentage = updates.completionPercentage;
    }
    if (updates.budgetSpent !== undefined) {
      tech.metrics.budgetSpent = updates.budgetSpent;
    }

    if (updates.milestoneUpdate) {
      const milestone = tech.milestones.find(
        (m) => m.id === updates.milestoneUpdate!.milestoneId,
      );
      if (milestone) {
        milestone.status = updates.milestoneUpdate.status;
        if (updates.milestoneUpdate.actualDate) {
          milestone.actualDate = updates.milestoneUpdate.actualDate;
        }
      }
    }

    tech.updatedAt = new Date();
    this.emit("futureTechUpdated", tech);

    return true;
  }

  // Analytics and Reporting Methods
  getVRAnalytics(): {
    totalContent: number;
    processingQueue: number;
    completedToday: number;
    totalProcessingTime: number;
    averageProcessingTime: number;
    qualityDistribution: Record<string, number>;
    platformDistribution: Record<string, number>;
  } {
    const content = Array.from(this.vrContent.values());
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const completedToday = content.filter(
      (c) =>
        c.processing.status === "completed" &&
        c.processing.endTime &&
        c.processing.endTime >= today,
    ).length;

    const totalProcessingTime = content
      .filter((c) => c.processing.totalProcessingTime)
      .reduce((sum, c) => sum + c.processing.totalProcessingTime!, 0);

    const completedContent = content.filter(
      (c) => c.processing.status === "completed",
    );
    const averageProcessingTime =
      completedContent.length > 0
        ? totalProcessingTime / completedContent.length
        : 0;

    const qualityDistribution = content.reduce(
      (acc, c) => {
        acc[c.qualitySettings.resolution] =
          (acc[c.qualitySettings.resolution] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const platformDistribution = content.reduce(
      (acc, c) => {
        Object.keys(c.platforms).forEach((platform) => {
          acc[platform] = (acc[platform] || 0) + 1;
        });
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      totalContent: content.length,
      processingQueue: this.processingQueue.length,
      completedToday,
      totalProcessingTime,
      averageProcessingTime: Math.round(averageProcessingTime),
      qualityDistribution,
      platformDistribution,
    };
  }

  getFutureTechStatus(): {
    byStatus: Record<string, number>;
    byCategory: Record<string, number>;
    byPriority: Record<string, number>;
    totalBudget: number;
    spentBudget: number;
    averageCompletion: number;
    upcomingMilestones: Array<{
      techName: string;
      milestoneName: string;
      targetDate: Date;
      status: string;
    }>;
  } {
    const techs = Array.from(this.futureTech.values());

    const byStatus = techs.reduce(
      (acc, tech) => {
        acc[tech.status] = (acc[tech.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const byCategory = techs.reduce(
      (acc, tech) => {
        acc[tech.category] = (acc[tech.category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const byPriority = techs.reduce(
      (acc, tech) => {
        acc[tech.priority] = (acc[tech.priority] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const totalBudget = techs.reduce(
      (sum, tech) => sum + tech.requirements.budget,
      0,
    );
    const spentBudget = techs.reduce(
      (sum, tech) => sum + tech.metrics.budgetSpent,
      0,
    );
    const averageCompletion =
      techs.length > 0
        ? techs.reduce(
            (sum, tech) => sum + tech.metrics.completionPercentage,
            0,
          ) / techs.length
        : 0;

    const upcomingMilestones = techs
      .flatMap((tech) =>
        tech.milestones.map((milestone) => ({
          techName: tech.name,
          milestoneName: milestone.name,
          targetDate: milestone.targetDate,
          status: milestone.status,
        })),
      )
      .filter(
        (milestone) =>
          milestone.status === "pending" || milestone.status === "in_progress",
      )
      .sort((a, b) => a.targetDate.getTime() - b.targetDate.getTime())
      .slice(0, 10);

    return {
      byStatus,
      byCategory,
      byPriority,
      totalBudget,
      spentBudget,
      averageCompletion: Math.round(averageCompletion * 100) / 100,
      upcomingMilestones,
    };
  }

  getSpatialAnalyticsInsights(): {
    totalSessions: number;
    averageSessionTime: number;
    completionRate: number;
    comfortScores: {
      averageMotionSickness: number;
      averageImmersion: number;
      averagePresence: number;
    };
    mostUsedDevices: Array<{ device: string; count: number }>;
    interactionHeatmap: Array<{
      type: string;
      count: number;
      successRate: number;
    }>;
  } {
    const sessions = this.spatialAnalytics;
    const totalSessions = sessions.length;

    const averageSessionTime =
      sessions.length > 0
        ? sessions.reduce((sum, s) => sum + s.session.duration, 0) /
          sessions.length
        : 0;

    const completionRate =
      sessions.length > 0
        ? (sessions.filter((s) => s.session.completed).length /
            sessions.length) *
          100
        : 0;

    const comfortScores = {
      averageMotionSickness:
        sessions.length > 0
          ? sessions.reduce((sum, s) => sum + s.comfort.motionSickness, 0) /
            sessions.length
          : 0,
      averageImmersion:
        sessions.length > 0
          ? sessions.reduce((sum, s) => sum + s.comfort.immersion, 0) /
            sessions.length
          : 0,
      averagePresence:
        sessions.length > 0
          ? sessions.reduce((sum, s) => sum + s.comfort.presence, 0) /
            sessions.length
          : 0,
    };

    const deviceCounts = sessions.reduce(
      (acc, s) => {
        acc[s.headset] = (acc[s.headset] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const mostUsedDevices = Object.entries(deviceCounts)
      .map(([device, count]) => ({ device, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const interactionCounts = sessions
      .flatMap((s) => s.interactions)
      .reduce(
        (acc, interaction) => {
          const key = interaction.type;
          if (!acc[key]) {
            acc[key] = { total: 0, successful: 0 };
          }
          acc[key].total++;
          if (interaction.successful) acc[key].successful++;
          return acc;
        },
        {} as Record<string, { total: number; successful: number }>,
      );

    const interactionHeatmap = Object.entries(interactionCounts)
      .map(([type, data]) => ({
        type,
        count: data.total,
        successRate: data.total > 0 ? (data.successful / data.total) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count);

    return {
      totalSessions,
      averageSessionTime: Math.round(averageSessionTime),
      completionRate: Math.round(completionRate * 100) / 100,
      comfortScores: {
        averageMotionSickness:
          Math.round(comfortScores.averageMotionSickness * 100) / 100,
        averageImmersion:
          Math.round(comfortScores.averageImmersion * 100) / 100,
        averagePresence: Math.round(comfortScores.averagePresence * 100) / 100,
      },
      mostUsedDevices,
      interactionHeatmap,
    };
  }

  // Public API Methods
  getVRContent(contentId: string): VRContent | undefined {
    return this.vrContent.get(contentId);
  }

  getAllVRContent(): VRContent[] {
    return Array.from(this.vrContent.values());
  }

  getAROverlay(overlayId: string): AROverlay | undefined {
    return this.arOverlays.get(overlayId);
  }

  getAllAROverlays(): AROverlay[] {
    return Array.from(this.arOverlays.values());
  }

  getFutureTech(techId: string): FutureTechRoadmap | undefined {
    return this.futureTech.get(techId);
  }

  getAllFutureTech(): FutureTechRoadmap[] {
    return Array.from(this.futureTech.values());
  }

  getProcessingQueue(): VRContent[] {
    return [...this.processingQueue];
  }

  getProcessingStatus(): {
    queueLength: number;
    activeProcesses: number;
    maxConcurrentProcesses: number;
    estimatedWaitTime: number;
  } {
    const averageProcessingTime = 300000; // 5 minutes average
    const estimatedWaitTime =
      this.processingQueue.length *
      (averageProcessingTime / this.maxConcurrentProcesses);

    return {
      queueLength: this.processingQueue.length,
      activeProcesses: this.activeProcesses,
      maxConcurrentProcesses: this.maxConcurrentProcesses,
      estimatedWaitTime: Math.round(estimatedWaitTime / 1000), // Convert to seconds
    };
  }
}

// Singleton instance
export const vrRenderingEngine = new VRRenderingEngine();
