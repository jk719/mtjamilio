import React from 'react';
import type { Tool, Color } from './types';

interface WhiteboardToolbarProps {
  tool: Tool;
  color: Color;
  lineWidth: number;
  onToolChange: (tool: Tool) => void;
  onColorChange: (color: Color) => void;
  onLineWidthChange: (width: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onExport: () => void;
  onImageUpload: () => void;
  canUndo: boolean;
  canRedo: boolean;
  toolAnimation?: { show: boolean; tool: Tool | null };
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
      width: '36px',
      height: '36px',
      borderRadius: '50%',
      border: color === '#FFFFFF' ? 
        (isActive ? `3px solid #60a5fa` : '2px solid rgba(100, 100, 100, 0.5)') : 
        (isActive ? `3px solid #60a5fa` : '2px solid rgba(255, 255, 255, 0.1)'),
      transform: isActive ? 'scale(1.25) translateY(-3px)' : 'scale(1)',
      transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      cursor: 'pointer',
      position: 'relative',
      boxShadow: isActive ? 
        `0 0 25px ${color}, 0 0 40px ${color}40, 0 8px 16px rgba(0,0,0,0.3)` : 
        `0 0 8px ${color}30, 0 3px 6px rgba(0,0,0,0.2)`,
      filter: isActive ? 'brightness(1.3) saturate(1.2)' : 'brightness(1)'
    }}
    onMouseEnter={(e) => {
      if (!isActive) {
        e.currentTarget.style.transform = 'scale(1.15) translateY(-2px)';
        e.currentTarget.style.boxShadow = `0 0 15px ${color}60, 0 5px 10px rgba(0,0,0,0.25)`;
        e.currentTarget.style.filter = 'brightness(1.1)';
      }
    }}
    onMouseLeave={(e) => {
      if (!isActive) {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = `0 0 8px ${color}30, 0 3px 6px rgba(0,0,0,0.2)`;
        e.currentTarget.style.filter = 'brightness(1)';
      }
    }}
  />
);

export const WhiteboardToolbar: React.FC<WhiteboardToolbarProps> = ({
  tool,
  color,
  lineWidth,
  onToolChange,
  onColorChange,
  onLineWidthChange,
  onUndo,
  onRedo,
  onClear,
  onExport,
  onImageUpload,
  canUndo,
  canRedo,
  toolAnimation,
}) => {
  const colors: Color[] = [
    '#000000',  // Black
    '#FFFFFF',  // White
    '#1e3a8a',  // Blue
    '#dc2626',  // Red
    '#16a34a',  // Green
    '#f59e0b',  // Orange
    '#8b5cf6',  // Purple
    '#ec4899',  // Pink
  ];

  const toolbarStyle: React.CSSProperties = {
    position: 'absolute',
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: 'rgba(26, 26, 26, 0.98)', // Dark charcoal for maximum color pop
    backdropFilter: 'blur(15px)',
    borderRadius: '16px',
    padding: '12px 16px', // Reduced padding for compactness
    display: 'flex',
    alignItems: 'center',
    gap: '12px', // Further reduced gap for compactness
    width: 'fit-content', // Only take up needed width
    boxShadow: `
      0 0 50px rgba(59, 130, 246, 0.08),
      0 20px 60px rgba(0, 0, 0, 0.6),
      inset 0 1px 0 rgba(255, 255, 255, 0.05),
      inset 0 -1px 0 rgba(0, 0, 0, 0.5)
    `, // Enhanced depth and glow
    zIndex: 10,
    border: '1px solid rgba(255, 255, 255, 0.08)', // Subtle light border for contrast
    transition: 'all 0.3s ease'
  };

  const buttonStyle = (isActive: boolean): React.CSSProperties => ({
    padding: '8px', // Reduced padding
    borderRadius: '12px',
    backgroundColor: isActive ? 'rgba(59, 130, 246, 0.25)' : 'rgba(255, 255, 255, 0.05)',
    border: isActive ? '2px solid rgb(59, 130, 246)' : '2px solid rgba(255, 255, 255, 0.1)',
    color: isActive ? '#60a5fa' : 'rgba(255, 255, 255, 0.8)',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '40px', // Reduced size
    minHeight: '40px', // Reduced size
    boxShadow: isActive ? 
      '0 0 20px rgba(59, 130, 246, 0.4), 0 4px 12px rgba(0, 0, 0, 0.3)' : 
      '0 2px 8px rgba(0, 0, 0, 0.2)',
    transform: isActive ? 'translateY(-2px) scale(1.05)' : 'translateY(0) scale(1)',
    filter: isActive ? 'brightness(1.2)' : 'brightness(1)'
  });

  const sizeButtonStyle = (isActive: boolean, size: number): React.CSSProperties => ({
    padding: '6px', // Reduced padding
    borderRadius: '10px',
    backgroundColor: isActive ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.03)',
    border: isActive ? '2px solid rgb(59, 130, 246)' : '2px solid rgba(255, 255, 255, 0.1)',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '32px', // Reduced size
    minHeight: '32px', // Reduced size
    transform: isActive ? 'translateY(-2px) scale(1.1)' : 'scale(1)',
    boxShadow: isActive ? 
      '0 0 15px rgba(59, 130, 246, 0.3), 0 4px 8px rgba(0, 0, 0, 0.2)' : 
      '0 2px 4px rgba(0, 0, 0, 0.1)'
  });

  const dividerStyle: React.CSSProperties = {
    width: '2px',
    height: '40px',
    background: 'linear-gradient(to bottom, transparent, rgba(59, 130, 246, 0.4), transparent)',
    borderRadius: '1px',
    boxShadow: '0 0 4px rgba(59, 130, 246, 0.2)'
  };

  return (
    <>
      <div style={{ ...toolbarStyle, position: 'relative' }}>
        {/* Subtle Tool Indicator Above Toolbar */}
        {toolAnimation?.show && (
          <div 
            style={{
              position: 'absolute',
              top: '-60px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 15,
              pointerEvents: 'none',
              animation: 'subtleToolFeedback 1s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <div
              style={{
                padding: '8px 16px',
                borderRadius: '12px',
                background: toolAnimation.tool === 'pen' 
                  ? 'rgba(59, 130, 246, 0.9)' 
                  : 'rgba(239, 68, 68, 0.9)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: toolAnimation.tool === 'pen'
                  ? '0 0 20px rgba(59, 130, 246, 0.4), 0 4px 12px rgba(0, 0, 0, 0.3)'
                  : '0 0 20px rgba(239, 68, 68, 0.4), 0 4px 12px rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              {toolAnimation.tool === 'pen' ? (
                <svg width="16" height="16" fill="white" viewBox="0 0 24 24">
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                </svg>
              ) : (
                <svg width="16" height="16" fill="white" viewBox="0 0 24 24">
                  <path d="M15.14 3c.51 0 1.02.2 1.41.59l4.87 4.87c.78.78.78 2.05 0 2.83l-8.14 8.14L5.12 11.27l8.14-8.14c.39-.39.9-.59 1.41-.59m0-2c-1.03 0-2.06.39-2.83 1.17L3 11.59c-.78.78-.78 2.05 0 2.83l9.42 9.42c.39.39.9.59 1.41.59s1.02-.2 1.41-.59l8.59-8.59c.78-.78.78-2.05 0-2.83l-4.87-4.87C17.2 1.39 16.17 1 15.14 1zm-1.01 6.91L6.5 15.54 8.46 17.5l7.63-7.63-1.96-1.96z"/>
                </svg>
              )}
              <span
                style={{
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  textTransform: 'capitalize',
                  fontFamily: 'system-ui, -apple-system, sans-serif'
                }}
              >
                {toolAnimation.tool}
              </span>
            </div>
          </div>
        )}

        {/* Tool Selection */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={() => onToolChange('pen')}
            style={buttonStyle(tool === 'pen')}
            title="Pen Tool - Create & Draw"
            onMouseEnter={(e) => {
              if (tool !== 'pen') {
                e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.15)';
                e.currentTarget.style.transform = 'translateY(-3px) scale(1.08)';
                e.currentTarget.style.boxShadow = '0 0 25px rgba(59, 130, 246, 0.3), 0 8px 16px rgba(0, 0, 0, 0.25)';
                e.currentTarget.style.border = '2px solid rgba(59, 130, 246, 0.4)';
                e.currentTarget.style.filter = 'brightness(1.15)';
              }
            }}
            onMouseLeave={(e) => {
              if (tool !== 'pen') {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
                e.currentTarget.style.border = '2px solid rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.filter = 'brightness(1)';
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
            title="Eraser Tool - Remove & Erase"
            onMouseEnter={(e) => {
              if (tool !== 'eraser') {
                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)';
                e.currentTarget.style.transform = 'translateY(-3px) scale(1.08)';
                e.currentTarget.style.boxShadow = '0 0 25px rgba(239, 68, 68, 0.3), 0 8px 16px rgba(0, 0, 0, 0.25)';
                e.currentTarget.style.border = '2px solid rgba(239, 68, 68, 0.4)';
                e.currentTarget.style.filter = 'brightness(1.15)';
              }
            }}
            onMouseLeave={(e) => {
              if (tool !== 'eraser') {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
                e.currentTarget.style.border = '2px solid rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.filter = 'brightness(1)';
              }
            }}
          >
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M15.14 3c.51 0 1.02.2 1.41.59l4.87 4.87c.78.78.78 2.05 0 2.83l-8.14 8.14L5.12 11.27l8.14-8.14c.39-.39.9-.59 1.41-.59m0-2c-1.03 0-2.06.39-2.83 1.17L3 11.59c-.78.78-.78 2.05 0 2.83l9.42 9.42c.39.39.9.59 1.41.59s1.02-.2 1.41-.59l8.59-8.59c.78-.78.78-2.05 0-2.83l-4.87-4.87C17.2 1.39 16.17 1 15.14 1zm-1.01 6.91L6.5 15.54 8.46 17.5l7.63-7.63-1.96-1.96z"/>
            </svg>
          </button>
          
          <button
            onClick={onImageUpload}
            style={buttonStyle(false)}
            title="Image Upload - Add Media"
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.15)';
              e.currentTarget.style.transform = 'translateY(-3px) scale(1.08)';
              e.currentTarget.style.boxShadow = '0 0 25px rgba(16, 185, 129, 0.3), 0 8px 16px rgba(0, 0, 0, 0.25)';
              e.currentTarget.style.border = '2px solid rgba(16, 185, 129, 0.4)';
              e.currentTarget.style.filter = 'brightness(1.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
              e.currentTarget.style.border = '2px solid rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.filter = 'brightness(1)';
            }}
          >
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zM5 19l3.5-4.5 2.5 3L14.5 12 19 19H5z"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
            </svg>
          </button>
        </div>

        <div style={dividerStyle} />

        {/* Color Selection */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
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
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          {[2, 5, 10].map((width) => (
            <button
              key={width}
              onClick={() => onLineWidthChange(width)}
              style={sizeButtonStyle(lineWidth === width, width)}
              title={`Width ${width}`}
            >
              <div 
                style={{ 
                  width: `${Math.min(width * 1.2, 20)}px`, 
                  height: `${Math.min(width * 1.2, 20)}px`,
                  backgroundColor: lineWidth === width ? '#60a5fa' : 'rgba(255, 255, 255, 0.7)',
                  borderRadius: '50%',
                  opacity: lineWidth === width ? 1 : 0.6,
                  boxShadow: lineWidth === width ? 
                    '0 0 10px #60a5fa, 0 0 20px #60a5fa40' : 
                    '0 0 4px rgba(255, 255, 255, 0.3)',
                  transition: 'all 0.3s ease',
                  border: lineWidth === width ? '2px solid rgba(96, 165, 250, 0.3)' : 'none'
                }}
              />
            </button>
          ))}
        </div>

        <div style={dividerStyle} />

        {/* Actions */}
        <div style={{ display: 'flex', gap: '6px' }}>
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
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              color: '#ef4444',
              border: '2px solid rgba(239, 68, 68, 0.3)'
            }}
            title="Clear All - Reset Canvas"
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.25)';
              e.currentTarget.style.transform = 'translateY(-3px) scale(1.08)';
              e.currentTarget.style.boxShadow = '0 0 25px rgba(239, 68, 68, 0.4), 0 8px 16px rgba(0, 0, 0, 0.25)';
              e.currentTarget.style.border = '2px solid rgba(239, 68, 68, 0.5)';
              e.currentTarget.style.filter = 'brightness(1.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)';
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(59, 130, 246, 0.4), 0 4px 12px rgba(0, 0, 0, 0.3)';
              e.currentTarget.style.border = '2px solid rgba(239, 68, 68, 0.3)';
              e.currentTarget.style.filter = 'brightness(1)';
            }}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Gaming-Style Floating Export Button */}
      <button
        onClick={onExport}
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          width: '70px',
          height: '70px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #10b981, #059669)',
          color: 'white',
          border: '2px solid rgba(16, 185, 129, 0.3)',
          boxShadow: `
            0 0 30px rgba(16, 185, 129, 0.4),
            0 10px 30px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.2)
          `,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          zIndex: 10,
          filter: 'brightness(1)'
        }}
        title="Export Drawing"
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.15) translateY(-5px)';
          e.currentTarget.style.boxShadow = `
            0 0 40px rgba(16, 185, 129, 0.6),
            0 15px 40px rgba(0, 0, 0, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.3)
          `;
          e.currentTarget.style.filter = 'brightness(1.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = `
            0 0 30px rgba(16, 185, 129, 0.4),
            0 10px 30px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.2)
          `;
          e.currentTarget.style.filter = 'brightness(1)';
        }}
      >
        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      </button>
    </>
  );
};