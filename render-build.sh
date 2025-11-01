#!/bin/bash
set -e

# Clean install to avoid optional dependency issues
rm -rf node_modules package-lock.json

# Install all dependencies including dev dependencies (vite, esbuild, etc.)
npm install --include=dev

# Build the application
npm run build

echo "Build completed successfully!"

