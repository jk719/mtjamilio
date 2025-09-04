import React, { useRef, useEffect, useState, useCallback } from 'react';
import { WhiteboardToolbar } from './WhiteboardToolbar';
import { MathSymbolPanel } from './MathSymbolPanel';
import { GridOverlay } from './GridOverlay';
import { ImageUpload } from './ImageUpload';
import { useDropzone } from 'react-dropzone';
import { useTouch } from './hooks/useTouch';
import { useDrawing } from './hooks/useDrawing';
import { useGestures } from './hooks/useGestures';
import type { Tool, Color, GridType, Point, Shape } from './types';

interface TouchInfo {
  id: number;
  x: number;
  y: number;
}

export const Whiteboard: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tool, setTool] = useState<Tool>('pen');
  const [color, setColor] = useState<Color>('#000000');
  const [lineWidth, setLineWidth] = useState(3);
  const [gridType, setGridType] = useState<GridType>('none');
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [showMathPanel, setShowMathPanel] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const [toolAnimation, setToolAnimation] = useState<{ show: boolean; tool: Tool | null }>({ show: false, tool: null });
  const [cursorPos, setCursorPos] = useState<Point | null>(null);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; vx: number; vy: number; color: string; size: number; type: 'ink' | 'eraser' }>>([]);
  const [uploadedImages, setUploadedImages] = useState<Array<{ 
    id: string; 
    img: HTMLImageElement; 
    x: number; 
    y: number; 
    width: number; 
    height: number;
    selected?: boolean;
    locked?: boolean;
  }>>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [isResizingImage, setIsResizingImage] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  const {
    isDrawing,
    startDrawing,
    draw,
    stopDrawing,
    currentPath,
    shapes,
    clearShapes
  } = useDrawing({
    canvasRef,
    tool,
    color,
    lineWidth,
    snapToGrid,
    gridType,
    onHistoryUpdate: saveToHistory
  });

  const {
    touches,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  } = useTouch({
    onDraw: draw,
    onPinchZoom: handlePinchZoom,
    onPan: handlePan,
    onUndo: undo,
    onRedo: redo
  });

  useGestures({
    containerRef,
    onZoom: handlePinchZoom,
    onPan: handlePan
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resizeCanvas = () => {
      // Use window dimensions if container has no size
      const rect = container.getBoundingClientRect();
      const width = rect.width || window.innerWidth;
      const height = rect.height || window.innerHeight;
      
      canvas.width = width;
      canvas.height = height;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('orientationchange', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('orientationchange', resizeCanvas);
    };
  }, []);

  useEffect(() => {
    // Prevent scrolling while drawing
    const preventScroll = (e: TouchEvent) => {
      if (isDrawing) {
        e.preventDefault();
      }
    };

    document.addEventListener('touchmove', preventScroll, { passive: false });
    return () => document.removeEventListener('touchmove', preventScroll);
  }, [isDrawing]);

  function handlePinchZoom(scale: number, center: Point) {
    setZoom(prev => Math.min(Math.max(0.5, prev * scale), 3));
    // Adjust pan to keep center point fixed
    setPan(prev => ({
      x: prev.x + (center.x - prev.x) * (1 - scale),
      y: prev.y + (center.y - prev.y) * (1 - scale)
    }));
  }

  function handlePan(delta: Point) {
    setPan(prev => ({
      x: prev.x + delta.x,
      y: prev.y + delta.y
    }));
  }

  function saveToHistory() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(imageData);
    
    if (newHistory.length > 50) {
      newHistory.shift();
    }
    
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  }

  function undo() {
    if (historyStep > 0) {
      setHistoryStep(historyStep - 1);
      restoreFromHistory(historyStep - 1);
      triggerHaptic();
    }
  }

  function redo() {
    if (historyStep < history.length - 1) {
      setHistoryStep(historyStep + 1);
      restoreFromHistory(historyStep + 1);
      triggerHaptic();
    }
  }

  function restoreFromHistory(step: number) {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !history[step]) return;

    ctx.putImageData(history[step], 0, 0);
  }

  function redrawCanvas() {
    return; // Temporarily disabled
    /*
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);
    
    // Redraw all shapes
    shapes.forEach((shape: Shape) => {
      drawShape(ctx, shape);
    });
    
    // Draw current path if drawing
    if (currentPath.length > 0) {
      drawPath(ctx, currentPath, color, lineWidth);
    }
    
    ctx.restore();
    */
  }

  function drawShape(ctx: CanvasRenderingContext2D, shape: Shape) {
    ctx.strokeStyle = shape.color;
    ctx.lineWidth = shape.lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    switch (shape.type) {
      case 'path':
        drawPath(ctx, shape.points, shape.color, shape.lineWidth);
        break;
      case 'circle':
        ctx.beginPath();
        ctx.arc(shape.center!.x, shape.center!.y, shape.radius!, 0, Math.PI * 2);
        ctx.stroke();
        break;
      case 'rectangle':
        ctx.strokeRect(shape.start!.x, shape.start!.y, shape.width!, shape.height!);
        break;
      case 'line':
        ctx.beginPath();
        ctx.moveTo(shape.start!.x, shape.start!.y);
        ctx.lineTo(shape.end!.x, shape.end!.y);
        ctx.stroke();
        break;
      case 'triangle':
        ctx.beginPath();
        ctx.moveTo(shape.points[0].x, shape.points[0].y);
        ctx.lineTo(shape.points[1].x, shape.points[1].y);
        ctx.lineTo(shape.points[2].x, shape.points[2].y);
        ctx.closePath();
        ctx.stroke();
        break;
    }
  }

  function drawPath(ctx: CanvasRenderingContext2D, points: Point[], color: string, width: number) {
    if (points.length < 2) return;

    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length - 1; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2;
      const yc = (points[i].y + points[i + 1].y) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }
    
    ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
    ctx.stroke();
  }

  function triggerHaptic() {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
    if ('Haptics' in window && (window as unknown as { Haptics?: { impact?: (options: { style: string }) => void } }).Haptics?.impact) {
      (window as unknown as { Haptics: { impact: (options: { style: string }) => void } }).Haptics.impact({ style: 'light' });
    }
  }

  function createParticles(x: number, y: number, type: 'ink' | 'eraser') {
    const newParticles: Array<{ id: number; x: number; y: number; vx: number; vy: number; color: string; size: number; type: 'ink' | 'eraser' }> = [];
    const particleCount = type === 'eraser' ? 8 : 3;
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5;
      const velocity = type === 'eraser' ? 2 + Math.random() * 2 : 1 + Math.random();
      
      newParticles.push({
        id: Date.now() + i,
        x,
        y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity - (type === 'eraser' ? 2 : 1),
        color: type === 'eraser' ? '#e2e8f0' : color,
        size: type === 'eraser' ? 4 + Math.random() * 4 : 2 + Math.random() * 2,
        type
      });
    }
    
    setParticles(prev => [...prev, ...newParticles].slice(-50)); // Keep max 50 particles
  }

  useEffect(() => {
    if (particles.length === 0) return;
    
    const interval = setInterval(() => {
      setParticles(prev => {
        return prev
          .map(p => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.2, // gravity
            size: p.size * 0.95 // shrink
          }))
          .filter(p => p.size > 0.5 && p.y < window.innerHeight);
      });
    }, 16);
    
    return () => clearInterval(interval);
  }, [particles.length]);

  function exportToPNG() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `whiteboard-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  function insertMathSymbol(symbol: string) {
    // Implementation for inserting math symbols as text
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    ctx.font = `${lineWidth * 8}px 'SF Pro Display', -apple-system, sans-serif`;
    ctx.fillStyle = color;
    
    // Get center of viewport
    const centerX = canvas.width / 2 / (window.devicePixelRatio || 1);
    const centerY = canvas.height / 2 / (window.devicePixelRatio || 1);
    
    ctx.fillText(symbol, centerX - pan.x, centerY - pan.y);
    saveToHistory();
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    clearShapes();
    setUploadedImages([]);
    setSelectedImage(null);
    saveToHistory();
  }

  function redrawAll() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    console.log('Redrawing', shapes.length, 'shapes');
    
    // First, draw all images (so they appear behind shapes)
    uploadedImages.forEach(image => {
      ctx.drawImage(image.img, image.x, image.y, image.width, image.height);
    });
    
    // Then, draw all shapes (drawing strokes) on top of images
    shapes.forEach((shape, index) => {
      console.log(`Shape ${index}:`, shape.type, 'points:', shape.points?.length || 0, 'color:', shape.color, 'tool:', shape.tool);
      
      // Set composite operation based on tool used to create the shape
      if (shape.tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = 'rgba(255, 255, 255, 1)'; // Color doesn't matter for destination-out
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = shape.color;
      }
      
      ctx.lineWidth = shape.lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      if (shape.type === 'path' && shape.points.length > 0) {
        if (shape.tool === 'eraser') {
          // For eraser paths, draw rectangular areas at each point
          shape.points.forEach(point => {
            const eraserWidth = 40;
            const eraserHeight = 30;
            ctx.fillStyle = 'rgba(255, 255, 255, 1)';
            ctx.fillRect(
              point.x - eraserWidth / 2,
              point.y - eraserHeight / 2,
              eraserWidth,
              eraserHeight
            );
          });
        } else {
          // Normal pen strokes
          ctx.beginPath();
          ctx.moveTo(shape.points[0].x, shape.points[0].y);
          
          for (let i = 1; i < shape.points.length; i++) {
            ctx.lineTo(shape.points[i].x, shape.points[i].y);
          }
          
          ctx.stroke();
        }
      } else if (shape.type === 'line' && shape.start && shape.end) {
        ctx.beginPath();
        ctx.moveTo(shape.start.x, shape.start.y);
        ctx.lineTo(shape.end.x, shape.end.y);
        ctx.stroke();
      } else if (shape.type === 'rectangle' && shape.start && shape.width && shape.height) {
        ctx.strokeRect(shape.start.x, shape.start.y, shape.width, shape.height);
      } else if (shape.type === 'circle' && shape.center && shape.radius) {
        ctx.beginPath();
        ctx.arc(shape.center.x, shape.center.y, shape.radius, 0, 2 * Math.PI);
        ctx.stroke();
      }
      
      // Reset composite operation
      ctx.globalCompositeOperation = 'source-over';
    });
    
    // Finally, draw image selection borders and controls on top of everything
    uploadedImages.forEach(image => {
      // Draw selection border if selected
      if (image.selected && image.id === selectedImage) {
        // Different border style for locked vs unlocked
        if (image.locked) {
          ctx.strokeStyle = '#ef4444'; // Red for locked
          ctx.lineWidth = 2;
          ctx.setLineDash([10, 5]);
        } else {
          ctx.strokeStyle = '#6366f1'; // Blue for unlocked
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
        }
        ctx.strokeRect(image.x, image.y, image.width, image.height);
        ctx.setLineDash([]);
        
        // Only show resize handles if unlocked
        if (!image.locked) {
          // Draw resize handles
          const handleSize = 8;
          ctx.fillStyle = '#6366f1';
          
          // Corner handles
          ctx.fillRect(image.x - handleSize/2, image.y - handleSize/2, handleSize, handleSize);
          ctx.fillRect(image.x + image.width - handleSize/2, image.y - handleSize/2, handleSize, handleSize);
          ctx.fillRect(image.x - handleSize/2, image.y + image.height - handleSize/2, handleSize, handleSize);
          ctx.fillRect(image.x + image.width - handleSize/2, image.y + image.height - handleSize/2, handleSize, handleSize);
        }
        
        // Draw control buttons (lock/unlock and delete) - Modern minimalistic design
        const buttonSize = 32;
        const buttonMargin = 8;
        const buttonY = image.y - buttonSize - 12;
        const cornerRadius = 8;
        
        // Helper function to draw rounded rectangle
        const drawRoundedRect = (x: number, y: number, width: number, height: number, radius: number) => {
          ctx.beginPath();
          ctx.moveTo(x + radius, y);
          ctx.arcTo(x + width, y, x + width, y + height, radius);
          ctx.arcTo(x + width, y + height, x, y + height, radius);
          ctx.arcTo(x, y + height, x, y, radius);
          ctx.arcTo(x, y, x + width, y, radius);
          ctx.closePath();
        };
        
        // Lock/Unlock button - Glass morphism style
        const lockX = image.x;
        drawRoundedRect(lockX, buttonY, buttonSize, buttonSize, cornerRadius);
        ctx.fillStyle = image.locked ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)';
        ctx.fill();
        ctx.strokeStyle = image.locked ? 'rgba(239, 68, 68, 0.3)' : 'rgba(34, 197, 94, 0.3)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        // Modern lock/unlock icon using paths
        ctx.strokeStyle = image.locked ? '#ef4444' : '#22c55e';
        ctx.fillStyle = image.locked ? '#ef4444' : '#22c55e';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        const centerX = lockX + buttonSize/2;
        const centerY = buttonY + buttonSize/2;
        
        if (image.locked) {
          // Locked icon - padlock
          ctx.beginPath();
          // Lock body
          ctx.roundRect(centerX - 6, centerY - 2, 12, 8, 2);
          ctx.fill();
          // Lock shackle
          ctx.beginPath();
          ctx.arc(centerX, centerY - 4, 4, Math.PI, 0, false);
          ctx.stroke();
        } else {
          // Unlocked icon - open padlock
          ctx.beginPath();
          // Lock body
          ctx.roundRect(centerX - 6, centerY - 2, 12, 8, 2);
          ctx.fill();
          // Open shackle
          ctx.beginPath();
          ctx.arc(centerX - 2, centerY - 4, 4, Math.PI, Math.PI * 1.7, false);
          ctx.stroke();
        }
        
        // Delete button (only if unlocked) - Modern X with glass morphism
        if (!image.locked) {
          const deleteX = image.x + buttonSize + buttonMargin;
          drawRoundedRect(deleteX, buttonY, buttonSize, buttonSize, cornerRadius);
          ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
          ctx.fill();
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.3)';
          ctx.lineWidth = 1.5;
          ctx.stroke();
          
          // Modern X icon
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 2.5;
          ctx.lineCap = 'round';
          
          const xCenter = deleteX + buttonSize/2;
          const xCenterY = buttonY + buttonSize/2;
          const iconSize = 8;
          
          ctx.beginPath();
          ctx.moveTo(xCenter - iconSize/2, xCenterY - iconSize/2);
          ctx.lineTo(xCenter + iconSize/2, xCenterY + iconSize/2);
          ctx.moveTo(xCenter + iconSize/2, xCenterY - iconSize/2);
          ctx.lineTo(xCenter - iconSize/2, xCenterY + iconSize/2);
          ctx.stroke();
        }
      }
    });
  }

  // Redraw when images or shapes change
  useEffect(() => {
    redrawAll();
  }, [uploadedImages, selectedImage, shapes]);
  
  // Keyboard shortcuts for image manipulation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (selectedImage) {
        const image = uploadedImages.find(img => img.id === selectedImage);
        if (!image) return;
        
        // Delete key to delete unlocked images
        if ((e.key === 'Delete' || e.key === 'Backspace') && !image.locked) {
          e.preventDefault();
          setUploadedImages(prev => prev.filter(img => img.id !== selectedImage));
          setSelectedImage(null);
        }
        
        // L key to toggle lock
        if (e.key === 'l' || e.key === 'L') {
          e.preventDefault();
          setUploadedImages(prev => prev.map(img => 
            img.id === selectedImage ? { ...img, locked: !img.locked } : img
          ));
        }
      }
    }
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, uploadedImages]);

  function handleCanvasClick(e: React.MouseEvent<HTMLCanvasElement>) {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if clicking on an image
    let imageClicked = false;
    uploadedImages.forEach(image => {
      if (x >= image.x && x <= image.x + image.width &&
          y >= image.y && y <= image.y + image.height) {
        setSelectedImage(image.id);
        setUploadedImages(prev => prev.map(img => 
          ({ ...img, selected: img.id === image.id })
        ));
        imageClicked = true;
      }
    });
    
    // Deselect if clicking on empty space
    if (!imageClicked) {
      setSelectedImage(null);
      setUploadedImages(prev => prev.map(img => 
        ({ ...img, selected: false })
      ));
    }
  }

  function getResizeHandle(x: number, y: number, image: any): string | null {
    const handleSize = 16;
    const half = handleSize / 2;
    
    // Check corners
    if (Math.abs(x - image.x) < half && Math.abs(y - image.y) < half) return 'nw';
    if (Math.abs(x - (image.x + image.width)) < half && Math.abs(y - image.y) < half) return 'ne';
    if (Math.abs(x - image.x) < half && Math.abs(y - (image.y + image.height)) < half) return 'sw';
    if (Math.abs(x - (image.x + image.width)) < half && Math.abs(y - (image.y + image.height)) < half) return 'se';
    
    return null;
  }

  const handleImageUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Calculate position and size to fit the image nicely on canvas
        const maxWidth = canvas.width * 0.4;
        const maxHeight = canvas.height * 0.4;
        let width = img.width;
        let height = img.height;

        // Scale down if image is too large
        if (width > maxWidth || height > maxHeight) {
          const scale = Math.min(maxWidth / width, maxHeight / height);
          width *= scale;
          height *= scale;
        }

        // Center the image on canvas
        const x = (canvas.width - width) / 2;
        const y = (canvas.height - height) / 2;
        
        // Add image to state instead of drawing directly
        const newImage = {
          id: `img-${Date.now()}`,
          img,
          x,
          y,
          width,
          height,
          selected: true
        };
        
        setUploadedImages(prev => [
          ...prev.map(img => ({ ...img, selected: false })),
          newImage
        ]);
        setSelectedImage(newImage.id);
        
        redrawAll();
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, []);

  // Setup dropzone for the entire canvas area
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      handleImageUpload(acceptedFiles[0]);
    }
  }, [handleImageUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'],
    },
    multiple: false,
    noClick: true, // We don't want clicks on canvas to trigger file dialog
    noKeyboard: true,
  });

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
      <div 
        {...getRootProps()}
        ref={containerRef}
        className="absolute inset-0"
        style={{
          border: isDragActive ? '4px dashed #10b981' : 'none',
          transition: 'border 0.3s ease',
        }}
      >
        <input {...getInputProps()} />
        {gridType !== 'none' && (
          <GridOverlay 
            type={gridType} 
            zoom={zoom}
            pan={pan}
            snapToGrid={snapToGrid}
          />
        )}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 touch-none"
          style={{
            cursor: tool === 'eraser' 
              ? `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="32" viewBox="0 0 40 32"><defs><linearGradient id="eraser-grad" x1="0%25" y1="0%25" x2="0%25" y2="100%25"><stop offset="0%25" style="stop-color:%234a5568"/><stop offset="100%25" style="stop-color:%232d3748"/></linearGradient><pattern id="eraser-texture" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="0.5" fill="%23fff" opacity="0.2"/></pattern></defs><rect x="5" y="8" width="30" height="20" rx="4" fill="url(%23eraser-grad)"/><rect x="5" y="8" width="30" height="20" rx="4" fill="url(%23eraser-texture)"/><rect x="8" y="18" width="24" height="8" rx="2" fill="%23fff"/><rect x="10" y="20" width="20" height="4" rx="1" fill="%23e2e8f0" opacity="0.8"/></svg>') 20 16, auto`
              : `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" fill="${encodeURIComponent(color)}"/><path d="M20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="${encodeURIComponent(color)}"/></svg>') 2 20, auto`
          }}
          onMouseDown={(e) => {
            const rect = canvasRef.current?.getBoundingClientRect();
            if (!rect) return;
            
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Check if clicking on a selected image
            if (selectedImage) {
              const image = uploadedImages.find(img => img.id === selectedImage);
              if (image) {
                // Check if clicking on control buttons (match new design)
                const buttonSize = 32;
                const buttonMargin = 8;
                const buttonY = image.y - buttonSize - 12;
                
                // Lock/Unlock button
                if (x >= image.x && x <= image.x + buttonSize &&
                    y >= buttonY && y <= buttonY + buttonSize) {
                  setUploadedImages(prev => prev.map(img => 
                    img.id === image.id ? { ...img, locked: !img.locked } : img
                  ));
                  return;
                }
                
                // Delete button (only if unlocked)
                if (!image.locked && 
                    x >= image.x + buttonSize + buttonMargin && 
                    x <= image.x + buttonSize + buttonMargin + buttonSize &&
                    y >= buttonY && y <= buttonY + buttonSize) {
                  setUploadedImages(prev => prev.filter(img => img.id !== image.id));
                  setSelectedImage(null);
                  return;
                }
                
                // Only allow resize/drag if not locked
                if (!image.locked) {
                  // Check for resize handle
                  const handle = getResizeHandle(x, y, image);
                  if (handle) {
                    setIsResizingImage(handle);
                    return;
                  }
                  
                  // Check if clicking on the image
                  if (x >= image.x && x <= image.x + image.width &&
                      y >= image.y && y <= image.y + image.height) {
                    setIsDraggingImage(true);
                    setDragOffset({ x: x - image.x, y: y - image.y });
                    return;
                  }
                } else {
                  // If locked, allow drawing over it - don't return early
                  if (x >= image.x && x <= image.x + image.width &&
                      y >= image.y && y <= image.y + image.height) {
                    // Just keep the locked image selected, but allow drawing to continue
                  }
                }
              }
            }
            
            // Check if clicking on any image
            let clickedOnUnlockedImage = false;
            for (const image of uploadedImages) {
              if (x >= image.x && x <= image.x + image.width &&
                  y >= image.y && y <= image.y + image.height) {
                setSelectedImage(image.id);
                setUploadedImages(prev => prev.map(img => 
                  ({ ...img, selected: img.id === image.id })
                ));
                
                if (!image.locked) {
                  // Only prevent drawing if clicking on an unlocked image
                  setIsDraggingImage(true);
                  setDragOffset({ x: x - image.x, y: y - image.y });
                  clickedOnUnlockedImage = true;
                }
                // If image is locked, allow drawing over it by not setting clickedOnUnlockedImage
                break;
              }
            }
            
            // Start drawing if not clicking on an unlocked image
            if (!clickedOnUnlockedImage) {
              // Only deselect if not clicking on any image at all
              let clickedOnAnyImage = false;
              for (const image of uploadedImages) {
                if (x >= image.x && x <= image.x + image.width &&
                    y >= image.y && y <= image.y + image.height) {
                  clickedOnAnyImage = true;
                  break;
                }
              }
              
              if (!clickedOnAnyImage) {
                setSelectedImage(null);
                setUploadedImages(prev => prev.map(img => 
                  ({ ...img, selected: false })
                ));
              }
              
              startDrawing({ x, y });
            }
          }}
          onMouseMove={(e) => {
            const rect = canvasRef.current?.getBoundingClientRect();
            if (!rect) return;
            
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const point = { x, y };
            setCursorPos(point);
            
            // Handle image dragging
            if (isDraggingImage && selectedImage) {
              const image = uploadedImages.find(img => img.id === selectedImage);
              if (image && !image.locked) {
                setUploadedImages(prev => prev.map(img => 
                  img.id === selectedImage 
                    ? { ...img, x: x - dragOffset.x, y: y - dragOffset.y }
                    : img
                ));
              }
              return;
            }
            
            // Handle image resizing
            if (isResizingImage && selectedImage) {
              const image = uploadedImages.find(img => img.id === selectedImage);
              if (image && !image.locked) {
                setUploadedImages(prev => prev.map(img => {
                  if (img.id === selectedImage) {
                    const aspectRatio = img.img.width / img.img.height;
                    let newWidth = img.width;
                    let newHeight = img.height;
                    let newX = img.x;
                    let newY = img.y;
                    
                    switch(isResizingImage) {
                      case 'se': // Bottom-right
                        newWidth = x - img.x;
                        newHeight = newWidth / aspectRatio;
                        break;
                      case 'sw': // Bottom-left
                        newWidth = img.x + img.width - x;
                        newHeight = newWidth / aspectRatio;
                        newX = x;
                        break;
                      case 'ne': // Top-right
                        newWidth = x - img.x;
                        newHeight = newWidth / aspectRatio;
                        newY = img.y + img.height - newHeight;
                        break;
                      case 'nw': // Top-left
                        newWidth = img.x + img.width - x;
                        newHeight = newWidth / aspectRatio;
                        newX = x;
                        newY = img.y + img.height - newHeight;
                        break;
                    }
                    
                    // Minimum size
                    if (newWidth < 50 || newHeight < 50) return img;
                    
                    return { ...img, x: newX, y: newY, width: newWidth, height: newHeight };
                  }
                  return img;
                }));
              }
              return;
            }
            
            // Handle drawing
            if (isDrawing) {
              draw(point);
              // Create particles only when erasing
              if (tool === 'eraser' && Math.random() > 0.7) {
                createParticles(e.clientX, e.clientY, 'eraser');
              }
            }
            
            // Update cursor based on hover
            if (selectedImage) {
              const image = uploadedImages.find(img => img.id === selectedImage);
              if (image) {
                const handle = getResizeHandle(x, y, image);
                if (handle) {
                  const canvas = canvasRef.current;
                  if (canvas) {
                    if (handle === 'nw' || handle === 'se') {
                      canvas.style.cursor = 'nwse-resize';
                    } else {
                      canvas.style.cursor = 'nesw-resize';
                    }
                    return;
                  }
                }
                
                if (x >= image.x && x <= image.x + image.width &&
                    y >= image.y && y <= image.y + image.height) {
                  const canvas = canvasRef.current;
                  if (canvas) canvas.style.cursor = 'move';
                  return;
                }
              }
            }
            
            // Reset cursor
            const canvas = canvasRef.current;
            if (canvas && !isDrawing) {
              canvas.style.cursor = tool === 'eraser' 
                ? `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="32" viewBox="0 0 40 32"><defs><linearGradient id="eraser-grad" x1="0%25" y1="0%25" x2="0%25" y2="100%25"><stop offset="0%25" style="stop-color:%234a5568"/><stop offset="100%25" style="stop-color:%232d3748"/></linearGradient><pattern id="eraser-texture" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="0.5" fill="%23fff" opacity="0.2"/></pattern></defs><rect x="5" y="8" width="30" height="20" rx="4" fill="url(%23eraser-grad)"/><rect x="5" y="8" width="30" height="20" rx="4" fill="url(%23eraser-texture)"/><rect x="8" y="18" width="24" height="8" rx="2" fill="%23fff"/><rect x="10" y="20" width="20" height="4" rx="1" fill="%23e2e8f0" opacity="0.8"/></svg>') 20 16, auto`
                : `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" fill="${encodeURIComponent(color)}"/><path d="M20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="${encodeURIComponent(color)}"/></svg>') 2 20, auto`;
            }
          }}
          onMouseUp={() => {
            stopDrawing();
            setIsDraggingImage(false);
            setIsResizingImage(null);
          }}
          onMouseLeave={() => {
            stopDrawing();
            setCursorPos(null);
          }}
        />
        
        {/* Drag Indicator */}
        {isDragActive && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
              zIndex: 50,
            }}
          >
            <div
              style={{
                backgroundColor: 'rgba(31, 41, 55, 0.95)',
                borderRadius: '20px',
                padding: '30px',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
                border: '3px dashed #10b981',
              }}
            >
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#10b981"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ margin: '0 auto 10px' }}
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <p style={{ color: '#10b981', fontSize: '18px', fontWeight: '600', margin: 0 }}>
                Drop image here
              </p>
            </div>
          </div>
        )}
        
        {/* Gaming-Style Eraser Preview */}
        {tool === 'eraser' && cursorPos && !isDrawing && (
          <div
            style={{
              position: 'absolute',
              left: cursorPos.x - 25,
              top: cursorPos.y - 20,
              width: '50px',
              height: '40px',
              border: '3px solid rgba(239, 68, 68, 0.8)',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              pointerEvents: 'none',
              borderRadius: '12px',
              boxShadow: `
                0 0 20px rgba(239, 68, 68, 0.4),
                0 0 40px rgba(239, 68, 68, 0.2),
                inset 0 0 15px rgba(239, 68, 68, 0.1)
              `,
              backdropFilter: 'blur(2px)',
              animation: 'eraserPulse 1.5s ease-in-out infinite alternate',
              transform: 'scale(1.1)',
              filter: 'brightness(1.2)'
            }}
          >
            {/* Inner glow effect */}
            <div
              style={{
                position: 'absolute',
                inset: '6px',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
              }}
            />
            {/* Center dot indicator */}
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: '6px',
                height: '6px',
                backgroundColor: '#ef4444',
                borderRadius: '50%',
                boxShadow: '0 0 8px rgba(239, 68, 68, 0.8)'
              }}
            />
          </div>
        )}
        
      </div>

      {/* Particle Effects */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 50 }}>
        {particles.map(particle => (
          <div
            key={particle.id}
            style={{
              position: 'absolute',
              left: particle.x - particle.size / 2,
              top: particle.y - particle.size / 2,
              width: particle.size,
              height: particle.size,
              borderRadius: '2px',
              backgroundColor: particle.color,
              opacity: Math.min(1, particle.size / 8),
              transform: `rotate(${particle.id * 45}deg)`,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              animation: 'float-away 1s ease-out'
            }}
          />
        ))}
      </div>

      <WhiteboardToolbar
        tool={tool}
        color={color}
        lineWidth={lineWidth}
        onToolChange={(t: Tool) => { 
          setTool(t); 
          setToolAnimation({ show: true, tool: t });
          setTimeout(() => setToolAnimation({ show: false, tool: null }), 1000);
          triggerHaptic(); 
        }}
        onColorChange={(c: Color) => { setColor(c); triggerHaptic(); }}
        onLineWidthChange={setLineWidth}
        onUndo={undo}
        onRedo={redo}
        onClear={clearCanvas}
        onExport={exportToPNG}
        onImageUpload={() => { setShowImageUpload(true); triggerHaptic(); }}
        canUndo={historyStep > 0}
        canRedo={historyStep < history.length - 1}
        toolAnimation={toolAnimation}
      />

      {showMathPanel && (
        <MathSymbolPanel
          onSymbolSelect={(symbol: string) => {
            insertMathSymbol(symbol);
            setShowMathPanel(false);
            triggerHaptic();
          }}
          onClose={() => setShowMathPanel(false)}
        />
      )}



      {/* Touch indicator for debugging */}
      {import.meta.env.DEV && touches.map((touch: TouchInfo, i: number) => (
        <div
          key={i}
          className="absolute w-12 h-12 -ml-6 -mt-6 border-2 border-blue-500 rounded-full pointer-events-none"
          style={{
            left: touch.x,
            top: touch.y,
            opacity: 0.5
          }}
        />
      ))}

      <ImageUpload
        isVisible={showImageUpload}
        onClose={() => setShowImageUpload(false)}
        onImageUpload={handleImageUpload}
      />
    </div>
  );
};