/**
 * Plugin Management Routes
 * AI-powered plugin installation, adaptation, and management
 */

import { Router } from "express";
import multer from "multer";
import { z } from "zod";
import {
  installPlugin,
  uninstallPlugin,
  togglePlugin,
  getInstalledPlugins,
  getPluginStore,
  uploadCustomPlugin,
  adaptPluginToFanz,
  validatePluginSecurity,
  resolvePluginDependencies,
} from "../services/pluginManagementService";
import { createSecureUploadMiddleware } from "../middleware/fileScanningMiddleware";

const router = Router();

// Configure secure upload with virus scanning for plugin uploads
// CRITICAL: Plugins are executable code and must be thoroughly scanned
const upload = createSecureUploadMiddleware({
  dest: "./server/plugins/uploads/",
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    // Allow .zip, .tar.gz, .js, .ts files
    if (
      file.mimetype === "application/zip" ||
      file.mimetype === "application/gzip" ||
      file.mimetype === "application/x-tar" ||
      file.mimetype === "text/javascript" ||
      file.mimetype === "application/javascript" ||
      file.mimetype === "text/typescript"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only .zip, .tar.gz, .js, .ts allowed"));
    }
  },
});

// ============================================================================
// GET /api/admin/plugins - Get all installed plugins
// ============================================================================
router.get("/admin/plugins", async (req, res) => {
  try {
    const plugins = await getInstalledPlugins();
    res.json(plugins);
  } catch (error) {
    console.error("Error fetching installed plugins:", error);
    res.status(500).json({ error: "Failed to fetch plugins" });
  }
});

// ============================================================================
// GET /api/admin/plugins/store - Get available plugins from store
// ============================================================================
router.get("/admin/plugins/store", async (req, res) => {
  try {
    const storePlugins = await getPluginStore();
    res.json(storePlugins);
  } catch (error) {
    console.error("Error fetching plugin store:", error);
    res.status(500).json({ error: "Failed to fetch plugin store" });
  }
});

// ============================================================================
// POST /api/plugins/install - Install a plugin from store
// ============================================================================
const installPluginSchema = z.object({
  pluginId: z.string(),
  autoAdapt: z.boolean().optional().default(true),
  platforms: z.array(z.string()).optional(),
});

router.post("/plugins/install", async (req, res) => {
  try {
    const { pluginId, autoAdapt, platforms } = installPluginSchema.parse(req.body);

    console.log(`🔌 Installing plugin: ${pluginId}`);

    // Step 1: Download plugin from store
    console.log("📥 Downloading plugin from store...");

    // Step 2: Security scan
    console.log("🔒 Running security scan...");
    const securityCheck = await validatePluginSecurity(pluginId);
    if (!securityCheck.passed) {
      return res.status(400).json({
        error: "Security validation failed",
        issues: securityCheck.issues,
      });
    }

    // Step 3: Dependency resolution
    console.log("📦 Resolving dependencies...");
    const dependencies = await resolvePluginDependencies(pluginId);

    // Step 4: AI-powered adaptation
    if (autoAdapt) {
      console.log("🤖 AI adapting plugin to FANZ architecture...");
      const adaptationResult = await adaptPluginToFanz(pluginId, {
        platforms: platforms || ["all"],
        targetArchitecture: "fanzos-microservices",
      });

      if (!adaptationResult.success) {
        return res.status(500).json({
          error: "Plugin adaptation failed",
          details: adaptationResult.errors,
        });
      }
    }

    // Step 5: Install plugin
    console.log("⚙️ Installing plugin...");
    const result = await installPlugin(pluginId, {
      dependencies,
      platforms,
      autoAdapt,
    });

    res.json({
      success: true,
      plugin: result.plugin,
      adaptations: result.adaptations,
      message: `Plugin ${result.plugin.name} installed successfully`,
    });
  } catch (error) {
    console.error("Error installing plugin:", error);
    res.status(500).json({
      error: "Failed to install plugin",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// ============================================================================
// POST /api/plugins/:id/toggle - Toggle plugin active status
// ============================================================================
router.post("/plugins/:id/toggle", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await togglePlugin(id);

    res.json({
      success: true,
      plugin: result.plugin,
      status: result.status,
    });
  } catch (error) {
    console.error("Error toggling plugin:", error);
    res.status(500).json({ error: "Failed to toggle plugin" });
  }
});

// ============================================================================
// DELETE /api/plugins/:id - Uninstall a plugin
// ============================================================================
router.delete("/plugins/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await uninstallPlugin(id);

    res.json({
      success: true,
      message: `Plugin ${result.pluginName} uninstalled successfully`,
    });
  } catch (error) {
    console.error("Error uninstalling plugin:", error);
    res.status(500).json({ error: "Failed to uninstall plugin" });
  }
});

// ============================================================================
// POST /api/plugins/upload - Upload custom plugin
// ============================================================================
router.post("/plugins/upload", upload.single("plugin"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No plugin file uploaded" });
    }

    const { autoAdapt = true, platforms } = req.body;

    console.log(`📤 Processing uploaded plugin: ${req.file.originalname}`);

    // Process the uploaded plugin
    const result = await uploadCustomPlugin(req.file.path, {
      originalName: req.file.originalname,
      autoAdapt: autoAdapt === "true" || autoAdapt === true,
      platforms: platforms ? JSON.parse(platforms) : ["all"],
    });

    res.json({
      success: true,
      plugin: result.plugin,
      adaptations: result.adaptations,
      message: "Custom plugin uploaded and processed successfully",
    });
  } catch (error) {
    console.error("Error uploading plugin:", error);
    res.status(500).json({
      error: "Failed to upload plugin",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// ============================================================================
// POST /api/plugins/:id/adapt - Re-adapt existing plugin with AI
// ============================================================================
router.post("/plugins/:id/adapt", async (req, res) => {
  try {
    const { id } = req.params;
    const { platforms, targetArchitecture } = req.body;

    console.log(`🤖 Re-adapting plugin ${id} with AI...`);

    const result = await adaptPluginToFanz(id, {
      platforms: platforms || ["all"],
      targetArchitecture: targetArchitecture || "fanzos-microservices",
    });

    res.json({
      success: result.success,
      adaptations: result.adaptations,
      message: "Plugin adapted successfully",
    });
  } catch (error) {
    console.error("Error adapting plugin:", error);
    res.status(500).json({ error: "Failed to adapt plugin" });
  }
});

export default router;
