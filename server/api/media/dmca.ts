/**
 * DMCA Takedown Management API
 *
 * Automated copyright protection with forensic signature detection
 * Handles scanning, case creation, and takedown submission
 */

import { Request, Response } from 'express';
import { dmcaService } from '../../services/DMCAService.js';
import { db } from '../../db/index.js';
import { dmcaTakedownCases } from '../../db/mediaSchema.js';
import { eq, desc, and, gte } from 'drizzle-orm';

/**
 * Scan all platforms for stolen content
 * POST /api/media/dmca/scan
 */
export async function scanPlatforms(req: Request, res: Response) {
  try {
    const { platforms } = req.body;

    console.log('🔍 Starting automated platform scan for stolen content...');

    const results = platforms
      ? await Promise.all(platforms.map((p: string) => dmcaService.scanPlatform(p)))
      : await dmcaService.scanAllPlatforms();

    const totalMatches = results.reduce((sum, r) => sum + r.matchesFound, 0);
    const totalScanned = results.reduce((sum, r) => sum + r.videosScanned, 0);

    console.log(`✅ Scan complete: ${totalMatches} stolen videos found in ${totalScanned} scanned`);

    res.json({
      success: true,
      scanResults: results,
      summary: {
        platformsScanned: results.length,
        totalVideosScanned: totalScanned,
        totalMatchesFound: totalMatches,
        dmcaCasesCreated: results.reduce((sum, r) => sum + r.dmcaCasesCreated, 0)
      },
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Error scanning platforms:', error);
    res.status(500).json({
      error: 'Failed to scan platforms',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Scan a specific platform
 * POST /api/media/dmca/scan/:platform
 */
export async function scanSinglePlatform(req: Request, res: Response) {
  try {
    const { platform } = req.params;

    console.log(`🔍 Scanning ${platform} for stolen content...`);

    const result = await dmcaService.scanPlatform(platform as any);

    res.json({
      success: true,
      platform,
      videosScanned: result.videosScanned,
      matchesFound: result.matchesFound,
      dmcaCasesCreated: result.dmcaCasesCreated,
      timestamp: new Date()
    });

  } catch (error) {
    console.error(`Error scanning ${req.params.platform}:`, error);
    res.status(500).json({
      error: 'Failed to scan platform',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Get all DMCA cases
 * GET /api/media/dmca/cases
 */
export async function getDMCACases(req: Request, res: Response) {
  try {
    const { status, platform, days = 30, limit = 50 } = req.query;

    let query = db.select().from(dmcaTakedownCases);

    // Filter by status if provided
    if (status) {
      query = query.where(eq(dmcaTakedownCases.status, status as string)) as any;
    }

    // Filter by platform if provided
    if (platform) {
      query = query.where(eq(dmcaTakedownCases.platformName, platform as string)) as any;
    }

    // Filter by date range
    const since = new Date(Date.now() - parseInt(days as string) * 24 * 60 * 60 * 1000);
    query = query.where(gte(dmcaTakedownCases.createdAt, since)) as any;

    const cases = await query
      .orderBy(desc(dmcaTakedownCases.createdAt))
      .limit(parseInt(limit as string));

    const statistics = {
      totalCases: cases.length,
      byStatus: cases.reduce((acc, c) => {
        acc[c.status] = (acc[c.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byPlatform: cases.reduce((acc, c) => {
        acc[c.platformName] = (acc[c.platformName] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      successfulTakedowns: cases.filter(c => c.status === 'resolved').length
    };

    res.json({
      cases,
      statistics,
      periodDays: days
    });

  } catch (error) {
    console.error('Error getting DMCA cases:', error);
    res.status(500).json({
      error: 'Failed to get DMCA cases'
    });
  }
}

/**
 * Get a specific DMCA case
 * GET /api/media/dmca/cases/:caseNumber
 */
export async function getDMCACase(req: Request, res: Response) {
  try {
    const { caseNumber } = req.params;

    const [dmcaCase] = await db.select()
      .from(dmcaTakedownCases)
      .where(eq(dmcaTakedownCases.caseNumber, caseNumber))
      .limit(1);

    if (!dmcaCase) {
      return res.status(404).json({
        error: 'DMCA case not found'
      });
    }

    res.json(dmcaCase);

  } catch (error) {
    console.error('Error getting DMCA case:', error);
    res.status(500).json({
      error: 'Failed to get DMCA case'
    });
  }
}

/**
 * Submit a takedown request
 * POST /api/media/dmca/submit/:caseNumber
 */
export async function submitTakedown(req: Request, res: Response) {
  try {
    const { caseNumber } = req.params;

    const [dmcaCase] = await db.select()
      .from(dmcaTakedownCases)
      .where(eq(dmcaTakedownCases.caseNumber, caseNumber))
      .limit(1);

    if (!dmcaCase) {
      return res.status(404).json({
        error: 'DMCA case not found'
      });
    }

    console.log(`📤 Submitting DMCA takedown: ${caseNumber} to ${dmcaCase.platformName}`);

    const success = await dmcaService.submitTakedown(caseNumber, dmcaCase.platformName as any);

    if (success) {
      res.json({
        success: true,
        caseNumber,
        platform: dmcaCase.platformName,
        message: 'DMCA takedown submitted successfully'
      });
    } else {
      res.status(500).json({
        error: 'Failed to submit takedown',
        caseNumber
      });
    }

  } catch (error) {
    console.error('Error submitting takedown:', error);
    res.status(500).json({
      error: 'Failed to submit takedown',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Update DMCA case status
 * PATCH /api/media/dmca/cases/:caseNumber
 */
export async function updateDMCACase(req: Request, res: Response) {
  try {
    const { caseNumber } = req.params;
    const { status, resolvedAt, notes } = req.body;

    const [dmcaCase] = await db.select()
      .from(dmcaTakedownCases)
      .where(eq(dmcaTakedownCases.caseNumber, caseNumber))
      .limit(1);

    if (!dmcaCase) {
      return res.status(404).json({
        error: 'DMCA case not found'
      });
    }

    const [updated] = await db.update(dmcaTakedownCases)
      .set({
        status: status || dmcaCase.status,
        resolvedAt: resolvedAt ? new Date(resolvedAt) : dmcaCase.resolvedAt,
        notes: notes !== undefined ? notes : dmcaCase.notes,
        updatedAt: new Date()
      })
      .where(eq(dmcaTakedownCases.id, dmcaCase.id))
      .returning();

    console.log(`📝 Updated DMCA case ${caseNumber}: status=${updated.status}`);

    res.json({
      success: true,
      case: updated
    });

  } catch (error) {
    console.error('Error updating DMCA case:', error);
    res.status(500).json({
      error: 'Failed to update DMCA case',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Get DMCA statistics and dashboard data
 * GET /api/media/dmca/statistics
 */
export async function getDMCAStatistics(req: Request, res: Response) {
  try {
    const { days = 30 } = req.query;
    const since = new Date(Date.now() - parseInt(days as string) * 24 * 60 * 60 * 1000);

    const cases = await db.select()
      .from(dmcaTakedownCases)
      .where(gte(dmcaTakedownCases.createdAt, since));

    const statistics = {
      totalCases: cases.length,
      casesByStatus: {
        pending: cases.filter(c => c.status === 'pending').length,
        submitted: cases.filter(c => c.status === 'submitted').length,
        inProgress: cases.filter(c => c.status === 'in_progress').length,
        resolved: cases.filter(c => c.status === 'resolved').length,
        rejected: cases.filter(c => c.status === 'rejected').length
      },
      casesByPlatform: cases.reduce((acc, c) => {
        acc[c.platformName] = (acc[c.platformName] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      successRate: cases.length > 0
        ? (cases.filter(c => c.status === 'resolved').length / cases.length * 100).toFixed(2)
        : '0',
      averageResolutionTime: calculateAverageResolutionTime(cases),
      recentCases: cases
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10)
        .map(c => ({
          caseNumber: c.caseNumber,
          platform: c.platformName,
          status: c.status,
          infringementUrl: c.infringementUrl,
          createdAt: c.createdAt
        }))
    };

    res.json({
      statistics,
      periodDays: days,
      generatedAt: new Date()
    });

  } catch (error) {
    console.error('Error getting DMCA statistics:', error);
    res.status(500).json({
      error: 'Failed to get DMCA statistics'
    });
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

function calculateAverageResolutionTime(cases: any[]): string {
  const resolvedCases = cases.filter(c => c.status === 'resolved' && c.resolvedAt);

  if (resolvedCases.length === 0) {
    return 'N/A';
  }

  const totalTime = resolvedCases.reduce((sum, c) => {
    const created = new Date(c.createdAt).getTime();
    const resolved = new Date(c.resolvedAt).getTime();
    return sum + (resolved - created);
  }, 0);

  const averageMs = totalTime / resolvedCases.length;
  const averageDays = Math.round(averageMs / (1000 * 60 * 60 * 24));

  return `${averageDays} days`;
}
