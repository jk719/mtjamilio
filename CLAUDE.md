# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React + TypeScript whiteboard application built with Vite. The project provides an interactive drawing canvas with support for various tools, shapes, math symbols, grid overlays, image uploads, and touch gestures.

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

The application is a single-page React app centered around a whiteboard component with comprehensive drawing capabilities.

#### Entry Points
- `src/main.tsx` - Application entry point, mounts React app to DOM
- `src/App.tsx` - Root component that renders the Whiteboard

#### Whiteboard Components
- `src/components/Whiteboard/Whiteboard.tsx` - Main whiteboard component with canvas drawing logic, gesture handling, history management, image manipulation, and tool controls
- `src/components/Whiteboard/WhiteboardToolbar.tsx` - Toolbar with drawing tools, colors, and controls
- `src/components/Whiteboard/MathSymbolPanel.tsx` - Panel for inserting mathematical symbols
- `src/components/Whiteboard/GridOverlay.tsx` - Grid overlay component for visual guides
- `src/components/Whiteboard/ImageUpload.tsx` - Image upload handling component
- `src/components/Whiteboard/SimpleWhiteboard.tsx` - Alternative simplified whiteboard implementation

#### Custom Hooks
- `src/components/Whiteboard/hooks/useDrawing.ts` - Drawing logic and canvas operations
- `src/components/Whiteboard/hooks/useTouch.ts` - Touch event handling and multi-touch support
- `src/components/Whiteboard/hooks/useGestures.ts` - Gesture recognition (pinch, zoom, pan)

#### Type Definitions
- `src/components/Whiteboard/types.ts` - TypeScript types for tools, colors, shapes, grid types, etc.

### Key Features & Implementation Details

**Drawing System:**
- Canvas-based drawing with support for pen, eraser, and shape tools
- Custom hooks for touch handling (`useTouch`), drawing logic (`useDrawing`), and gesture recognition (`useGestures`)
- History system for undo/redo functionality using ImageData snapshots
- Shape drawing support (circles, rectangles, lines, triangles, paths)
- Particle effects for visual feedback during drawing and erasing

**Image Management:**
- Drag-and-drop image upload via `react-dropzone`
- Image manipulation: move, resize, delete, lock/unlock
- Image selection and layering support
- Persistent image storage and redraw capabilities

**Touch & Gesture Support:**
- Multi-touch drawing and gesture recognition
- Pinch-to-zoom and pan functionality
- Haptic feedback on supported devices
- Touch event prevention during drawing to avoid scrolling

**Grid System:**
- Optional grid overlays with snap-to-grid functionality
- Different grid types (dots, lines, coordinate) configurable through the toolbar

**Math Symbol Support:**
- Math symbol panel (`MathSymbolPanel.tsx`) for inserting mathematical notation
- Symbols rendered as text on the canvas

### Build Configuration

**Vite:**
- Configuration in `vite.config.ts`
- React plugin with Fast Refresh enabled
- Development server with HMR

**TypeScript:**
- Project references setup with separate configs for app and node
- `tsconfig.app.json` - Application TypeScript config with strict mode
- `tsconfig.node.json` - Node/build tools TypeScript config
- Strict type checking enabled with additional linting rules

**Styling:**
- Tailwind CSS v4 with PostCSS
- Custom whiteboard styles in `src/styles/whiteboard.css`
- Responsive design with mobile touch support

### Design Guidelines

- Keep design consistent across all components and features
- Maintain minimalistic, modern, fun and engaging aesthetic with **gaming feel**
- **Target audience**: Grades 6-12 students - design should feel like a cool gaming interface
- Use cool icons throughout the interface with gaming-inspired visual effects
- Follow existing visual patterns (dark theme, glass-morphism effects) enhanced with gaming elements
- Add subtle glow effects, dynamic animations, and gaming-style highlights
- Match toolbar styling, colors, hover effects, and spacing with gaming aesthetic
- Include neon accents, hover glows, and interactive feedback for engagement
- Ensure responsive design works on all devices while maintaining gaming feel

## Development Workflow

### Git Commit/Push Policy

- NEVER commit or push changes automatically
- ALWAYS ask the user for permission before committing
- ALWAYS ask the user for permission before pushing
- Only commit when explicitly requested by the user
- Provide clear commit messages for review before committing

### Testing

- Playwright is installed but no tests are implemented yet
- Run tests with: `npx playwright test` (once tests are created)
- Install Playwright browsers: `npx playwright install`

### Code Quality

- Run linting before committing: `npm run lint`
- Type-check without building: `tsc --noEmit`
- Fix TypeScript errors related to unused variables when encountered
- Address ESLint warnings about missing React Hook dependencies

## Known Issues

- TypeScript errors related to unused variables that need to be resolved
- ESLint warnings about missing React Hook dependencies

## Dependencies

### Core
- React 19.1.1
- TypeScript 5.8.3
- Vite 7.1.2

### UI/Interaction
- react-dropzone 14.3.8 (for image upload)

### Styling
- Tailwind CSS 4.1.12
- Autoprefixer 10.4.21
- PostCSS 8.5.6

### Testing
- Playwright 1.55.0 (configured but no tests implemented yet)

### Linting
- ESLint 9.33.0
- TypeScript ESLint 8.39.1
- React hooks and refresh plugins