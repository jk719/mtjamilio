# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React + TypeScript whiteboard application built with Vite. The project provides an interactive drawing canvas with support for various tools, shapes, math symbols, grid overlays, and touch gestures.

## Commands

### Development
- `npm run dev` - Start the Vite development server with hot module replacement
- `npm run build` - Build the project (runs TypeScript compiler and Vite build)
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint to check code quality

### TypeScript
- `tsc -b` - Build TypeScript with project references
- `tsc --noEmit` - Type-check without emitting files

## Architecture

### Core Application Structure
The application is a single-page React app centered around a whiteboard component with drawing capabilities.

**Main Components:**
- `src/App.tsx` - Root component that renders the Whiteboard
- `src/components/Whiteboard/Whiteboard.tsx` - Main whiteboard component with canvas drawing logic, gesture handling, history management, and tool controls
- `src/components/Whiteboard/SimpleWhiteboard.tsx` - Alternative simplified whiteboard implementation
- `src/components/Whiteboard/types.ts` - TypeScript type definitions for the whiteboard system

### Key Features & Implementation Details

**Drawing System:**
- Canvas-based drawing with support for pen, eraser, and shape tools
- Custom hooks for touch handling (`useTouch`), drawing logic (`useDrawing`), and gesture recognition (`useGestures`)
- History system for undo/redo functionality using ImageData snapshots
- Shape drawing support (circles, rectangles, lines, triangles, paths)

**Touch & Gesture Support:**
- Multi-touch drawing and gesture recognition
- Pinch-to-zoom and pan functionality
- Haptic feedback on supported devices
- Touch event prevention during drawing to avoid scrolling

**Grid System:**
- Optional grid overlays with snap-to-grid functionality
- Different grid types configurable through the toolbar

**Math Symbol Support:**
- Math symbol panel for inserting mathematical notation
- Symbols rendered as text on the canvas

### Build Configuration

**Vite:**
- Configuration in `vite.config.ts`
- React plugin with Fast Refresh enabled
- Development server with HMR

**TypeScript:**
- Project references setup with separate configs for app and node
- `tsconfig.app.json` - Application TypeScript config
- `tsconfig.node.json` - Node/build tools TypeScript config
- Strict type checking enabled

**Styling:**
- Tailwind CSS v4 with PostCSS
- Custom whiteboard styles in `src/styles/whiteboard.css`

## Project Status

✅ All TypeScript errors have been resolved
✅ All required components and hooks have been implemented
✅ Build and lint checks pass successfully

## Dependencies

**Core:**
- React 19.1.1
- TypeScript 5.8.3
- Vite 7.1.2

**Styling:**
- Tailwind CSS 4.1.12
- Autoprefixer 10.4.21
- PostCSS 8.5.6

**Testing:**
- Playwright 1.55.0 (configured but no tests implemented yet)

**Linting:**
- ESLint 9.33.0
- TypeScript ESLint 8.39.1
- React hooks and refresh plugins