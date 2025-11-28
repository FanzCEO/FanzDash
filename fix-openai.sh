#!/bin/bash

# Fix OpenAI initializations for development mode

FILES=(
  "server/aiContentModeration.ts"
  "server/aiFinanceCopilot.ts" 
  "server/aiPredictiveAnalytics.ts"
  "server/chatService.ts"
  "server/communicationSystem.ts"
  "server/complianceMonitor.ts"
  "server/creatorAutomation.ts"
  "server/ecosystemMaintenance.ts"
  "server/starzStudioService.ts"
  "server/systemMonitoring.ts"
)

for FILE in "${FILES[@]}"; do
  if [ -f "$FILE" ]; then
    echo "Fixing $FILE..."
    
    # Replace the OpenAI import and initialization
    sed -i '' 's/const openai = new OpenAI.*$/const isDevMode = !process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes("placeholder") || process.env.OPENAI_API_KEY.includes("development");\nconst openai = isDevMode ? null : new OpenAI({ apiKey: process.env.OPENAI_API_KEY });/' "$FILE"
    
    echo "Fixed $FILE"
  else
    echo "Warning: $FILE not found"
  fi
done

echo "All OpenAI initializations fixed for development mode!"
