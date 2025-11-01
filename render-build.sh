#!/bin/bash
set -e

# Clean install to avoid optional dependency issues
rm -rf node_modules package-lock.json

# Ensure dev dependencies are installed (vite, esbuild, etc.)
# Don't use --production flag and ensure NODE_ENV allows dev deps
NODE_ENV=development npm install

# Build the application
npm run build

echo "Build completed successfully!"

