import React from 'react';
import type { Tool, Color, GridType } from './types';

interface WhiteboardToolbarProps {
  tool: Tool;
  color: Color;
  lineWidth: number;
  gridType: GridType;
  snapToGrid: boolean;
  onToolChange: (tool: Tool) => void;
  onColorChange: (color: Color) => void;
  onLineWidthChange: (width: number) => void;
  onGridTypeChange: (gridType: GridType) => void;
  onSnapToGridChange: (snap: boolean) => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onExport: () => void;
  onMathPanel: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const ColorButton: React.FC<{ color: string; isActive: boolean; onClick: () => void }> = ({ 
  color, 
  isActive, 
  onClick 
}) => (
  <button
    onClick={onClick}
    style={{ 
      backgroundColor: color,
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      border: isActive ? '3px solid white' : '2px solid transparent',
      transform: isActive ? 'scale(1.2)' : 'scale(1)',
      transition: 'all 0.2s ease',
      cursor: 'pointer',
      position: 'relative',
      boxShadow: isActive ? `0 0 15px ${color}` : '0 2px 4px rgba(0,0,0,0.2)'
    }}
    onMouseEnter={(e) => {
      if (!isActive) {
        e.currentTarget.style.transform = 'scale(1.1)';
      }
    }}
    onMouseLeave={(e) => {
      if (!isActive) {
        e.currentTarget.style.transform = 'scale(1)';
      }
    }}
  />
);

export const WhiteboardToolbar: React.FC<WhiteboardToolbarProps> = ({
  tool,
  color,
  lineWidth,
  gridType,
  snapToGrid,
  onToolChange,
  onColorChange,
  onLineWidthChange,
  onGridTypeChange,
  onSnapToGridChange,
  onUndo,
  onRedo,
  onClear,
  onExport,
  onMathPanel,
  canUndo,
  canRedo,
}) => {
  const colors: Color[] = [
    '#1a1a1a',  // Almost black
    '#FF6B6B',  // Coral red
    '#4ECDC4',  // Turquoise
    '#45B7D1',  // Sky blue
    '#FFA07A',  // Light salmon
    '#DDA0DD',  // Plum
    '#98D8C8',  // Mint
    '#FFD93D',  // Golden yellow
  ];

  const toolbarStyle: React.CSSProperties = {
    position: 'absolute',
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: 'rgba(31, 41, 55, 0.95)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    padding: '12px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
    zIndex: 10,
    border: '1px solid rgba(255, 255, 255, 0.1)'
  };

  const buttonStyle = (isActive: boolean): React.CSSProperties => ({
    padding: '10px',
    borderRadius: '12px',
    backgroundColor: isActive ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.1)',
    border: isActive ? '2px solid rgb(99, 102, 241)' : '2px solid transparent',
    color: isActive ? 'white' : 'rgba(255, 255, 255, 0.7)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '44px',
    minHeight: '44px'
  });

  const sizeButtonStyle = (isActive: boolean, size: number): React.CSSProperties => ({
    padding: '8px',
    borderRadius: '8px',
    backgroundColor: isActive ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  });

  const dividerStyle: React.CSSProperties = {
    width: '1px',
    height: '30px',
    backgroundColor: 'rgba(255, 255, 255, 0.2)'
  };

  return (
    <>
      <div style={toolbarStyle}>
        {/* Tool Selection */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => onToolChange('pen')}
            style={buttonStyle(tool === 'pen')}
            title="Pen"
            onMouseEnter={(e) => {
              if (tool !== 'pen') {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
              }
            }}
            onMouseLeave={(e) => {
              if (tool !== 'pen') {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              }
            }}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" 
              />
            </svg>
          </button>
          <button
            onClick={() => onToolChange('eraser')}
            style={buttonStyle(tool === 'eraser')}
            title="Eraser"
            onMouseEnter={(e) => {
              if (tool !== 'eraser') {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
              }
            }}
            onMouseLeave={(e) => {
              if (tool !== 'eraser') {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              }
            }}
          >
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M15.14 3c.51 0 1.02.2 1.41.59l4.87 4.87c.78.78.78 2.05 0 2.83l-8.14 8.14L5.12 11.27l8.14-8.14c.39-.39.9-.59 1.41-.59m0-2c-1.03 0-2.06.39-2.83 1.17L3 11.59c-.78.78-.78 2.05 0 2.83l9.42 9.42c.39.39.9.59 1.41.59s1.02-.2 1.41-.59l8.59-8.59c.78-.78.78-2.05 0-2.83l-4.87-4.87C17.2 1.39 16.17 1 15.14 1zm-1.01 6.91L6.5 15.54 8.46 17.5l7.63-7.63-1.96-1.96z"/>
            </svg>
          </button>
        </div>

        <div style={dividerStyle} />

        {/* Color Selection */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {colors.map((c) => (
            <ColorButton
              key={c}
              color={c}
              isActive={color === c}
              onClick={() => onColorChange(c)}
            />
          ))}
        </div>

        <div style={dividerStyle} />

        {/* Line Width */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {[2, 5, 10, 20].map((width) => (
            <button
              key={width}
              onClick={() => onLineWidthChange(width)}
              style={sizeButtonStyle(lineWidth === width, width)}
              title={`Width ${width}`}
            >
              <div 
                style={{ 
                  width: `${Math.min(width * 1.5, 24)}px`, 
                  height: `${Math.min(width * 1.5, 24)}px`,
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  opacity: lineWidth === width ? 1 : 0.6
                }}
              />
            </button>
          ))}
        </div>

        <div style={dividerStyle} />

        {/* Actions */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={onUndo}
            disabled={!canUndo}
            style={{
              ...buttonStyle(false),
              opacity: canUndo ? 1 : 0.3,
              cursor: canUndo ? 'pointer' : 'not-allowed'
            }}
            title="Undo"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            style={{
              ...buttonStyle(false),
              opacity: canRedo ? 1 : 0.3,
              cursor: canRedo ? 'pointer' : 'not-allowed'
            }}
            title="Redo"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
            </svg>
          </button>
          <button
            onClick={onClear}
            style={{
              ...buttonStyle(false),
              backgroundColor: 'rgba(239, 68, 68, 0.2)',
              color: '#ef4444'
            }}
            title="Clear All"
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
            }}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Floating Export Button */}
      <button
        onClick={onExport}
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: '#10b981',
          color: 'white',
          border: 'none',
          boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
          zIndex: 10
        }}
        title="Export Drawing"
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = '0 15px 40px rgba(16, 185, 129, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 10px 30px rgba(16, 185, 129, 0.3)';
        }}
      >
        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      </button>
    </>
  );
};