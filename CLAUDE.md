# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

XSLT Lab is an online XSLT editor and tester that uses Saxon for XSLT 2.0/3.0 transformations. The application consists of a React frontend and a Go backend that orchestrates Java/Saxon for XSLT processing.

## Build Commands

```bash
# Full stack with Docker Compose (lightweight, no database)
make compose-up
make compose-down

# Backend (Go)
cd backend/src && go build -o ../server
cd backend && ./server

# Frontend (React/Vite)
cd frontend && npm install
VITE_BACKEND_URL=http://localhost:8000 npm run dev

# Testing
make backend-test        # Go tests: go test ./...
make frontend-test       # npm tests: vitest

# Docker images
make backend-image
make frontend-image
```

## Architecture

### Frontend (`/frontend`)
- React 18 + Vite SPA
- **App.jsx** is the monolithic state container managing all workspace state, tabs, transformations
- Monaco Editor for code editing (lazy-loaded)
- LocalStorage persistence for workspace data (up to 3 workspaces)
- `/lib/workspaceUtils.js` contains utility functions for parameter extraction, error parsing, XSLT manipulation

### Backend (`/backend`)
- Go/Gin HTTP server on port 8000
- Executes Saxon via `java` command with generated args file
- **POST /transform** - Main endpoint accepting `{xslt, version, parameters, trace}`
- 10-second timeout per transformation
- `/ext/` contains Java custom extension functions (uuid, date, base64, etc.)

### Data Flow
```
Frontend (POST /transform) → Go Backend → java/Saxon → Parse trace/result → JSON response
```

### Pro Features (when VITE_GO_PRO=true)
- Firebase authentication
- PostgreSQL history storage
- `/history` endpoint

## Key Environment Variables

**Frontend (build-time)**:
- `VITE_BACKEND_URL` - Backend API endpoint
- `VITE_GO_PRO` - Enable Pro features
- `VITE_FIREBASE_CONFIG` - Firebase configuration

**Backend**:
- `DATABASE_URL` - PostgreSQL connection (Pro mode)
- `SAXON_CLASSPATH` - Path to Saxon JARs (default in app.config)

## Configuration Files

- `/backend/app.config` - Backend port and Saxon classpath
- `/docker-compose.local.yml` - Lightweight dev stack (no DB)
- `/docker-compose.yml` - Full stack with PostgreSQL
- `/charts/xslt-playground/` - Helm chart for Kubernetes deployment
