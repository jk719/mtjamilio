import React, { useRef, useEffect, useState } from 'react';
import { WhiteboardToolbar } from './WhiteboardToolbar';
import { MathSymbolPanel } from './MathSymbolPanel';
import { GridOverlay } from './GridOverlay';
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
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const [toolAnimation, setToolAnimation] = useState<{ show: boolean; tool: Tool | null }>({ show: false, tool: null });
  const [cursorPos, setCursorPos] = useState<Point | null>(null);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; vx: number; vy: number; color: string; size: number; type: 'ink' | 'eraser' }>>([]);
  
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
    const newParticles = [];
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
    saveToHistory();
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
      <div 
        ref={containerRef}
        className="absolute inset-0"
      >
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
              : `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><defs><linearGradient id="pen-grad" x1="0%25" y1="0%25" x2="100%25" y2="100%25"><stop offset="0%25" style="stop-color:%236366f1"/><stop offset="100%25" style="stop-color:%234f46e5"/></linearGradient></defs><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" fill="url(%23pen-grad)"/><path d="M20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="url(%23pen-grad)"/></svg>') 2 20, auto`
          }}
          onMouseDown={(e) => {
            const rect = canvasRef.current?.getBoundingClientRect();
            if (rect) {
              startDrawing({ x: e.clientX - rect.left, y: e.clientY - rect.top });
            }
          }}
          onMouseMove={(e) => {
            const rect = canvasRef.current?.getBoundingClientRect();
            if (rect) {
              const point = { x: e.clientX - rect.left, y: e.clientY - rect.top };
              setCursorPos(point);
              if (isDrawing) {
                draw(point);
                // Create particles only when erasing
                if (tool === 'eraser' && Math.random() > 0.7) { // Don't create particles every frame
                  createParticles(e.clientX, e.clientY, 'eraser');
                }
              }
            }
          }}
          onMouseUp={stopDrawing}
          onMouseLeave={() => {
            stopDrawing();
            setCursorPos(null);
          }}
        />
        
        {/* Eraser Preview */}
        {tool === 'eraser' && cursorPos && !isDrawing && (
          <div
            style={{
              position: 'absolute',
              left: cursorPos.x - 20,
              top: cursorPos.y - 15,
              width: '40px',
              height: '30px',
              border: '2px dashed rgba(0, 0, 0, 0.5)',
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
              pointerEvents: 'none',
              borderRadius: '4px'
            }}
          />
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
        gridType={gridType}
        snapToGrid={snapToGrid}
        onToolChange={(t: Tool) => { 
          setTool(t); 
          setToolAnimation({ show: true, tool: t });
          setTimeout(() => setToolAnimation({ show: false, tool: null }), 1000);
          triggerHaptic(); 
        }}
        onColorChange={(c: Color) => { setColor(c); triggerHaptic(); }}
        onLineWidthChange={setLineWidth}
        onGridTypeChange={(g: GridType) => { setGridType(g); triggerHaptic(); }}
        onSnapToGridChange={(s: boolean) => { setSnapToGrid(s); triggerHaptic(); }}
        onUndo={undo}
        onRedo={redo}
        onClear={clearCanvas}
        onExport={exportToPNG}
        onMathPanel={() => { setShowMathPanel(!showMathPanel); triggerHaptic(); }}
        canUndo={historyStep > 0}
        canRedo={historyStep < history.length - 1}
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

      {/* Tool Animation Indicator */}
      {toolAnimation.show && (
        <div 
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 100,
            pointerEvents: 'none',
            animation: 'fadeInOut 1s ease-out'
          }}
        >
          <div
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)'
            }}
          >
            {toolAnimation.tool === 'pen' ? (
              <svg width="60" height="60" fill="white" viewBox="0 0 24 24">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
              </svg>
            ) : (
              <svg width="60" height="60" fill="white" viewBox="0 0 24 24">
                <path d="M15.14 3c.51 0 1.02.2 1.41.59l4.87 4.87c.78.78.78 2.05 0 2.83l-8.14 8.14L5.12 11.27l8.14-8.14c.39-.39.9-.59 1.41-.59m0-2c-1.03 0-2.06.39-2.83 1.17L3 11.59c-.78.78-.78 2.05 0 2.83l9.42 9.42c.39.39.9.59 1.41.59s1.02-.2 1.41-.59l8.59-8.59c.78-.78.78-2.05 0-2.83l-4.87-4.87C17.2 1.39 16.17 1 15.14 1zm-1.01 6.91L6.5 15.54 8.46 17.5l7.63-7.63-1.96-1.96z"/>
              </svg>
            )}
          </div>
          <div
            style={{
              marginTop: '10px',
              textAlign: 'center',
              color: 'rgba(0, 0, 0, 0.8)',
              fontSize: '18px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '2px'
            }}
          >
            {toolAnimation.tool}
          </div>
        </div>
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
    </div>
  );
};