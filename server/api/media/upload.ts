/**
 * Media Upload API - Chunked Upload with Forensic Signatures
 *
 * Handles 10x faster uploads via chunked multipart upload
 * Integrates with complete media pipeline
 */

import { Request, Response } from 'express';
import { chunkedUploadService } from '../../services/ChunkedUploadService.js';
import { mediaPipelineService } from '../../services/MediaPipelineService.js';

/**
 * Initialize chunked upload session
 * POST /api/media/upload/initialize
 */
export async function initializeUpload(req: Request, res: Response) {
  try {
    const {
      filename,
      fileSize,
      mimeType,
      creatorId,
      creatorTier,
      platformId,
      selectedPlatforms,
      qualityPresets
    } = req.body;

    // Validate required fields
    if (!filename || !fileSize || !creatorId || !creatorTier || !platformId) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['filename', 'fileSize', 'creatorId', 'creatorTier', 'platformId']
      });
    }

    // Start complete media pipeline
    const pipelineResult = await mediaPipelineService.startPipeline({
      filename,
      fileSize,
      mimeType,
      creatorId,
      creatorTier,
      platformId,
      selectedPlatforms: selectedPlatforms || [],
      qualityPresets
    });

    res.json({
      success: true,
      uploadId: pipelineResult.uploadId,
      mediaAssetId: pipelineResult.mediaAssetId,
      chunkSize: 5 * 1024 * 1024, // 5MB
      totalChunks: Math.ceil(fileSize / (5 * 1024 * 1024)),
      availablePlatforms: pipelineResult.availablePlatforms,
      maxPlatforms: pipelineResult.maxPlatforms,
      message: `Upload session created. You can distribute to up to ${pipelineResult.maxPlatforms} platforms with ${creatorTier} tier.`
    });

  } catch (error) {
    console.error('Error initializing upload:', error);
    res.status(500).json({
      error: 'Failed to initialize upload',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Upload a single chunk
 * POST /api/media/upload/chunk
 */
export async function uploadChunk(req: Request, res: Response) {
  try {
    const { uploadId, chunkNumber } = req.body;

    if (!uploadId || chunkNumber === undefined) {
      return res.status(400).json({
        error: 'Missing uploadId or chunkNumber'
      });
    }

    // Chunk data is in the file buffer
    const chunkData = req.file?.buffer;
    if (!chunkData) {
      return res.status(400).json({
        error: 'No chunk data provided'
      });
    }

    const result = await chunkedUploadService.uploadChunk(
      uploadId,
      chunkNumber,
      chunkData
    );

    res.json({
      success: true,
      uploadId,
      chunkNumber,
      etag: result.etag,
      message: 'Chunk uploaded successfully'
    });

  } catch (error) {
    console.error('Error uploading chunk:', error);
    res.status(500).json({
      error: 'Failed to upload chunk',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Upload multiple chunks in batch (parallel)
 * POST /api/media/upload/batch
 */
export async function uploadChunksBatch(req: Request, res: Response) {
  try {
    const { uploadId, chunks } = req.body;

    if (!uploadId || !chunks || !Array.isArray(chunks)) {
      return res.status(400).json({
        error: 'Missing uploadId or chunks array'
      });
    }

    const result = await chunkedUploadService.uploadChunksBatch(uploadId, chunks);

    res.json({
      success: true,
      uploadId,
      successful: result.successful,
      failed: result.failed,
      message: `Uploaded ${result.successful} chunks successfully`
    });

  } catch (error) {
    console.error('Error uploading batch:', error);
    res.status(500).json({
      error: 'Failed to upload batch',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Complete upload and trigger transcoding pipeline
 * POST /api/media/upload/complete
 */
export async function completeUpload(req: Request, res: Response) {
  try {
    const {
      uploadId,
      title,
      description,
      tags,
      visibility,
      qualityPresets
    } = req.body;

    if (!uploadId) {
      return res.status(400).json({
        error: 'Missing uploadId'
      });
    }

    // Complete upload and start transcoding
    const mediaAssetId = await mediaPipelineService.completeUpload(uploadId, {
      title,
      description,
      tags,
      visibility,
      qualityPresets
    });

    res.json({
      success: true,
      mediaAssetId,
      message: 'Upload completed successfully. Transcoding pipeline started.',
      nextSteps: [
        'Video is being transcoded to multiple quality variants',
        'Forensic signatures are being embedded',
        'Distribution to selected platforms will begin automatically',
        'HLS/DASH manifests will be generated'
      ]
    });

  } catch (error) {
    console.error('Error completing upload:', error);
    res.status(500).json({
      error: 'Failed to complete upload',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Get upload progress
 * GET /api/media/upload/:uploadId/progress
 */
export async function getUploadProgress(req: Request, res: Response) {
  try {
    const { uploadId } = req.params;

    const session = chunkedUploadService.getSession(uploadId);
    if (!session) {
      return res.status(404).json({
        error: 'Upload session not found'
      });
    }

    const pipelineStatus = mediaPipelineService.getPipelineStatus(uploadId);

    res.json({
      uploadId,
      uploadProgress: session.uploadedChunks / session.totalChunks * 100,
      uploadedChunks: session.uploadedChunks,
      totalChunks: session.totalChunks,
      forensicSignature: pipelineStatus?.forensicSignature,
      transcodingStatus: pipelineStatus?.status,
      transcodingProgress: pipelineStatus?.transcodingProgress || 0,
      selectedPlatforms: pipelineStatus?.distributionPlatforms || []
    });

  } catch (error) {
    console.error('Error getting upload progress:', error);
    res.status(500).json({
      error: 'Failed to get upload progress'
    });
  }
}

/**
 * Cancel upload session
 * DELETE /api/media/upload/:uploadId
 */
export async function cancelUpload(req: Request, res: Response) {
  try {
    const { uploadId } = req.params;

    await chunkedUploadService.cancelUpload(uploadId);

    res.json({
      success: true,
      message: 'Upload cancelled successfully'
    });

  } catch (error) {
    console.error('Error cancelling upload:', error);
    res.status(500).json({
      error: 'Failed to cancel upload'
    });
  }
}
