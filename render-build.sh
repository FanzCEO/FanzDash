#!/bin/bash
set -e

# Clean install to avoid optional dependency issues
rm -rf node_modules package-lock.json

# Install all dependencies including dev
npm install

# Build the application
npm run build

echo "Build completed successfully!"

