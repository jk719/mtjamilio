import React from 'react';
import type { GridType, Point } from './types';

interface GridOverlayProps {
  type: GridType;
  zoom: number;
  pan: Point;
  snapToGrid: boolean;
}

export const GridOverlay: React.FC<GridOverlayProps> = ({
  type,
  zoom,
  pan,
  snapToGrid,
}) => {
  if (type === 'none') return null;

  const gridSize = 20;
  const gridColor = 'rgba(200, 200, 200, 0.3)';
  const majorGridColor = 'rgba(150, 150, 150, 0.4)';

  const renderGrid = () => {
    const style: React.CSSProperties = {
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
      transformOrigin: '0 0',
    };

    switch (type) {
      case 'dots':
        return (
          <svg
            className="absolute inset-0 w-full h-full"
            style={style}
          >
            <defs>
              <pattern
                id="dot-pattern"
                x="0"
                y="0"
                width={gridSize}
                height={gridSize}
                patternUnits="userSpaceOnUse"
              >
                <circle
                  cx={gridSize / 2}
                  cy={gridSize / 2}
                  r="1"
                  fill={gridColor}
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dot-pattern)" />
          </svg>
        );

      case 'lines':
        return (
          <svg
            className="absolute inset-0 w-full h-full"
            style={style}
          >
            <defs>
              <pattern
                id="line-pattern"
                x="0"
                y="0"
                width={gridSize}
                height={gridSize}
                patternUnits="userSpaceOnUse"
              >
                <line
                  x1="0"
                  y1="0"
                  x2="0"
                  y2={gridSize}
                  stroke={gridColor}
                  strokeWidth="0.5"
                />
                <line
                  x1="0"
                  y1="0"
                  x2={gridSize}
                  y2="0"
                  stroke={gridColor}
                  strokeWidth="0.5"
                />
              </pattern>
              <pattern
                id="major-line-pattern"
                x="0"
                y="0"
                width={gridSize * 5}
                height={gridSize * 5}
                patternUnits="userSpaceOnUse"
              >
                <line
                  x1="0"
                  y1="0"
                  x2="0"
                  y2={gridSize * 5}
                  stroke={majorGridColor}
                  strokeWidth="1"
                />
                <line
                  x1="0"
                  y1="0"
                  x2={gridSize * 5}
                  y2="0"
                  stroke={majorGridColor}
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#line-pattern)" />
            <rect width="100%" height="100%" fill="url(#major-line-pattern)" />
          </svg>
        );

      case 'coordinate':
        return (
          <svg
            className="absolute inset-0 w-full h-full"
            style={style}
          >
            <defs>
              <pattern
                id="square-pattern"
                x="0"
                y="0"
                width={gridSize}
                height={gridSize}
                patternUnits="userSpaceOnUse"
              >
                <rect
                  x="0"
                  y="0"
                  width={gridSize}
                  height={gridSize}
                  fill="none"
                  stroke={gridColor}
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#square-pattern)" />
          </svg>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {renderGrid()}
      {snapToGrid && (
        <div className="absolute top-4 right-4 z-10 bg-blue-500 text-white px-2 py-1 rounded text-xs">
          Snap to Grid ON
        </div>
      )}
    </>
  );
};