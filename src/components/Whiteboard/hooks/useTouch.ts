import { useState, useCallback } from 'react';
import type { Point } from '../types';

interface TouchInfo {
  id: number;
  x: number;
  y: number;
}

interface UseTouchProps {
  onDraw: (point: Point) => void;
  onPinchZoom: (scale: number, center: Point) => void;
  onPan: (delta: Point) => void;
  onUndo: () => void;
  onRedo: () => void;
}

export const useTouch = ({
  onDraw,
  onPinchZoom,
  onPan,
  onUndo,
  onRedo,
}: UseTouchProps) => {
  const [touches, setTouches] = useState<TouchInfo[]>([]);
  const [lastTouchDistance, setLastTouchDistance] = useState<number | null>(null);
  const [lastTouchCenter, setLastTouchCenter] = useState<Point | null>(null);
  const [gestureStartTime, setGestureStartTime] = useState<number>(0);

  const getTouchInfo = (touch: React.Touch): TouchInfo => ({
    id: touch.identifier,
    x: touch.clientX,
    y: touch.clientY,
  });

  const getDistance = (touch1: TouchInfo, touch2: TouchInfo): number => {
    const dx = touch1.x - touch2.x;
    const dy = touch1.y - touch2.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getCenter = (touch1: TouchInfo, touch2: TouchInfo): Point => ({
    x: (touch1.x + touch2.x) / 2,
    y: (touch1.y + touch2.y) / 2,
  });

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touchList = Array.from(e.touches).map(getTouchInfo);
    setTouches(touchList);
    setGestureStartTime(Date.now());

    if (touchList.length === 2) {
      const distance = getDistance(touchList[0], touchList[1]);
      const center = getCenter(touchList[0], touchList[1]);
      setLastTouchDistance(distance);
      setLastTouchCenter(center);
    } else if (touchList.length === 1) {
      onDraw({ x: touchList[0].x, y: touchList[0].y });
    }

    // Three-finger tap for undo
    if (touchList.length === 3 && Date.now() - gestureStartTime < 300) {
      onUndo();
    }

    // Four-finger tap for redo
    if (touchList.length === 4 && Date.now() - gestureStartTime < 300) {
      onRedo();
    }
  }, [onDraw, onUndo, onRedo, gestureStartTime]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const touchList = Array.from(e.touches).map(getTouchInfo);
    setTouches(touchList);

    if (touchList.length === 2 && lastTouchDistance !== null && lastTouchCenter !== null) {
      const distance = getDistance(touchList[0], touchList[1]);
      const center = getCenter(touchList[0], touchList[1]);
      
      // Pinch zoom
      const scale = distance / lastTouchDistance;
      if (Math.abs(scale - 1) > 0.01) {
        onPinchZoom(scale, center);
      }

      // Pan
      const deltaX = center.x - lastTouchCenter.x;
      const deltaY = center.y - lastTouchCenter.y;
      if (Math.abs(deltaX) > 1 || Math.abs(deltaY) > 1) {
        onPan({ x: deltaX, y: deltaY });
      }

      setLastTouchDistance(distance);
      setLastTouchCenter(center);
    } else if (touchList.length === 1) {
      onDraw({ x: touchList[0].x, y: touchList[0].y });
    }
  }, [onDraw, onPinchZoom, onPan, lastTouchDistance, lastTouchCenter]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const touchList = Array.from(e.touches).map(getTouchInfo);
    setTouches(touchList);

    if (touchList.length < 2) {
      setLastTouchDistance(null);
      setLastTouchCenter(null);
    }
  }, []);

  return {
    touches,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
};