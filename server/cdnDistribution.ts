import { EventEmitter } from "events";
import { promises as fs } from "fs";
import { join, extname, basename } from "path";
import { createHash } from "crypto";
import { spawn } from "child_process";
import { randomUUID } from "crypto";

export interface CDNNode {
  id: string;
  name: string;
  location: {
    country: string;
    city: string;
    region: string;
    coordinates: { lat: number; lng: number };
  };
  endpoint: string;
  status: "active" | "inactive" | "maintenance" | "overloaded";
  capacity: {
    storage: number; // GB
    bandwidth: number; // Mbps
    connections: number;
  };
  usage: {
    storage: number;
    bandwidth: number;
    connections: number;
  };
  performance: {
    latency: number; // ms
    uptime: number; // percentage
    errorRate: number; // percentage
    throughput: number; // Mbps
  };
  priority: number; // 1-10, higher = preferred
  costPerGB: number;
  supportedMimeTypes: string[];
  features: string[];
}

export interface CDNAsset {
  id: string;
  originalPath: string;
  filename: string;
  size: number;
  mimeType: string;
  checksum: string;
  createdAt: Date;
  lastAccessed: Date;
  accessCount: number;
  hotness: number; // 0-100, higher = more frequently accessed
  tags: string[];
  metadata: {
    width?: number;
    height?: number;
    duration?: number;
    bitrate?: number;
    format?: string;
    quality?: string;
  };
  variants: Array<{
    id: string;
    type: "thumbnail" | "preview" | "optimized" | "compressed" | "transcoded";
    path: string;
    size: number;
    quality: string;
    parameters: Record<string, any>;
  }>;
  distribution: {
    nodes: string[];
    replicationCount: number;
    primaryNode: string;
    lastSync: Date;
    syncStatus: "pending" | "syncing" | "completed" | "failed";
  };
  caching: {
    ttl: number; // seconds
    headers: Record<string, string>;
    compression: "none" | "gzip" | "brotli";
    isPublic: boolean;
  };
}

export interface CDNRequest {
  id: string;
  assetId: string;
  nodeId: string;
  clientIP: string;
  userAgent: string;
  referer?: string;
  timestamp: Date;
  responseTime: number;
  status: number;
  bytesTransferred: number;
  hitType: "hit" | "miss" | "refresh";
  geoLocation: {
    country: string;
    city: string;
    region: string;
  };
}

export interface CacheRule {
  id: string;
  name: string;
  pattern: string; // regex or glob pattern
  ttl: number;
  conditions: Array<{
    type: "mimeType" | "fileExtension" | "size" | "path";
    operator:
      | "equals"
      | "contains"
      | "startsWith"
      | "endsWith"
      | "regex"
      | "gt"
      | "lt";
    value: string | number;
  }>;
  headers: Record<string, string>;
  compression: "auto" | "gzip" | "brotli" | "none";
  priority: number;
  isActive: boolean;
}

export interface BandwidthLimits {
  nodeId: string;
  globalLimit: number; // Mbps
  perClientLimit: number; // Kbps
  perAssetLimit: number; // Kbps
  burstLimit: number; // Mbps for short periods
  priorityLevels: {
    premium: number; // multiplier
    standard: number; // multiplier
    basic: number; // multiplier
  };
}

export class CDNDistribution extends EventEmitter {
  private nodes = new Map<string, CDNNode>();
  private assets = new Map<string, CDNAsset>();
  private requests = new Map<string, CDNRequest>();
  private cacheRules: CacheRule[] = [];
  private bandwidthLimits = new Map<string, BandwidthLimits>();
  private activeConnections = new Map<string, number>();

  constructor() {
    super();
    this.setupDefaultNodes();
    this.setupDefaultCacheRules();
    this.startBackgroundJobs();
  }

  private setupDefaultNodes() {
    const defaultNodes: CDNNode[] = [
      {
        id: "us-east-1",
        name: "US East (Virginia)",
        location: {
          country: "US",
          city: "Ashburn",
          region: "Virginia",
          coordinates: { lat: 39.0458, lng: -77.5089 },
        },
        endpoint: "https://cdn-us-east-1.fanzunlimited.com",
        status: "active",
        capacity: { storage: 10000, bandwidth: 10000, connections: 100000 },
        usage: { storage: 2500, bandwidth: 3500, connections: 15000 },
        performance: {
          latency: 45,
          uptime: 99.9,
          errorRate: 0.01,
          throughput: 8500,
        },
        priority: 9,
        costPerGB: 0.05,
        supportedMimeTypes: ["*/*"],
        features: ["compression", "streaming", "ssl", "ipv6"],
      },
      {
        id: "us-west-1",
        name: "US West (California)",
        location: {
          country: "US",
          city: "San Francisco",
          region: "California",
          coordinates: { lat: 37.7749, lng: -122.4194 },
        },
        endpoint: "https://cdn-us-west-1.fanzunlimited.com",
        status: "active",
        capacity: { storage: 8000, bandwidth: 8000, connections: 80000 },
        usage: { storage: 3200, bandwidth: 4100, connections: 22000 },
        performance: {
          latency: 42,
          uptime: 99.8,
          errorRate: 0.02,
          throughput: 7200,
        },
        priority: 8,
        costPerGB: 0.06,
        supportedMimeTypes: ["*/*"],
        features: ["compression", "streaming", "ssl", "ipv6"],
      },
      {
        id: "eu-west-1",
        name: "Europe West (London)",
        location: {
          country: "GB",
          city: "London",
          region: "England",
          coordinates: { lat: 51.5074, lng: -0.1278 },
        },
        endpoint: "https://cdn-eu-west-1.fanzunlimited.com",
        status: "active",
        capacity: { storage: 6000, bandwidth: 6000, connections: 60000 },
        usage: { storage: 1800, bandwidth: 2100, connections: 12000 },
        performance: {
          latency: 38,
          uptime: 99.7,
          errorRate: 0.03,
          throughput: 5400,
        },
        priority: 7,
        costPerGB: 0.07,
        supportedMimeTypes: ["*/*"],
        features: ["compression", "streaming", "ssl", "ipv6"],
      },
      {
        id: "asia-southeast-1",
        name: "Asia Pacific (Singapore)",
        location: {
          country: "SG",
          city: "Singapore",
          region: "Singapore",
          coordinates: { lat: 1.3521, lng: 103.8198 },
        },
        endpoint: "https://cdn-asia-southeast-1.fanzunlimited.com",
        status: "active",
        capacity: { storage: 5000, bandwidth: 5000, connections: 50000 },
        usage: { storage: 1200, bandwidth: 1800, connections: 8500 },
        performance: {
          latency: 65,
          uptime: 99.6,
          errorRate: 0.04,
          throughput: 4200,
        },
        priority: 6,
        costPerGB: 0.08,
        supportedMimeTypes: ["*/*"],
        features: ["compression", "streaming", "ssl"],
      },
      {
        id: "edge-mobile-1",
        name: "Mobile Edge (Global)",
        location: {
          country: "GLOBAL",
          city: "Distributed",
          region: "Global",
          coordinates: { lat: 0, lng: 0 },
        },
        endpoint: "https://cdn-mobile.fanzunlimited.com",
        status: "active",
        capacity: { storage: 2000, bandwidth: 15000, connections: 200000 },
        usage: { storage: 800, bandwidth: 8500, connections: 45000 },
        performance: {
          latency: 25,
          uptime: 99.9,
          errorRate: 0.01,
          throughput: 12000,
        },
        priority: 10,
        costPerGB: 0.12,
        supportedMimeTypes: [
          "image/*",
          "video/*",
          "application/javascript",
          "text/css",
        ],
        features: [
          "compression",
          "mobile-optimization",
          "ssl",
          "ipv6",
          "http3",
        ],
      },
    ];

    for (const node of defaultNodes) {
      this.nodes.set(node.id, node);
    }
  }

  private setupDefaultCacheRules() {
    this.cacheRules = [
      {
        id: "images-long-cache",
        name: "Images Long Cache",
        pattern: "\\.(jpg|jpeg|png|gif|webp|avif)$",
        ttl: 86400 * 7, // 1 week
        conditions: [
          { type: "mimeType", operator: "startsWith", value: "image/" },
        ],
        headers: {
          "Cache-Control": "public, max-age=604800, immutable",
          Vary: "Accept-Encoding",
        },
        compression: "auto",
        priority: 10,
        isActive: true,
      },
      {
        id: "videos-medium-cache",
        name: "Videos Medium Cache",
        pattern: "\\.(mp4|webm|mkv|avi)$",
        ttl: 86400 * 3, // 3 days
        conditions: [
          { type: "mimeType", operator: "startsWith", value: "video/" },
        ],
        headers: {
          "Cache-Control": "public, max-age=259200",
          "Accept-Ranges": "bytes",
        },
        compression: "none",
        priority: 9,
        isActive: true,
      },
      {
        id: "assets-medium-cache",
        name: "Static Assets Medium Cache",
        pattern: "\\.(css|js|woff2|woff|ttf)$",
        ttl: 86400, // 1 day
        conditions: [
          { type: "fileExtension", operator: "equals", value: "css" },
          { type: "fileExtension", operator: "equals", value: "js" },
        ],
        headers: {
          "Cache-Control": "public, max-age=86400",
          Vary: "Accept-Encoding",
        },
        compression: "gzip",
        priority: 8,
        isActive: true,
      },
      {
        id: "api-no-cache",
        name: "API No Cache",
        pattern: "^/api/",
        ttl: 0,
        conditions: [{ type: "path", operator: "startsWith", value: "/api/" }],
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
        compression: "gzip",
        priority: 20,
        isActive: true,
      },
      {
        id: "thumbnails-cache",
        name: "Thumbnails Cache",
        pattern: "/thumbnails/",
        ttl: 86400 * 14, // 2 weeks
        conditions: [
          { type: "path", operator: "contains", value: "/thumbnails/" },
        ],
        headers: {
          "Cache-Control": "public, max-age=1209600, immutable",
        },
        compression: "auto",
        priority: 9,
        isActive: true,
      },
    ];
  }

  private startBackgroundJobs() {
    // Update node performance metrics every 30 seconds
    setInterval(() => {
      this.updateNodeMetrics();
    }, 30000);

    // Cleanup old requests every hour
    setInterval(() => {
      this.cleanupOldRequests();
    }, 3600000);

    // Optimize asset distribution every 10 minutes
    setInterval(() => {
      this.optimizeDistribution();
    }, 600000);

    // Update asset hotness scores every 5 minutes
    setInterval(() => {
      this.updateAssetHotness();
    }, 300000);

    // Sync assets between nodes every hour
    setInterval(() => {
      this.syncAssets();
    }, 3600000);
  }

  async addAsset(
    filepath: string,
    options: {
      tags?: string[];
      ttl?: number;
      isPublic?: boolean;
      generateVariants?: boolean;
      replicationCount?: number;
      preferredNodes?: string[];
    } = {},
  ): Promise<string> {
    const assetId = randomUUID();
    const filename = basename(filepath);
    const stats = await fs.stat(filepath);
    const buffer = await fs.readFile(filepath);

    // Calculate checksum
    const checksum = createHash("sha256").update(buffer).digest("hex");

    // Check for duplicates
    const existingAsset = Array.from(this.assets.values()).find(
      (asset) => asset.checksum === checksum,
    );

    if (existingAsset) {
      console.log(`Asset already exists: ${existingAsset.id}`);
      return existingAsset.id;
    }

    const mimeType = this.getMimeType(extname(filename));
    const metadata = await this.extractAssetMetadata(filepath, mimeType);

    const asset: CDNAsset = {
      id: assetId,
      originalPath: filepath,
      filename,
      size: stats.size,
      mimeType,
      checksum,
      createdAt: new Date(),
      lastAccessed: new Date(),
      accessCount: 0,
      hotness: 0,
      tags: options.tags || [],
      metadata,
      variants: [],
      distribution: {
        nodes: [],
        replicationCount: options.replicationCount || 3,
        primaryNode: "",
        lastSync: new Date(),
        syncStatus: "pending",
      },
      caching: {
        ttl: options.ttl || this.getCacheTTL(filename),
        headers: this.getCacheHeaders(filename),
        compression: this.getCompressionType(mimeType),
        isPublic: options.isPublic ?? true,
      },
    };

    this.assets.set(assetId, asset);

    // Select optimal nodes for distribution
    const selectedNodes = this.selectOptimalNodes(
      asset,
      options.preferredNodes,
    );
    asset.distribution.nodes = selectedNodes;
    asset.distribution.primaryNode = selectedNodes[0];

    // Generate variants if requested
    if (options.generateVariants) {
      await this.generateAssetVariants(asset);
    }

    // Start asset distribution
    await this.distributeAsset(asset);

    this.emit("assetAdded", asset);
    return assetId;
  }

  private async extractAssetMetadata(
    filepath: string,
    mimeType: string,
  ): Promise<CDNAsset["metadata"]> {
    const metadata: CDNAsset["metadata"] = {};

    if (mimeType.startsWith("image/")) {
      // Extract image metadata
      return new Promise((resolve) => {
        const process = spawn("ffprobe", [
          "-v",
          "quiet",
          "-print_format",
          "json",
          "-show_format",
          "-show_streams",
          filepath,
        ]);

        let output = "";
        process.stdout.on("data", (data) => (output += data));

        process.on("close", (code) => {
          if (code === 0) {
            try {
              const data = JSON.parse(output);
              const stream = data.streams?.[0];
              if (stream) {
                metadata.width = stream.width;
                metadata.height = stream.height;
                metadata.format = stream.codec_name;
              }
            } catch (error) {
              console.error("Failed to parse image metadata:", error);
            }
          }
          resolve(metadata);
        });
      });
    } else if (mimeType.startsWith("video/")) {
      // Extract video metadata
      return new Promise((resolve) => {
        const process = spawn("ffprobe", [
          "-v",
          "quiet",
          "-print_format",
          "json",
          "-show_format",
          "-show_streams",
          filepath,
        ]);

        let output = "";
        process.stdout.on("data", (data) => (output += data));

        process.on("close", (code) => {
          if (code === 0) {
            try {
              const data = JSON.parse(output);
              const videoStream = data.streams?.find(
                (s: any) => s.codec_type === "video",
              );
              const format = data.format;

              if (videoStream) {
                metadata.width = videoStream.width;
                metadata.height = videoStream.height;
                metadata.duration = parseFloat(format.duration);
                metadata.bitrate = parseInt(format.bit_rate);
                metadata.format = videoStream.codec_name;
              }
            } catch (error) {
              console.error("Failed to parse video metadata:", error);
            }
          }
          resolve(metadata);
        });
      });
    }

    return metadata;
  }

  private async generateAssetVariants(asset: CDNAsset): Promise<void> {
    const variants: CDNAsset["variants"] = [];

    if (asset.mimeType.startsWith("image/")) {
      // Generate image variants
      const sizes = [
        { name: "thumbnail", width: 150, height: 150, quality: 80 },
        { name: "small", width: 300, height: 300, quality: 85 },
        { name: "medium", width: 600, height: 600, quality: 90 },
        {
          name: "webp",
          width: asset.metadata.width,
          height: asset.metadata.height,
          quality: 85,
          format: "webp",
        },
        {
          name: "avif",
          width: asset.metadata.width,
          height: asset.metadata.height,
          quality: 80,
          format: "avif",
        },
      ];

      for (const size of sizes) {
        try {
          const variantPath = join(
            process.cwd(),
            "media",
            "variants",
            `${asset.id}_${size.name}.${size.format || "jpg"}`,
          );

          const command = [
            "-i",
            asset.originalPath,
            "-vf",
            `scale=${size.width}:${size.height}:force_original_aspect_ratio=decrease`,
            "-q:v",
            size.quality.toString(),
            "-y",
            variantPath,
          ];

          if (size.format) {
            command.splice(-2, 0, "-f", size.format);
          }

          await new Promise<void>((resolve, reject) => {
            const process = spawn("ffmpeg", command);
            process.on("close", (code) => {
              if (code === 0) {
                resolve();
              } else {
                reject(new Error(`Variant generation failed for ${size.name}`));
              }
            });
          });

          const stats = await fs.stat(variantPath);
          variants.push({
            id: randomUUID(),
            type: size.name === "thumbnail" ? "thumbnail" : "optimized",
            path: variantPath,
            size: stats.size,
            quality: size.quality.toString(),
            parameters: size,
          });
        } catch (error) {
          console.error(`Failed to generate ${size.name} variant:`, error);
        }
      }
    } else if (asset.mimeType.startsWith("video/")) {
      // Generate video variants
      const qualities = [
        { name: "720p", height: 720, bitrate: "2500k", quality: "medium" },
        { name: "480p", height: 480, bitrate: "1200k", quality: "low" },
        { name: "1080p", height: 1080, bitrate: "5000k", quality: "high" },
      ];

      // Generate thumbnail from video
      try {
        const thumbnailPath = join(
          process.cwd(),
          "media",
          "variants",
          `${asset.id}_thumbnail.jpg`,
        );
        const duration = asset.metadata.duration || 10;
        const seekTime = duration * 0.1; // 10% into video

        await new Promise<void>((resolve, reject) => {
          const process = spawn("ffmpeg", [
            "-i",
            asset.originalPath,
            "-ss",
            seekTime.toString(),
            "-vframes",
            "1",
            "-vf",
            "scale=320:240:force_original_aspect_ratio=decrease",
            "-y",
            thumbnailPath,
          ]);

          process.on("close", (code) => {
            if (code === 0) resolve();
            else reject(new Error("Thumbnail generation failed"));
          });
        });

        const stats = await fs.stat(thumbnailPath);
        variants.push({
          id: randomUUID(),
          type: "thumbnail",
          path: thumbnailPath,
          size: stats.size,
          quality: "thumbnail",
          parameters: { width: 320, height: 240 },
        });
      } catch (error) {
        console.error("Failed to generate video thumbnail:", error);
      }

      // Generate quality variants
      for (const quality of qualities) {
        if (asset.metadata.height && asset.metadata.height < quality.height)
          continue;

        try {
          const variantPath = join(
            process.cwd(),
            "media",
            "variants",
            `${asset.id}_${quality.name}.mp4`,
          );

          await new Promise<void>((resolve, reject) => {
            const process = spawn("ffmpeg", [
              "-i",
              asset.originalPath,
              "-vf",
              `scale=-2:${quality.height}`,
              "-b:v",
              quality.bitrate,
              "-c:v",
              "libx264",
              "-preset",
              "medium",
              "-c:a",
              "aac",
              "-b:a",
              "128k",
              "-movflags",
              "+faststart",
              "-y",
              variantPath,
            ]);

            process.on("close", (code) => {
              if (code === 0) resolve();
              else reject(new Error(`${quality.name} generation failed`));
            });
          });

          const stats = await fs.stat(variantPath);
          variants.push({
            id: randomUUID(),
            type: "transcoded",
            path: variantPath,
            size: stats.size,
            quality: quality.quality,
            parameters: quality,
          });
        } catch (error) {
          console.error(`Failed to generate ${quality.name} variant:`, error);
        }
      }
    }

    asset.variants = variants;
    this.emit("assetVariantsGenerated", asset, variants);
  }

  private selectOptimalNodes(
    asset: CDNAsset,
    preferredNodes?: string[],
  ): string[] {
    let availableNodes = Array.from(this.nodes.values())
      .filter((node) => node.status === "active")
      .filter((node) => this.supportsAsset(node, asset));

    if (preferredNodes && preferredNodes.length > 0) {
      const preferred = availableNodes.filter((node) =>
        preferredNodes.includes(node.id),
      );
      const others = availableNodes.filter(
        (node) => !preferredNodes.includes(node.id),
      );
      availableNodes = [...preferred, ...others];
    }

    // Sort by priority, performance, and capacity
    availableNodes.sort((a, b) => {
      const scoreA = this.calculateNodeScore(a);
      const scoreB = this.calculateNodeScore(b);
      return scoreB - scoreA;
    });

    return availableNodes
      .slice(0, asset.distribution.replicationCount)
      .map((node) => node.id);
  }

  private calculateNodeScore(node: CDNNode): number {
    const capacityScore = (1 - node.usage.storage / node.capacity.storage) * 30;
    const performanceScore = (node.performance.uptime / 100) * 25;
    const latencyScore = Math.max(0, 100 - node.performance.latency) * 0.2;
    const priorityScore = node.priority * 5;
    const costScore = Math.max(0, 10 - node.costPerGB * 10) * 5;

    return (
      capacityScore +
      performanceScore +
      latencyScore +
      priorityScore +
      costScore
    );
  }

  private supportsAsset(node: CDNNode, asset: CDNAsset): boolean {
    if (node.supportedMimeTypes.includes("*/*")) return true;

    return node.supportedMimeTypes.some((type) => {
      if (type.endsWith("/*")) {
        return asset.mimeType.startsWith(type.slice(0, -1));
      }
      return asset.mimeType === type;
    });
  }

  private async distributeAsset(asset: CDNAsset): Promise<void> {
    asset.distribution.syncStatus = "syncing";

    for (const nodeId of asset.distribution.nodes) {
      try {
        await this.uploadAssetToNode(asset, nodeId);
      } catch (error) {
        console.error(
          `Failed to upload asset ${asset.id} to node ${nodeId}:`,
          error,
        );
      }
    }

    asset.distribution.syncStatus = "completed";
    asset.distribution.lastSync = new Date();
    this.emit("assetDistributed", asset);
  }

  private async uploadAssetToNode(
    asset: CDNAsset,
    nodeId: string,
  ): Promise<void> {
    const node = this.nodes.get(nodeId);
    if (!node) return;

    // Simulate asset upload
    return new Promise((resolve) => {
      const uploadTime = (asset.size / (10 * 1024 * 1024)) * 1000; // 10MB/s simulation
      setTimeout(
        () => {
          node.usage.storage += asset.size / (1024 * 1024 * 1024); // Convert to GB
          resolve();
        },
        Math.max(1000, uploadTime),
      );
    });
  }

  async getAssetURL(
    assetId: string,
    clientIP?: string,
    quality?: string,
  ): Promise<string> {
    const asset = this.assets.get(assetId);
    if (!asset) {
      throw new Error("Asset not found");
    }

    // Update access tracking
    asset.lastAccessed = new Date();
    asset.accessCount++;

    // Select best node based on client location and node performance
    const bestNode = this.selectBestNodeForClient(asset, clientIP);
    if (!bestNode) {
      throw new Error("No available nodes for asset");
    }

    // Handle quality variants
    let filename = asset.filename;
    if (quality && quality !== "original") {
      const variant = asset.variants.find(
        (v) => v.quality === quality || v.type === quality,
      );
      if (variant) {
        filename = basename(variant.path);
      }
    }

    const url = `${bestNode.endpoint}/assets/${assetId}/${filename}`;

    // Log request
    this.logRequest({
      id: randomUUID(),
      assetId,
      nodeId: bestNode.id,
      clientIP: clientIP || "127.0.0.1",
      userAgent: "CDN-Internal",
      timestamp: new Date(),
      responseTime: 0,
      status: 200,
      bytesTransferred: 0,
      hitType: "hit",
      geoLocation: { country: "Unknown", city: "Unknown", region: "Unknown" },
    });

    this.emit("assetServed", asset, bestNode);
    return url;
  }

  private selectBestNodeForClient(
    asset: CDNAsset,
    clientIP?: string,
  ): CDNNode | null {
    const availableNodes = asset.distribution.nodes
      .map((nodeId) => this.nodes.get(nodeId))
      .filter(
        (node): node is CDNNode =>
          node !== undefined && node.status === "active",
      );

    if (availableNodes.length === 0) return null;

    // If we have client IP, use geo-based selection
    if (clientIP) {
      // In a real implementation, this would use GeoIP lookup
      // For now, prefer nodes with lower latency
      availableNodes.sort(
        (a, b) => a.performance.latency - b.performance.latency,
      );
    }

    // Consider current load
    availableNodes.sort((a, b) => {
      const loadA = a.usage.connections / a.capacity.connections;
      const loadB = b.usage.connections / b.capacity.connections;
      return loadA - loadB;
    });

    return availableNodes[0];
  }

  private getMimeType(ext: string): string {
    const mimeTypes: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
      ".avif": "image/avif",
      ".mp4": "video/mp4",
      ".webm": "video/webm",
      ".mov": "video/quicktime",
      ".avi": "video/x-msvideo",
      ".mp3": "audio/mpeg",
      ".wav": "audio/wav",
      ".ogg": "audio/ogg",
      ".js": "application/javascript",
      ".css": "text/css",
      ".html": "text/html",
      ".json": "application/json",
      ".pdf": "application/pdf",
      ".txt": "text/plain",
    };

    return mimeTypes[ext.toLowerCase()] || "application/octet-stream";
  }

  private getCacheTTL(filename: string): number {
    const ext = extname(filename).toLowerCase();

    // Default TTLs by file type
    const ttlMap: Record<string, number> = {
      ".jpg": 86400 * 7, // 1 week
      ".jpeg": 86400 * 7,
      ".png": 86400 * 7,
      ".gif": 86400 * 7,
      ".webp": 86400 * 7,
      ".mp4": 86400 * 3, // 3 days
      ".webm": 86400 * 3,
      ".mp3": 86400 * 7,
      ".css": 86400, // 1 day
      ".js": 86400,
      ".html": 3600, // 1 hour
      ".json": 300, // 5 minutes
    };

    return ttlMap[ext] || 3600; // Default 1 hour
  }

  private getCacheHeaders(filename: string): Record<string, string> {
    const ext = extname(filename).toLowerCase();
    const ttl = this.getCacheTTL(filename);

    const baseHeaders: Record<string, string> = {
      "Cache-Control": `public, max-age=${ttl}`,
      Vary: "Accept-Encoding",
    };

    // Add specific headers for different file types
    if ([".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext)) {
      baseHeaders["Cache-Control"] += ", immutable";
    }

    if ([".mp4", ".webm", ".mp3"].includes(ext)) {
      baseHeaders["Accept-Ranges"] = "bytes";
    }

    if ([".css", ".js", ".html"].includes(ext)) {
      baseHeaders["Content-Type"] = this.getMimeType(ext);
    }

    return baseHeaders;
  }

  private getCompressionType(
    mimeType: string,
  ): CDNAsset["caching"]["compression"] {
    if (
      mimeType.startsWith("text/") ||
      mimeType.includes("javascript") ||
      mimeType.includes("json") ||
      mimeType.includes("css")
    ) {
      return "gzip";
    }

    if (mimeType.startsWith("image/") || mimeType.startsWith("video/")) {
      return "none"; // Already compressed
    }

    return "auto";
  }

  private logRequest(request: CDNRequest): void {
    this.requests.set(request.id, request);

    // Update node connection count
    const node = this.nodes.get(request.nodeId);
    if (node) {
      node.usage.connections++;
      node.usage.bandwidth += request.bytesTransferred / (1024 * 1024); // Convert to MB
    }

    this.emit("requestLogged", request);
  }

  private updateNodeMetrics(): void {
    for (const node of this.nodes.values()) {
      // Simulate metric updates
      const baseLatency = node.performance.latency;
      node.performance.latency = baseLatency + (Math.random() - 0.5) * 10;

      const baseUptime = node.performance.uptime;
      node.performance.uptime = Math.max(
        95,
        baseUptime + (Math.random() - 0.5) * 2,
      );

      node.performance.errorRate = Math.max(0, Math.random() * 0.1);
      node.performance.throughput = Math.max(
        0,
        node.usage.bandwidth + (Math.random() - 0.5) * 1000,
      );

      // Decay connection count over time
      node.usage.connections = Math.max(0, node.usage.connections * 0.98);
    }

    this.emit("nodeMetricsUpdated");
  }

  private updateAssetHotness(): void {
    const now = new Date();

    for (const asset of this.assets.values()) {
      const hoursSinceAccess =
        (now.getTime() - asset.lastAccessed.getTime()) / (1000 * 60 * 60);
      const accessFrequency = asset.accessCount / Math.max(1, hoursSinceAccess);

      // Calculate hotness score (0-100)
      const hotnessScore = Math.min(
        100,
        Math.log10(1 + accessFrequency * 10) * 25,
      );
      asset.hotness = Math.round(hotnessScore);

      // Decay access count over time
      asset.accessCount = Math.max(0, asset.accessCount * 0.99);
    }

    this.emit("assetHotnessUpdated");
  }

  private optimizeDistribution(): void {
    // Identify hot assets that need better distribution
    const hotAssets = Array.from(this.assets.values())
      .filter((asset) => asset.hotness > 70)
      .sort((a, b) => b.hotness - a.hotness);

    for (const asset of hotAssets.slice(0, 10)) {
      // Top 10 hot assets
      const currentNodes = asset.distribution.nodes.length;
      const targetNodes = Math.min(5, Math.ceil(asset.hotness / 20));

      if (currentNodes < targetNodes) {
        // Add more nodes for hot content
        const additionalNodes = this.selectOptimalNodes(
          asset,
          asset.distribution.nodes,
        );
        const newNodes = additionalNodes
          .filter((nodeId) => !asset.distribution.nodes.includes(nodeId))
          .slice(0, targetNodes - currentNodes);

        asset.distribution.nodes.push(...newNodes);
        asset.distribution.replicationCount = asset.distribution.nodes.length;

        // Distribute to new nodes
        this.distributeAsset(asset);
      }
    }

    this.emit("distributionOptimized");
  }

  private syncAssets(): void {
    // Check for assets that need re-syncing
    const assetsToSync = Array.from(this.assets.values()).filter(
      (asset) =>
        asset.distribution.syncStatus === "failed" ||
        new Date().getTime() - asset.distribution.lastSync.getTime() > 86400000,
    );

    for (const asset of assetsToSync) {
      this.distributeAsset(asset);
    }

    this.emit("assetsSynced", assetsToSync.length);
  }

  private cleanupOldRequests(): void {
    const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
    let cleanedCount = 0;

    for (const [requestId, request] of this.requests.entries()) {
      if (request.timestamp < cutoffTime) {
        this.requests.delete(requestId);
        cleanedCount++;
      }
    }

    this.emit("requestsCleaned", cleanedCount);
  }

  // Public API methods
  getAsset(assetId: string): CDNAsset | undefined {
    return this.assets.get(assetId);
  }

  getAssets(): CDNAsset[] {
    return Array.from(this.assets.values());
  }

  getHotAssets(limit: number = 20): CDNAsset[] {
    return Array.from(this.assets.values())
      .sort((a, b) => b.hotness - a.hotness)
      .slice(0, limit);
  }

  getNode(nodeId: string): CDNNode | undefined {
    return this.nodes.get(nodeId);
  }

  getNodes(): CDNNode[] {
    return Array.from(this.nodes.values());
  }

  getActiveNodes(): CDNNode[] {
    return Array.from(this.nodes.values()).filter(
      (node) => node.status === "active",
    );
  }

  async purgeAsset(assetId: string): Promise<boolean> {
    const asset = this.assets.get(assetId);
    if (!asset) return false;

    // Remove from all nodes
    for (const nodeId of asset.distribution.nodes) {
      const node = this.nodes.get(nodeId);
      if (node) {
        node.usage.storage -= asset.size / (1024 * 1024 * 1024);
      }
    }

    // Remove variants
    for (const variant of asset.variants) {
      try {
        await fs.unlink(variant.path);
      } catch (error) {
        console.error("Failed to delete variant:", error);
      }
    }

    this.assets.delete(assetId);
    this.emit("assetPurged", asset);
    return true;
  }

  getStatistics() {
    const assets = Array.from(this.assets.values());
    const nodes = Array.from(this.nodes.values());
    const requests = Array.from(this.requests.values());

    const totalStorage = assets.reduce((sum, asset) => sum + asset.size, 0);
    const totalRequests = requests.length;
    const hitRate =
      requests.filter((r) => r.hitType === "hit").length /
      Math.max(1, totalRequests);

    return {
      assets: {
        total: assets.length,
        totalSize: totalStorage,
        totalSizeGB:
          Math.round((totalStorage / (1024 * 1024 * 1024)) * 100) / 100,
        variants: assets.reduce((sum, asset) => sum + asset.variants.length, 0),
        hotAssets: assets.filter((a) => a.hotness > 50).length,
      },
      nodes: {
        total: nodes.length,
        active: nodes.filter((n) => n.status === "active").length,
        totalCapacityGB: nodes.reduce((sum, n) => sum + n.capacity.storage, 0),
        totalUsageGB:
          Math.round(nodes.reduce((sum, n) => sum + n.usage.storage, 0) * 100) /
          100,
        averageLatency: Math.round(
          nodes.reduce((sum, n) => sum + n.performance.latency, 0) /
            nodes.length,
        ),
        averageUptime:
          Math.round(
            (nodes.reduce((sum, n) => sum + n.performance.uptime, 0) /
              nodes.length) *
              100,
          ) / 100,
      },
      requests: {
        total: totalRequests,
        hitRate: Math.round(hitRate * 10000) / 100, // Percentage with 2 decimals
        totalBandwidth:
          Math.round(
            (requests.reduce((sum, r) => sum + r.bytesTransferred, 0) /
              (1024 * 1024 * 1024)) *
              100,
          ) / 100,
      },
      performance: {
        averageResponseTime:
          requests.length > 0
            ? Math.round(
                requests.reduce((sum, r) => sum + r.responseTime, 0) /
                  requests.length,
              )
            : 0,
        errorRate:
          requests.length > 0
            ? Math.round(
                (requests.filter((r) => r.status >= 400).length /
                  requests.length) *
                  10000,
              ) / 100
            : 0,
      },
    };
  }
}

// Singleton instance
export const cdnDistribution = new CDNDistribution();
