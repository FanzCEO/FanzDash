import { EventEmitter } from 'events';
import { promises as fs } from 'fs';
import { join, extname, basename } from 'path';
import { randomUUID } from 'crypto';
import { spawn, ChildProcess } from 'child_process';

export interface VRContent {
  id: string;
  type: '360_video' | '360_image' | 'vr_experience' | 'ar_overlay' | 'spatial_audio' | 'volumetric' | 'hologram';
  title: string;
  description?: string;
  originalPath: string;
  processedPaths: {
    stereo?: string;
    mono?: string;
    cubemap?: string;
    equirectangular?: string;
    spatialAudio?: string;
    lowRes?: string;
    mediumRes?: string;
    highRes?: string;
    ultraRes?: string;
  };
  metadata: {
    duration?: number;
    resolution: { width: number; height: number };
    fps?: number;
    projection: 'equirectangular' | 'cubemap' | 'fisheye' | 'stereographic';
    stereoLayout?: 'side_by_side' | 'top_bottom' | 'mono';
    fieldOfView: { horizontal: number; vertical: number };
    spatialAudioChannels?: number;
    bitrate?: number;
    codec?: string;
    fileSize: number;
  };
  immersiveFeatures: {
    headTracking: boolean;
    handTracking: boolean;
    eyeTracking: boolean;
    hapticFeedback: boolean;
    spatialAudio: boolean;
    roomScale: boolean;
    passthrough: boolean;
    bodyTracking: boolean;
  };
  qualityProfiles: VRQualityProfile[];
  spatialData?: {
    boundingBox: { x: number; y: number; z: number; width: number; height: number; depth: number };
    anchorPoints: Array<{ x: number; y: number; z: number; type: string; data: any }>;
    interactiveElements: Array<{ id: string; position: { x: number; y: number; z: number }; type: string; properties: any }>;
    collisionMesh?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  status: 'processing' | 'ready' | 'failed' | 'archived';
  tags: string[];
  compatibility: {
    platforms: ('oculus' | 'steamvr' | 'psvr' | 'webxr' | 'arcore' | 'arkit' | 'hololens')[];
    minSpecs: {
      cpu: string;
      gpu: string;
      ram: string;
      storage: string;
    };
  };
}

export interface VRQualityProfile {
  id: string;
  name: string;
  resolution: { width: number; height: number };
  fps: number;
  bitrate: string;
  compressionLevel: number;
  targetPlatform: string[];
  estimatedFileSize: number;
  processingTime?: number;
}

export interface VRRenderingJob {
  id: string;
  contentId: string;
  type: 'convert' | 'optimize' | 'encode' | 'spatialize' | 'cubemap' | 'stereo_generate';
  qualityProfile?: string;
  parameters: {
    outputFormat?: 'mp4' | 'webm' | 'mkv' | 'mov';
    projection?: 'equirectangular' | 'cubemap' | 'fisheye';
    stereoMode?: 'mono' | 'stereo_sbs' | 'stereo_tb';
    resolution?: { width: number; height: number };
    fps?: number;
    bitrate?: string;
    audioChannels?: number;
    spatialAudioFormat?: 'ambisonic' | 'binaural' | 'surround';
  };
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  startTime?: Date;
  endTime?: Date;
  error?: string;
  outputPath?: string;
  estimatedDuration?: number;
  actualDuration?: number;
}

export interface VRExperience {
  id: string;
  name: string;
  description: string;
  type: 'guided_tour' | 'interactive_story' | 'social_space' | 'game' | 'training' | 'concert' | 'art_gallery';
  contentIds: string[];
  scenes: Array<{
    id: string;
    name: string;
    contentId: string;
    duration?: number;
    transitions: Array<{
      targetSceneId: string;
      trigger: 'time' | 'user_action' | 'gaze' | 'gesture' | 'voice';
      conditions?: any;
    }>;
    interactiveElements: Array<{
      id: string;
      type: 'button' | 'hotspot' | 'overlay' | 'portal' | '3d_object';
      position: { x: number; y: number; z: number };
      properties: any;
      actions: Array<{
        type: 'navigate' | 'play_audio' | 'show_info' | 'trigger_haptic' | 'custom';
        parameters: any;
      }>;
    }>;
  }>;
  settings: {
    locomotion: 'teleport' | 'smooth' | 'roomscale' | 'seated';
    comfort: 'comfortable' | 'moderate' | 'intense';
    ageRating: string;
    duration: number;
    maxUsers: number;
    requiresControllers: boolean;
    supportsMixedReality: boolean;
  };
  analytics: {
    totalViews: number;
    averageSessionDuration: number;
    completionRate: number;
    dropoffPoints: Array<{ sceneId: string; percentage: number }>;
    userRatings: { average: number; count: number };
    heatmaps: Array<{ sceneId: string; gazeData: number[][][] }>;
  };
  createdAt: Date;
  updatedAt: Date;
  isPublished: boolean;
  userId: string;
}

export interface AROverlay {
  id: string;
  name: string;
  type: 'info_card' | '3d_model' | 'video_overlay' | 'animation' | 'ui_element' | 'hologram';
  contentPath: string;
  trackingData: {
    type: 'marker' | 'markerless' | 'plane' | 'image' | 'face' | 'hand' | 'object';
    referenceData?: string; // marker image, reference object, etc.
    trackingStrength: number; // 0-100
    occlusionHandling: boolean;
    lightEstimation: boolean;
  };
  transform: {
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number; w: number };
    scale: { x: number; y: number; z: number };
  };
  animation: {
    enabled: boolean;
    type: 'loop' | 'pingpong' | 'once';
    duration: number;
    easing: string;
  };
  interactivity: {
    enabled: boolean;
    gestures: string[];
    voiceCommands: string[];
    touchActions: string[];
  };
  visibility: {
    distance: { min: number; max: number };
    angle: { min: number; max: number };
    lighting: { min: number; max: number };
  };
  performance: {
    maxPolygons: number;
    textureResolution: { width: number; height: number };
    renderPriority: number;
    levelOfDetail: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  isActive: boolean;
}

export class VRRenderingEngine extends EventEmitter {
  private vrContent = new Map<string, VRContent>();
  private renderingJobs = new Map<string, VRRenderingJob>();
  private vrExperiences = new Map<string, VRExperience>();
  private arOverlays = new Map<string, AROverlay>();
  private activeProcesses = new Map<string, ChildProcess>();
  private processingQueue: VRRenderingJob[] = [];
  private maxConcurrentJobs = 2; // VR processing is resource intensive

  private defaultQualityProfiles: VRQualityProfile[] = [
    {
      id: 'mobile_vr',
      name: 'Mobile VR (Low)',
      resolution: { width: 2048, height: 1024 },
      fps: 60,
      bitrate: '5000k',
      compressionLevel: 75,
      targetPlatform: ['mobile', 'cardboard', 'gearvr'],
      estimatedFileSize: 50
    },
    {
      id: 'standalone_vr',
      name: 'Standalone VR (Medium)',
      resolution: { width: 4096, height: 2048 },
      fps: 72,
      bitrate: '15000k',
      compressionLevel: 65,
      targetPlatform: ['oculus', 'psvr'],
      estimatedFileSize: 150
    },
    {
      id: 'pc_vr_high',
      name: 'PC VR (High)',
      resolution: { width: 5760, height: 2880 },
      fps: 90,
      bitrate: '25000k',
      compressionLevel: 55,
      targetPlatform: ['steamvr', 'oculus_pc'],
      estimatedFileSize: 300
    },
    {
      id: 'pc_vr_ultra',
      name: 'PC VR (Ultra)',
      resolution: { width: 7680, height: 3840 },
      fps: 120,
      bitrate: '50000k',
      compressionLevel: 45,
      targetPlatform: ['steamvr', 'varjo', 'pimax'],
      estimatedFileSize: 600
    }
  ];

  constructor() {
    super();
    this.setupDirectories();
    this.startProcessingLoop();
  }

  private async setupDirectories() {
    const dirs = [
      'vr/content/original',
      'vr/content/processed',
      'vr/content/cubemaps',
      'vr/content/stereo',
      'vr/content/spatial_audio',
      'vr/experiences',
      'ar/overlays',
      'ar/markers',
      'vr/thumbnails'
    ];

    for (const dir of dirs) {
      await fs.mkdir(join(process.cwd(), 'media', dir), { recursive: true });
    }
  }

  private startProcessingLoop() {
    setInterval(() => {
      this.processNextJob();
    }, 5000);
  }

  async createVRContent(
    filePath: string,
    contentData: {
      type: VRContent['type'];
      title: string;
      description?: string;
      projection?: VRContent['metadata']['projection'];
      stereoLayout?: VRContent['metadata']['stereoLayout'];
      immersiveFeatures?: Partial<VRContent['immersiveFeatures']>;
      userId: string;
      tags?: string[];
    }
  ): Promise<string> {
    const contentId = randomUUID();
    const filename = basename(filePath);
    const stats = await fs.stat(filePath);

    // Extract metadata from file
    const metadata = await this.extractVRMetadata(filePath, contentData.type);

    const content: VRContent = {
      id: contentId,
      type: contentData.type,
      title: contentData.title,
      description: contentData.description,
      originalPath: filePath,
      processedPaths: {},
      metadata: {
        ...metadata,
        projection: contentData.projection || metadata.projection || 'equirectangular',
        stereoLayout: contentData.stereoLayout || metadata.stereoLayout || 'mono',
        fileSize: stats.size
      },
      immersiveFeatures: {
        headTracking: true,
        handTracking: false,
        eyeTracking: false,
        hapticFeedback: false,
        spatialAudio: false,
        roomScale: false,
        passthrough: false,
        bodyTracking: false,
        ...contentData.immersiveFeatures
      },
      qualityProfiles: this.defaultQualityProfiles,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: contentData.userId,
      status: 'processing',
      tags: contentData.tags || [],
      compatibility: {
        platforms: ['webxr', 'oculus', 'steamvr'],
        minSpecs: {
          cpu: 'Intel i5-8400 / AMD Ryzen 5 2600',
          gpu: 'GTX 1060 / RX 580',
          ram: '8GB',
          storage: '2GB'
        }
      }
    };

    this.vrContent.set(contentId, content);

    // Create processing jobs for different quality profiles
    await this.createProcessingJobs(content);

    this.emit('vrContentCreated', content);
    return contentId;
  }

  private async extractVRMetadata(filePath: string, type: VRContent['type']): Promise<Partial<VRContent['metadata']>> {
    return new Promise((resolve, reject) => {
      const process = spawn('ffprobe', [
        '-v', 'quiet',
        '-print_format', 'json',
        '-show_format',
        '-show_streams',
        filePath
      ]);

      let output = '';
      
      process.stdout.on('data', (data) => {
        output += data.toString();
      });

      process.on('close', (code) => {
        if (code !== 0) {
          reject(new Error('Failed to extract VR metadata'));
          return;
        }

        try {
          const data = JSON.parse(output);
          const videoStream = data.streams?.find((s: any) => s.codec_type === 'video');
          const audioStream = data.streams?.find((s: any) => s.codec_type === 'audio');
          const format = data.format;

          const metadata: Partial<VRContent['metadata']> = {
            duration: parseFloat(format.duration) || undefined,
            resolution: {
              width: videoStream?.width || 1920,
              height: videoStream?.height || 1080
            },
            fps: videoStream ? eval(videoStream.r_frame_rate) : undefined,
            bitrate: parseInt(format.bit_rate) || undefined,
            codec: videoStream?.codec_name,
            spatialAudioChannels: audioStream?.channels
          };

          // Detect projection based on resolution aspect ratio
          if (videoStream) {
            const aspectRatio = videoStream.width / videoStream.height;
            if (aspectRatio === 2.0) {
              metadata.projection = 'equirectangular';
            } else if (aspectRatio === 1.0) {
              metadata.projection = 'cubemap';
            } else if (aspectRatio === 1.5) {
              metadata.projection = 'fisheye';
            }

            // Detect stereo layout
            if (type === '360_video' && videoStream.width >= 3840) {
              metadata.stereoLayout = 'side_by_side';
            }

            metadata.fieldOfView = {
              horizontal: 360,
              vertical: type.includes('360') ? 180 : 120
            };
          }

          resolve(metadata);
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  private async createProcessingJobs(content: VRContent): Promise<void> {
    const jobs: Omit<VRRenderingJob, 'id'>[] = [];

    // Create jobs for each quality profile
    for (const profile of content.qualityProfiles) {
      jobs.push({
        contentId: content.id,
        type: 'encode',
        qualityProfile: profile.id,
        parameters: {
          outputFormat: 'mp4',
          projection: content.metadata.projection,
          resolution: profile.resolution,
          fps: profile.fps,
          bitrate: profile.bitrate
        },
        status: 'pending',
        progress: 0
      });
    }

    // Add stereo conversion job if needed
    if (content.metadata.stereoLayout === 'mono' && content.type === '360_video') {
      jobs.push({
        contentId: content.id,
        type: 'stereo_generate',
        parameters: {
          outputFormat: 'mp4',
          stereoMode: 'stereo_sbs'
        },
        status: 'pending',
        progress: 0
      });
    }

    // Add cubemap conversion job for 360 content
    if (content.metadata.projection === 'equirectangular') {
      jobs.push({
        contentId: content.id,
        type: 'cubemap',
        parameters: {
          outputFormat: 'mp4',
          projection: 'cubemap'
        },
        status: 'pending',
        progress: 0
      });
    }

    // Add spatial audio processing if applicable
    if (content.metadata.spatialAudioChannels && content.metadata.spatialAudioChannels > 2) {
      jobs.push({
        contentId: content.id,
        type: 'spatialize',
        parameters: {
          audioChannels: content.metadata.spatialAudioChannels,
          spatialAudioFormat: 'ambisonic'
        },
        status: 'pending',
        progress: 0
      });
    }

    // Add jobs to queue
    for (const jobData of jobs) {
      const job: VRRenderingJob = {
        ...jobData,
        id: randomUUID()
      };
      this.renderingJobs.set(job.id, job);
      this.processingQueue.push(job);
    }

    // Sort queue by priority (quality profiles first, then special conversions)
    this.processingQueue.sort((a, b) => {
      const priorityA = a.qualityProfile ? 10 : 5;
      const priorityB = b.qualityProfile ? 10 : 5;
      return priorityB - priorityA;
    });
  }

  private async processNextJob(): Promise<void> {
    if (this.activeProcesses.size >= this.maxConcurrentJobs) return;
    if (this.processingQueue.length === 0) return;

    const job = this.processingQueue.shift()!;
    
    job.status = 'processing';
    job.startTime = new Date();
    this.emit('vrJobStarted', job);

    try {
      await this.executeRenderingJob(job);
      job.status = 'completed';
      job.endTime = new Date();
      job.actualDuration = job.endTime.getTime() - job.startTime!.getTime();
      this.emit('vrJobCompleted', job);
    } catch (error) {
      job.status = 'failed';
      job.error = error instanceof Error ? error.message : 'Unknown error';
      job.endTime = new Date();
      this.emit('vrJobFailed', job);
    }
  }

  private async executeRenderingJob(job: VRRenderingJob): Promise<void> {
    const content = this.vrContent.get(job.contentId);
    if (!content) throw new Error('VR content not found');

    switch (job.type) {
      case 'encode':
        await this.encodeVRContent(job, content);
        break;
      case 'stereo_generate':
        await this.generateStereoVersion(job, content);
        break;
      case 'cubemap':
        await this.convertToCubemap(job, content);
        break;
      case 'spatialize':
        await this.processSpatialAudio(job, content);
        break;
      default:
        throw new Error(`Unknown job type: ${job.type}`);
    }
  }

  private async encodeVRContent(job: VRRenderingJob, content: VRContent): Promise<void> {
    const profile = content.qualityProfiles.find(p => p.id === job.qualityProfile);
    if (!profile) throw new Error('Quality profile not found');

    const outputPath = join(
      process.cwd(), 
      'media', 
      'vr/content/processed',
      `${content.id}_${profile.id}.mp4`
    );

    const command = [
      '-i', content.originalPath,
      '-c:v', 'libx264',
      '-preset', 'medium',
      '-crf', '18',
      '-vf', `scale=${profile.resolution.width}:${profile.resolution.height}`,
      '-r', profile.fps.toString(),
      '-b:v', profile.bitrate,
      '-c:a', 'aac',
      '-b:a', '192k',
      '-ar', '48000',
      '-movflags', '+faststart',
      '-metadata', `title=${content.title}`,
      '-metadata', `description=VR Content - ${profile.name}`,
      '-y', outputPath
    ];

    await new Promise<void>((resolve, reject) => {
      const process = spawn('ffmpeg', command);
      this.activeProcesses.set(job.id, process);

      let progressData = '';

      process.stderr?.on('data', (data) => {
        progressData += data.toString();
        
        // Parse progress
        const timeMatch = progressData.match(/time=(\d{2}):(\d{2}):(\d{2}\.\d{2})/);
        if (timeMatch && content.metadata.duration) {
          const [, hours, minutes, seconds] = timeMatch;
          const currentTime = parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseFloat(seconds);
          job.progress = Math.min(100, Math.round((currentTime / content.metadata.duration) * 100));
        }
      });

      process.on('close', (code) => {
        this.activeProcesses.delete(job.id);
        
        if (code === 0) {
          job.outputPath = outputPath;
          content.processedPaths[profile.id] = outputPath;
          content.updatedAt = new Date();
          resolve();
        } else {
          reject(new Error(`FFmpeg encoding failed with code ${code}`));
        }
      });

      process.on('error', (error) => {
        this.activeProcesses.delete(job.id);
        reject(error);
      });
    });
  }

  private async generateStereoVersion(job: VRRenderingJob, content: VRContent): Promise<void> {
    const outputPath = join(
      process.cwd(),
      'media',
      'vr/content/stereo',
      `${content.id}_stereo_sbs.mp4`
    );

    // Use AI-based stereo generation (simulated)
    const command = [
      '-i', content.originalPath,
      '-vf', 'scale=3840:2160,split[left][right];[left]crop=1920:2160:0:0[left_crop];[right]crop=1920:2160:0:0,hflip[right_flip];[left_crop][right_flip]hstack=inputs=2',
      '-c:v', 'libx264',
      '-preset', 'slow',
      '-crf', '18',
      '-c:a', 'copy',
      '-y', outputPath
    ];

    await new Promise<void>((resolve, reject) => {
      const process = spawn('ffmpeg', command);
      this.activeProcesses.set(job.id, process);

      process.on('close', (code) => {
        this.activeProcesses.delete(job.id);
        
        if (code === 0) {
          job.outputPath = outputPath;
          content.processedPaths.stereo = outputPath;
          content.metadata.stereoLayout = 'side_by_side';
          content.updatedAt = new Date();
          resolve();
        } else {
          reject(new Error(`Stereo generation failed with code ${code}`));
        }
      });

      process.on('error', (error) => {
        this.activeProcesses.delete(job.id);
        reject(error);
      });
    });
  }

  private async convertToCubemap(job: VRRenderingJob, content: VRContent): Promise<void> {
    const outputPath = join(
      process.cwd(),
      'media',
      'vr/content/cubemaps',
      `${content.id}_cubemap.mp4`
    );

    // Convert equirectangular to cubemap
    const command = [
      '-i', content.originalPath,
      '-vf', 'v360=e:c:in_stereo=mono:out_stereo=mono',
      '-c:v', 'libx264',
      '-preset', 'medium',
      '-crf', '20',
      '-c:a', 'copy',
      '-y', outputPath
    ];

    await new Promise<void>((resolve, reject) => {
      const process = spawn('ffmpeg', command);
      this.activeProcesses.set(job.id, process);

      process.on('close', (code) => {
        this.activeProcesses.delete(job.id);
        
        if (code === 0) {
          job.outputPath = outputPath;
          content.processedPaths.cubemap = outputPath;
          content.updatedAt = new Date();
          resolve();
        } else {
          reject(new Error(`Cubemap conversion failed with code ${code}`));
        }
      });

      process.on('error', (error) => {
        this.activeProcesses.delete(job.id);
        reject(error);
      });
    });
  }

  private async processSpatialAudio(job: VRRenderingJob, content: VRContent): Promise<void> {
    const outputPath = join(
      process.cwd(),
      'media',
      'vr/content/spatial_audio',
      `${content.id}_spatial.wav`
    );

    // Process spatial audio with ambisonic encoding
    const command = [
      '-i', content.originalPath,
      '-vn', // No video
      '-c:a', 'pcm_f32le',
      '-ac', '4', // 4-channel ambisonic
      '-ar', '48000',
      '-af', 'pan=4c|c0=c0|c1=c1|c2=c2|c3=c3', // Map to ambisonic channels
      '-y', outputPath
    ];

    await new Promise<void>((resolve, reject) => {
      const process = spawn('ffmpeg', command);
      this.activeProcesses.set(job.id, process);

      process.on('close', (code) => {
        this.activeProcesses.delete(job.id);
        
        if (code === 0) {
          job.outputPath = outputPath;
          content.processedPaths.spatialAudio = outputPath;
          content.immersiveFeatures.spatialAudio = true;
          content.updatedAt = new Date();
          resolve();
        } else {
          reject(new Error(`Spatial audio processing failed with code ${code}`));
        }
      });

      process.on('error', (error) => {
        this.activeProcesses.delete(job.id);
        reject(error);
      });
    });
  }

  async createVRExperience(experienceData: {
    name: string;
    description: string;
    type: VRExperience['type'];
    contentIds: string[];
    userId: string;
    settings?: Partial<VRExperience['settings']>;
  }): Promise<string> {
    const experienceId = randomUUID();

    const experience: VRExperience = {
      id: experienceId,
      name: experienceData.name,
      description: experienceData.description,
      type: experienceData.type,
      contentIds: experienceData.contentIds,
      scenes: [],
      settings: {
        locomotion: 'teleport',
        comfort: 'comfortable',
        ageRating: 'Everyone',
        duration: 600, // 10 minutes default
        maxUsers: 1,
        requiresControllers: false,
        supportsMixedReality: false,
        ...experienceData.settings
      },
      analytics: {
        totalViews: 0,
        averageSessionDuration: 0,
        completionRate: 0,
        dropoffPoints: [],
        userRatings: { average: 0, count: 0 },
        heatmaps: []
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      isPublished: false,
      userId: experienceData.userId
    };

    // Generate scenes from content
    for (let i = 0; i < experienceData.contentIds.length; i++) {
      const contentId = experienceData.contentIds[i];
      const content = this.vrContent.get(contentId);
      
      if (content) {
        experience.scenes.push({
          id: randomUUID(),
          name: content.title,
          contentId,
          duration: content.metadata.duration,
          transitions: i < experienceData.contentIds.length - 1 ? [{
            targetSceneId: `scene_${i + 1}`,
            trigger: 'time',
            conditions: { duration: content.metadata.duration }
          }] : [],
          interactiveElements: []
        });
      }
    }

    this.vrExperiences.set(experienceId, experience);
    this.emit('vrExperienceCreated', experience);

    return experienceId;
  }

  async createAROverlay(overlayData: {
    name: string;
    type: AROverlay['type'];
    contentPath: string;
    trackingType: AROverlay['trackingData']['type'];
    userId: string;
    transform?: Partial<AROverlay['transform']>;
    interactivity?: Partial<AROverlay['interactivity']>;
  }): Promise<string> {
    const overlayId = randomUUID();

    const overlay: AROverlay = {
      id: overlayId,
      name: overlayData.name,
      type: overlayData.type,
      contentPath: overlayData.contentPath,
      trackingData: {
        type: overlayData.trackingType,
        trackingStrength: 85,
        occlusionHandling: true,
        lightEstimation: true
      },
      transform: {
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0, w: 1 },
        scale: { x: 1, y: 1, z: 1 },
        ...overlayData.transform
      },
      animation: {
        enabled: false,
        type: 'loop',
        duration: 1000,
        easing: 'ease-in-out'
      },
      interactivity: {
        enabled: true,
        gestures: ['tap', 'pinch', 'swipe'],
        voiceCommands: [],
        touchActions: ['select', 'move'],
        ...overlayData.interactivity
      },
      visibility: {
        distance: { min: 0.5, max: 10 },
        angle: { min: -45, max: 45 },
        lighting: { min: 0.1, max: 1.0 }
      },
      performance: {
        maxPolygons: 10000,
        textureResolution: { width: 1024, height: 1024 },
        renderPriority: 5,
        levelOfDetail: true
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: overlayData.userId,
      isActive: true
    };

    this.arOverlays.set(overlayId, overlay);
    this.emit('arOverlayCreated', overlay);

    return overlayId;
  }

  // Public API methods
  getVRContent(contentId: string): VRContent | undefined {
    return this.vrContent.get(contentId);
  }

  getAllVRContent(): VRContent[] {
    return Array.from(this.vrContent.values());
  }

  getVRExperience(experienceId: string): VRExperience | undefined {
    return this.vrExperiences.get(experienceId);
  }

  getAllVRExperiences(): VRExperience[] {
    return Array.from(this.vrExperiences.values());
  }

  getAROverlay(overlayId: string): AROverlay | undefined {
    return this.arOverlays.get(overlayId);
  }

  getAllAROverlays(): AROverlay[] {
    return Array.from(this.arOverlays.values());
  }

  getRenderingJob(jobId: string): VRRenderingJob | undefined {
    return this.renderingJobs.get(jobId);
  }

  getActiveJobs(): VRRenderingJob[] {
    return Array.from(this.renderingJobs.values())
      .filter(job => job.status === 'processing');
  }

  async cancelJob(jobId: string): Promise<boolean> {
    const process = this.activeProcesses.get(jobId);
    const job = this.renderingJobs.get(jobId);
    
    if (process && job) {
      process.kill('SIGTERM');
      job.status = 'cancelled';
      this.activeProcesses.delete(jobId);
      this.emit('vrJobCancelled', job);
      return true;
    }
    
    return false;
  }

  getStats() {
    const content = Array.from(this.vrContent.values());
    const jobs = Array.from(this.renderingJobs.values());
    const experiences = Array.from(this.vrExperiences.values());
    const overlays = Array.from(this.arOverlays.values());

    return {
      content: {
        total: content.length,
        by_type: {
          '360_video': content.filter(c => c.type === '360_video').length,
          '360_image': content.filter(c => c.type === '360_image').length,
          vr_experience: content.filter(c => c.type === 'vr_experience').length,
          ar_overlay: content.filter(c => c.type === 'ar_overlay').length,
          volumetric: content.filter(c => c.type === 'volumetric').length,
          hologram: content.filter(c => c.type === 'hologram').length
        },
        ready: content.filter(c => c.status === 'ready').length,
        processing: content.filter(c => c.status === 'processing').length
      },
      jobs: {
        total: jobs.length,
        active: jobs.filter(j => j.status === 'processing').length,
        completed: jobs.filter(j => j.status === 'completed').length,
        failed: jobs.filter(j => j.status === 'failed').length,
        queue_length: this.processingQueue.length
      },
      experiences: {
        total: experiences.length,
        published: experiences.filter(e => e.isPublished).length,
        by_type: {
          guided_tour: experiences.filter(e => e.type === 'guided_tour').length,
          interactive_story: experiences.filter(e => e.type === 'interactive_story').length,
          social_space: experiences.filter(e => e.type === 'social_space').length,
          game: experiences.filter(e => e.type === 'game').length,
          training: experiences.filter(e => e.type === 'training').length,
          concert: experiences.filter(e => e.type === 'concert').length
        }
      },
      ar_overlays: {
        total: overlays.length,
        active: overlays.filter(o => o.isActive).length,
        by_type: {
          info_card: overlays.filter(o => o.type === 'info_card').length,
          '3d_model': overlays.filter(o => o.type === '3d_model').length,
          video_overlay: overlays.filter(o => o.type === 'video_overlay').length,
          hologram: overlays.filter(o => o.type === 'hologram').length
        }
      },
      performance: {
        active_processes: this.activeProcesses.size,
        max_concurrent: this.maxConcurrentJobs,
        average_processing_time: jobs.filter(j => j.actualDuration).length > 0
          ? Math.round(jobs.filter(j => j.actualDuration).reduce((sum, j) => sum + j.actualDuration!, 0) / jobs.filter(j => j.actualDuration).length / 1000)
          : 0
      }
    };
  }
}

// Singleton instance
export const vrRenderingEngine = new VRRenderingEngine();