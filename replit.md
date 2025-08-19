# Overview

This is a comprehensive content moderation platform designed for adult platforms, implementing a hybrid multi-signal moderation stack. The system provides real-time monitoring and moderation of images, videos, text content, and live streams using a combination of machine learning models and human review workflows. The platform features automated content analysis, risk scoring, and a dashboard for human moderators to review flagged content.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client is built with React and TypeScript using Vite as the build tool. The UI leverages Radix UI components with shadcn/ui styling and Tailwind CSS for a modern, accessible interface. The frontend uses wouter for client-side routing and TanStack Query for server state management. Real-time updates are handled through WebSocket connections for live moderation alerts.

## Backend Architecture
The server is an Express.js application with TypeScript, providing RESTful APIs for content management and moderation operations. The architecture follows a storage abstraction pattern with dedicated modules for database operations, routing, and WebSocket handling. The server implements middleware for request logging and error handling.

## Database Design
The system uses PostgreSQL with Drizzle ORM for type-safe database operations. The schema includes tables for users, content items, moderation results, live streams, moderation settings, and appeal requests. Content items support multiple types (image, video, text, live_stream) with associated risk scores and moderation status tracking.

## Content Moderation Pipeline
The moderation system implements a multi-layered approach:
- **Image/Video Analysis**: Uses NudeNet for object detection and region identification, with automatic blurring capabilities
- **Text Moderation**: Integrates Detoxify for toxicity detection and Perspective API as a secondary check
- **Live Stream Monitoring**: Real-time frame sampling with automated risk assessment and blur functionality
- **PDQ Hashing**: Perceptual hashing for duplicate content detection and blocking
- **Risk Scoring**: Weighted confidence scoring from multiple ML models with configurable thresholds

## Real-time Processing
WebSocket connections enable real-time communication between the moderation system and dashboard, broadcasting new content alerts and status updates to connected moderators. Live streams are monitored through frame sampling and audio transcription for continuous risk assessment.

## Moderation Workflow
Content flows through automated analysis first, with machine learning models providing initial risk scores. Items exceeding auto-block thresholds are immediately restricted, while borderline content enters a human review queue. The system supports appeal processes and maintains audit trails for all moderation decisions.

# External Dependencies

## Database Services
- **Neon Database**: PostgreSQL hosting using @neondatabase/serverless for connection pooling
- **Drizzle ORM**: Type-safe database operations with automatic migrations

## Content Analysis APIs
- **Google Cloud Storage**: File storage and management for uploaded content
- **NudeNet**: Open-source nudity detection model for image/video analysis
- **Detoxify**: Toxicity classification for text content moderation
- **Perspective API**: Google's toxicity detection as secondary validation
- **Whisper**: OpenAI's speech recognition for live stream audio analysis

## File Upload & Processing
- **Uppy**: File upload interface with support for drag-drop and AWS S3 integration
- **AWS S3**: Cloud storage backend for content files via @uppy/aws-s3

## UI Framework & Styling
- **Radix UI**: Headless component library for accessible interface elements
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **shadcn/ui**: Pre-built component system built on Radix UI
- **Lucide React**: Icon library for consistent iconography

## Development Tools
- **Vite**: Fast build tool with HMR for development
- **TypeScript**: Type safety across frontend and backend
- **TanStack Query**: Server state management and caching
- **WebSocket (ws)**: Real-time bidirectional communication