import { useState, useEffect } from 'react';
import type { RefObject } from 'react';
import type { Point } from '../types';

interface GestureState {
  isPinching: boolean;
  isPanning: boolean;
  scale: number;
  translation: Point;
}

interface UseGesturesProps {
  containerRef: RefObject<HTMLDivElement | null>;
  onZoom: (scale: number, center: Point) => void;
  onPan: (delta: Point) => void;
}

export const useGestures = ({
  containerRef,
  onZoom,
  onPan,
}: UseGesturesProps) => {
  const [gestureState, setGestureState] = useState<GestureState>({
    isPinching: false,
    isPanning: false,
    scale: 1,
    translation: { x: 0, y: 0 },
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let initialDistance = 0;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      if (e.ctrlKey) {
        // Pinch zoom on trackpad
        const scale = e.deltaY > 0 ? 0.95 : 1.05;
        const rect = container.getBoundingClientRect();
        const center = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        };
        onZoom(scale, center);
      } else {
        // Pan
        onPan({ x: -e.deltaX, y: -e.deltaY });
      }
    };

    const handleGestureStart = (e: Event & { scale?: number }) => {
      e.preventDefault();
      setGestureState(prev => ({ ...prev, isPinching: true }));
      initialDistance = e.scale || 1;
    };

    const handleGestureChange = (e: Event & { scale?: number }) => {
      e.preventDefault();
      const scale = (e.scale || 1) / initialDistance;
      const rect = container.getBoundingClientRect();
      const center = {
        x: rect.width / 2,
        y: rect.height / 2,
      };
      onZoom(scale, center);
      initialDistance = e.scale || 1;
    };

    const handleGestureEnd = (e: Event) => {
      e.preventDefault();
      setGestureState(prev => ({ ...prev, isPinching: false }));
    };

    // Mouse wheel events
    container.addEventListener('wheel', handleWheel, { passive: false });
    
    // Safari gesture events
    container.addEventListener('gesturestart', handleGestureStart);
    container.addEventListener('gesturechange', handleGestureChange);
    container.addEventListener('gestureend', handleGestureEnd);

    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('gesturestart', handleGestureStart);
      container.removeEventListener('gesturechange', handleGestureChange);
      container.removeEventListener('gestureend', handleGestureEnd);
    };
  }, [containerRef, onZoom, onPan]);

  return { gestureState };
};