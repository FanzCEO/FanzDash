export interface ContentItem {
  id: string;
  type: "image" | "video" | "text" | "live_stream";
  url?: string;
  content?: string;
  userId?: string;
  status: "pending" | "approved" | "rejected" | "auto_blocked";
  riskScore?: string;
  moderatorId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ModerationResult {
  id: string;
  contentId: string;
  modelType: "nudenet" | "detoxify" | "pdq_hash";
  confidence?: string;
  detections?: any[];
  pdqHash?: string;
  createdAt?: string;
}

export interface LiveStream {
  id: string;
  streamKey: string;
  userId?: string;
  title?: string;
  viewers?: number;
  status: "live" | "offline" | "suspended";
  riskLevel?: "low" | "medium" | "high";
  autoBlurEnabled?: boolean;
  lastRiskScore?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ModerationSettings {
  id: string;
  type: "image" | "text" | "live_stream";
  autoBlockThreshold?: string;
  reviewThreshold?: string;
  frameSampleRate?: number;
  autoBlurThreshold?: string;
  updatedAt?: string;
}

export interface DashboardStats {
  reviewedToday: number;
  autoBlocked: number;
  pendingReview: number;
  liveStreams: number;
}

export interface WebSocketMessage {
  type: string;
  data: any;
}
