import { spawn, ChildProcess } from "child_process";
import { promises as fs } from "fs";
import { join, dirname, basename, extname } from "path";
import { randomUUID } from "crypto";
import { EventEmitter } from "events";

export interface VideoEncodingJob {
  id: string;
  inputPath: string;
  outputPath: string;
  format: "mp4" | "webm" | "hls" | "dash";
  quality: "low" | "medium" | "high" | "ultra";
  resolution: string;
  bitrate?: string;
  fps?: number;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  startTime?: Date;
  endTime?: Date;
  error?: string;
  metadata?: VideoMetadata;
}

export interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
  bitrate: number;
  fps: number;
  codec: string;
  format: string;
  size: number;
}

export interface EncodingPreset {
  name: string;
  video: {
    codec: string;
    bitrate: string;
    preset: string;
    crf?: number;
  };
  audio: {
    codec: string;
    bitrate: string;
    sampleRate: string;
  };
  container: string;
}

export class VideoEncoder extends EventEmitter {
  private jobs = new Map<string, VideoEncodingJob>();
  private activeProcesses = new Map<string, ChildProcess>();
  private concurrentJobs = 3; // Configurable based on server resources

  // Production-ready encoding presets
  private presets: Record<string, EncodingPreset> = {
    mp4_high: {
      name: "MP4 High Quality",
      video: { codec: "libx264", bitrate: "5000k", preset: "medium", crf: 18 },
      audio: { codec: "aac", bitrate: "192k", sampleRate: "48000" },
      container: "mp4",
    },
    mp4_medium: {
      name: "MP4 Medium Quality",
      video: { codec: "libx264", bitrate: "2500k", preset: "fast", crf: 23 },
      audio: { codec: "aac", bitrate: "128k", sampleRate: "44100" },
      container: "mp4",
    },
    mp4_low: {
      name: "MP4 Low Quality",
      video: { codec: "libx264", bitrate: "1000k", preset: "faster", crf: 28 },
      audio: { codec: "aac", bitrate: "96k", sampleRate: "44100" },
      container: "mp4",
    },
    webm_high: {
      name: "WebM High Quality",
      video: { codec: "libvpx-vp9", bitrate: "4000k", preset: "medium" },
      audio: { codec: "libopus", bitrate: "192k", sampleRate: "48000" },
      container: "webm",
    },
    hls_adaptive: {
      name: "HLS Adaptive Streaming",
      video: { codec: "libx264", bitrate: "variable", preset: "medium" },
      audio: { codec: "aac", bitrate: "128k", sampleRate: "48000" },
      container: "hls",
    },
  };

  constructor() {
    super();
    this.setupDirectories();
  }

  private async setupDirectories() {
    const dirs = ["uploads", "processing", "output", "thumbnails"];
    for (const dir of dirs) {
      await fs.mkdir(join(process.cwd(), "media", dir), { recursive: true });
    }
  }

  async createEncodingJob(
    inputPath: string,
    format: VideoEncodingJob["format"],
    quality: VideoEncodingJob["quality"],
    options: {
      resolution?: string;
      bitrate?: string;
      fps?: number;
    } = {},
  ): Promise<string> {
    const jobId = randomUUID();
    const outputPath = await this.generateOutputPath(
      inputPath,
      format,
      quality,
    );

    const job: VideoEncodingJob = {
      id: jobId,
      inputPath,
      outputPath,
      format,
      quality,
      resolution: options.resolution || "original",
      bitrate: options.bitrate,
      fps: options.fps,
      status: "pending",
      progress: 0,
      startTime: new Date(),
    };

    this.jobs.set(jobId, job);
    this.emit("jobCreated", job);

    // Start processing if under concurrent limit
    if (this.activeProcesses.size < this.concurrentJobs) {
      this.processJob(jobId);
    }

    return jobId;
  }

  private async generateOutputPath(
    inputPath: string,
    format: VideoEncodingJob["format"],
    quality: VideoEncodingJob["quality"],
  ): Promise<string> {
    const baseName = basename(inputPath, extname(inputPath));
    const timestamp = Date.now();

    switch (format) {
      case "hls":
        return join(
          process.cwd(),
          "media",
          "output",
          `${baseName}_${quality}_${timestamp}`,
          "playlist.m3u8",
        );
      case "dash":
        return join(
          process.cwd(),
          "media",
          "output",
          `${baseName}_${quality}_${timestamp}`,
          "manifest.mpd",
        );
      default:
        const ext = format === "mp4" ? "mp4" : "webm";
        return join(
          process.cwd(),
          "media",
          "output",
          `${baseName}_${quality}_${timestamp}.${ext}`,
        );
    }
  }

  private async processJob(jobId: string) {
    const job = this.jobs.get(jobId);
    if (!job) return;

    try {
      job.status = "processing";
      job.startTime = new Date();
      this.emit("jobStarted", job);

      // Get video metadata first
      job.metadata = await this.extractMetadata(job.inputPath);

      // Generate encoding command
      const command = this.buildFFmpegCommand(job);

      // Start encoding process
      const process = spawn("ffmpeg", command);
      this.activeProcesses.set(jobId, process);

      // Track progress
      if (job.metadata) {
        this.trackProgress(jobId, process);
      }

      process.on("close", async (code) => {
        this.activeProcesses.delete(jobId);

        if (code === 0) {
          job.status = "completed";
          job.endTime = new Date();
          job.progress = 100;

          // Generate thumbnail
          await this.generateThumbnail(job.inputPath, jobId);

          this.emit("jobCompleted", job);
        } else {
          job.status = "failed";
          job.error = `FFmpeg process exited with code ${code}`;
          this.emit("jobFailed", job);
        }

        // Process next job in queue
        this.processNextJob();
      });

      process.on("error", (error) => {
        this.activeProcesses.delete(jobId);
        job.status = "failed";
        job.error = error.message;
        this.emit("jobFailed", job);
        this.processNextJob();
      });
    } catch (error) {
      job.status = "failed";
      job.error = error instanceof Error ? error.message : "Unknown error";
      this.emit("jobFailed", job);
      this.processNextJob();
    }
  }

  private buildFFmpegCommand(job: VideoEncodingJob): string[] {
    const preset = this.getPresetForJob(job);
    const args: string[] = [
      "-i",
      job.inputPath,
      "-y", // Overwrite output files
      "-threads",
      "0", // Use all available CPU cores
    ];

    // Video encoding settings
    args.push("-c:v", preset.video.codec);

    if (preset.video.crf) {
      args.push("-crf", preset.video.crf.toString());
    } else {
      args.push("-b:v", preset.video.bitrate);
    }

    args.push("-preset", preset.video.preset);

    // Audio encoding settings
    args.push("-c:a", preset.audio.codec);
    args.push("-b:a", preset.audio.bitrate);
    args.push("-ar", preset.audio.sampleRate);

    // Resolution handling
    if (job.resolution !== "original") {
      args.push("-vf", `scale=${job.resolution}:-2`);
    }

    // FPS handling
    if (job.fps) {
      args.push("-r", job.fps.toString());
    }

    // Format-specific settings
    switch (job.format) {
      case "hls":
        args.push(
          "-f",
          "hls",
          "-hls_time",
          "6",
          "-hls_playlist_type",
          "vod",
          "-hls_flags",
          "independent_segments",
          "-hls_segment_type",
          "mpegts",
        );
        break;
      case "dash":
        args.push(
          "-f",
          "dash",
          "-seg_duration",
          "6",
          "-adaptation_sets",
          "id=0,streams=v id=1,streams=a",
        );
        break;
      case "webm":
        args.push("-f", "webm");
        break;
      default:
        args.push("-f", "mp4", "-movflags", "+faststart");
    }

    // Ensure output directory exists
    const outputDir = dirname(job.outputPath);
    require("fs").mkdirSync(outputDir, { recursive: true });

    args.push(job.outputPath);

    return args;
  }

  private getPresetForJob(job: VideoEncodingJob): EncodingPreset {
    if (job.format === "hls") {
      return this.presets["hls_adaptive"];
    }

    const presetKey = `${job.format}_${job.quality}`;
    return (
      this.presets[presetKey] ||
      this.presets[`${job.format}_medium`] ||
      this.presets["mp4_medium"]
    );
  }

  private trackProgress(jobId: string, process: ChildProcess) {
    const job = this.jobs.get(jobId);
    if (!job || !job.metadata) return;

    let progressData = "";

    process.stderr?.on("data", (data) => {
      progressData += data.toString();

      // Parse FFmpeg progress output
      const timeMatch = progressData.match(
        /time=(\d{2}):(\d{2}):(\d{2}\.\d{2})/,
      );
      if (timeMatch) {
        const [, hours, minutes, seconds] = timeMatch;
        const currentTime =
          parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseFloat(seconds);
        const progress = Math.min(
          100,
          Math.round((currentTime / job.metadata.duration) * 100),
        );

        job.progress = progress;
        this.emit("jobProgress", job);
      }
    });
  }

  private async extractMetadata(inputPath: string): Promise<VideoMetadata> {
    return new Promise((resolve, reject) => {
      const process = spawn("ffprobe", [
        "-v",
        "quiet",
        "-print_format",
        "json",
        "-show_format",
        "-show_streams",
        inputPath,
      ]);

      let output = "";

      process.stdout.on("data", (data) => {
        output += data.toString();
      });

      process.on("close", (code) => {
        if (code !== 0) {
          reject(new Error("Failed to extract metadata"));
          return;
        }

        try {
          const data = JSON.parse(output);
          const videoStream = data.streams.find(
            (s: any) => s.codec_type === "video",
          );
          const format = data.format;

          resolve({
            duration: parseFloat(format.duration),
            width: videoStream.width,
            height: videoStream.height,
            bitrate: parseInt(format.bit_rate) || 0,
            fps: this.parseFraction(videoStream.r_frame_rate), // Parse fraction safely
            codec: videoStream.codec_name,
            format: format.format_name,
            size: parseInt(format.size),
          });
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  private async generateThumbnail(
    inputPath: string,
    jobId: string,
  ): Promise<void> {
    const thumbnailPath = join(
      process.cwd(),
      "media",
      "thumbnails",
      `${jobId}.jpg`,
    );

    return new Promise((resolve, reject) => {
      const process = spawn("ffmpeg", [
        "-i",
        inputPath,
        "-vf",
        "thumbnail,scale=320:240",
        "-frames:v",
        "1",
        "-y",
        thumbnailPath,
      ]);

      process.on("close", (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error("Failed to generate thumbnail"));
        }
      });
    });
  }

  private processNextJob() {
    if (this.activeProcesses.size >= this.concurrentJobs) return;

    const pendingJob = Array.from(this.jobs.values()).find(
      (job) => job.status === "pending",
    );

    if (pendingJob) {
      this.processJob(pendingJob.id);
    }
  }

  getJob(jobId: string): VideoEncodingJob | undefined {
    return this.jobs.get(jobId);
  }

  getAllJobs(): VideoEncodingJob[] {
    return Array.from(this.jobs.values());
  }

  getActiveJobs(): VideoEncodingJob[] {
    return Array.from(this.jobs.values()).filter(
      (job) => job.status === "processing",
    );
  }

  cancelJob(jobId: string): boolean {
    const process = this.activeProcesses.get(jobId);
    const job = this.jobs.get(jobId);

    if (process && job) {
      process.kill("SIGTERM");
      job.status = "failed";
      job.error = "Job cancelled by user";
      this.activeProcesses.delete(jobId);
      this.emit("jobCancelled", job);
      this.processNextJob();
      return true;
    }

    return false;
  }

  getStats() {
    const jobs = Array.from(this.jobs.values());
    return {
      total: jobs.length,
      pending: jobs.filter((j) => j.status === "pending").length,
      processing: jobs.filter((j) => j.status === "processing").length,
      completed: jobs.filter((j) => j.status === "completed").length,
      failed: jobs.filter((j) => j.status === "failed").length,
      activeProcesses: this.activeProcesses.size,
      concurrentJobs: this.concurrentJobs,
    };
  }

  private parseFraction(fractionStr: string): number {
    if (!fractionStr || typeof fractionStr !== 'string') {
      return 30; // Default fallback FPS
    }
    
    const parts = fractionStr.split('/');
    if (parts.length === 2) {
      const numerator = parseFloat(parts[0]);
      const denominator = parseFloat(parts[1]);
      if (denominator !== 0 && !isNaN(numerator) && !isNaN(denominator)) {
        return numerator / denominator;
      }
    }
    
    // Try to parse as direct number
    const directNum = parseFloat(fractionStr);
    if (!isNaN(directNum)) {
      return directNum;
    }
    
    return 30; // Default fallback FPS
  }

  setConcurrentJobs(count: number) {
    this.concurrentJobs = Math.max(1, count);
  }
}

// Singleton instance
export const videoEncoder = new VideoEncoder();
