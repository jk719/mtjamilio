import { useState, useCallback } from 'react';
import type { RefObject } from 'react';
import type { Tool, Color, GridType, Point, Shape } from '../types';

interface UseDrawingProps {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  tool: Tool;
  color: Color;
  lineWidth: number;
  snapToGrid: boolean;
  gridType: GridType;
  onHistoryUpdate: () => void;
}

export const useDrawing = ({
  canvasRef,
  tool,
  color,
  lineWidth,
  snapToGrid,
  gridType,
  onHistoryUpdate,
}: UseDrawingProps) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [lastWidth, setLastWidth] = useState(lineWidth);
  const [strokeVelocity, setStrokeVelocity] = useState(0);

  const snapPoint = (point: Point): Point => {
    if (!snapToGrid || gridType === 'none') return point;
    
    const gridSize = 20;
    return {
      x: Math.round(point.x / gridSize) * gridSize,
      y: Math.round(point.y / gridSize) * gridSize,
    };
  };

  const startDrawing = useCallback((point: Point) => {
    setIsDrawing(true);
    const snappedPoint = snapPoint(point);
    setStartPoint(snappedPoint);
    setCurrentPath([snappedPoint]);
    setLastWidth(lineWidth); // Start at normal width
    setStrokeVelocity(0); // Reset velocity for new stroke

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    // Set composite operation based on tool
    ctx.globalCompositeOperation = 'source-over';
  }, [tool, snapToGrid, gridType, canvasRef, lineWidth]);

  const draw = useCallback((point: Point) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    const snappedPoint = snapPoint(point);
    
    if (tool === 'eraser') {
      // Eraser acts like a whiteboard eraser - rectangular area
      const eraserWidth = 40;
      const eraserHeight = 30;
      
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      
      // Create a rectangular eraser path
      ctx.fillStyle = 'rgba(255, 255, 255, 1)';
      ctx.fillRect(
        snappedPoint.x - eraserWidth / 2,
        snappedPoint.y - eraserHeight / 2,
        eraserWidth,
        eraserHeight
      );
      
      ctx.restore();
      
      setCurrentPath(prev => [...prev, snappedPoint]);
    } else if (tool === 'pen') {
      // Use functional update to get the latest path
      setCurrentPath(prev => {
        const newPath = [...prev, snappedPoint];
        
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = color;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Ultra-smooth stroke rendering
        if (prev.length > 0) {
          const prevPoint = prev[prev.length - 1];
          
          // Calculate distance for width variation
          const dx = snappedPoint.x - prevPoint.x;
          const dy = snappedPoint.y - prevPoint.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Extremely smooth velocity tracking
          const velocity = distance;
          const smoothedVelocity = strokeVelocity * 0.95 + velocity * 0.05;
          setStrokeVelocity(smoothedVelocity);
          
          // Very subtle width variation for natural look
          let targetWidth;
          if (prev.length < 2) {
            targetWidth = lineWidth;
          } else {
            // Minimal variation - max 10% change
            const speedFactor = Math.min(smoothedVelocity / 20, 1);
            targetWidth = lineWidth * (1 - speedFactor * 0.1);
          }
          
          // Ultra-smooth width transition
          const smoothedWidth = lastWidth * 0.97 + targetWidth * 0.03;
          
          // Use quadratic curves for maximum smoothness
          ctx.lineWidth = smoothedWidth;
          
          if (prev.length > 1) {
            // Calculate control point for quadratic curve
            const cpx = prevPoint.x;
            const cpy = prevPoint.y;
            
            // Midpoint for smoother curves
            const midX = (prevPoint.x + snappedPoint.x) / 2;
            const midY = (prevPoint.y + snappedPoint.y) / 2;
            
            ctx.beginPath();
            ctx.moveTo(prevPoint.x, prevPoint.y);
            ctx.quadraticCurveTo(cpx, cpy, midX, midY);
            ctx.stroke();
            
            // Also draw to the end point
            ctx.beginPath();
            ctx.moveTo(midX, midY);
            ctx.lineTo(snappedPoint.x, snappedPoint.y);
            ctx.stroke();
          } else {
            // First segment - simple line
            ctx.beginPath();
            ctx.moveTo(prevPoint.x, prevPoint.y);
            ctx.lineTo(snappedPoint.x, snappedPoint.y);
            ctx.stroke();
          }
          
          setLastWidth(smoothedWidth);
        } else {
          // Starting point - draw a small dot
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(snappedPoint.x, snappedPoint.y, lineWidth / 2, 0, Math.PI * 2);
          ctx.fill();
          setLastWidth(lineWidth);
        }
        
        return newPath;
      });
    }
  }, [isDrawing, tool, color, lineWidth, snapToGrid, gridType, canvasRef]);

  const stopDrawing = useCallback(() => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    if (startPoint && currentPath.length > 0) {
      const endPoint = currentPath[currentPath.length - 1];
      
      if (tool === 'line') {
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        ctx.moveTo(startPoint.x, startPoint.y);
        ctx.lineTo(endPoint.x, endPoint.y);
        ctx.stroke();
        
        setShapes(prev => [...prev, {
          id: `shape-${Date.now()}-${Math.random()}`,
          type: 'line',
          color,
          lineWidth,
          points: [],
          start: startPoint,
          end: endPoint,
        }]);
      } else if (tool === 'rectangle') {
        const width = endPoint.x - startPoint.x;
        const height = endPoint.y - startPoint.y;
        
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.strokeRect(startPoint.x, startPoint.y, width, height);
        
        setShapes(prev => [...prev, {
          id: `shape-${Date.now()}-${Math.random()}`,
          type: 'rectangle',
          color,
          lineWidth,
          points: [],
          start: startPoint,
          width,
          height,
        }]);
      } else if (tool === 'circle') {
        const radius = Math.sqrt(
          Math.pow(endPoint.x - startPoint.x, 2) +
          Math.pow(endPoint.y - startPoint.y, 2)
        );
        
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        ctx.arc(startPoint.x, startPoint.y, radius, 0, Math.PI * 2);
        ctx.stroke();
        
        setShapes(prev => [...prev, {
          id: `shape-${Date.now()}-${Math.random()}`,
          type: 'circle',
          color,
          lineWidth,
          points: [],
          center: startPoint,
          radius,
        }]);
      } else if (tool === 'triangle') {
        const midX = (startPoint.x + endPoint.x) / 2;
        
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        ctx.moveTo(midX, startPoint.y);
        ctx.lineTo(startPoint.x, endPoint.y);
        ctx.lineTo(endPoint.x, endPoint.y);
        ctx.closePath();
        ctx.stroke();
        
        setShapes(prev => [...prev, {
          id: `shape-${Date.now()}-${Math.random()}`,
          type: 'triangle',
          color,
          lineWidth,
          points: [
            { x: midX, y: startPoint.y },
            { x: startPoint.x, y: endPoint.y },
            { x: endPoint.x, y: endPoint.y },
          ],
        }]);
      } else if ((tool === 'pen' || tool === 'eraser') && currentPath.length > 1) {
        setShapes(prev => [...prev, {
          id: `shape-${Date.now()}-${Math.random()}`,
          type: 'path',
          color,
          lineWidth: tool === 'eraser' ? lineWidth * 2 : lineWidth,
          points: [...currentPath],
        }]);
      }
    }

    ctx.globalCompositeOperation = 'source-over';
    setIsDrawing(false);
    setCurrentPath([]);
    setStartPoint(null);
    onHistoryUpdate();
  }, [isDrawing, tool, color, lineWidth, startPoint, currentPath, canvasRef, onHistoryUpdate]);

  const clearShapes = useCallback(() => {
    setShapes([]);
  }, []);

  return {
    isDrawing,
    startDrawing,
    draw,
    stopDrawing,
    currentPath,
    shapes,
    clearShapes,
  };
};