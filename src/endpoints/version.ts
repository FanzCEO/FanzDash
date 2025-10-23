// Version endpoint
import express from 'express'



export const versionRouter = express.Router()

versionRouter.get('/version', (req, res) => {
  const version = {
    service: 'FanzDash',
    version: process.env.npm_package_version || '1.0.0', 
    buildDate: process.env.BUILD_DATE || new Date().toISOString(),
    commit: process.env.GIT_COMMIT || 'unknown',
    branch: process.env.GIT_BRANCH || 'main',
    nodeVersion: process.version,
    platform: process.platform
  }
  
  res.json(version)
})

