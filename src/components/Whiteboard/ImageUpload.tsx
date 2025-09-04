import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface ImageUploadProps {
  onImageUpload: (file: File) => void;
  isVisible: boolean;
  onClose: () => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageUpload,
  isVisible,
  onClose
}) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      onImageUpload(file);
      onClose();
    }
  }, [onImageUpload, onClose]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'],
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        backdropFilter: 'blur(5px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'rgba(31, 41, 55, 0.95)',
          borderRadius: '20px',
          padding: '40px',
          width: '90%',
          maxWidth: '500px',
          position: 'relative',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            color: 'rgba(255, 255, 255, 0.7)',
            cursor: 'pointer',
            fontSize: '24px',
            padding: '0',
            width: '30px',
            height: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
          }}
        >
          ×
        </button>

        <h2
          style={{
            color: 'white',
            marginBottom: '30px',
            fontSize: '24px',
            fontWeight: '600',
            textAlign: 'center',
          }}
        >
          Upload Image
        </h2>

        <div
          {...getRootProps()}
          style={{
            border: isDragActive ? '3px dashed #10b981' : '3px dashed rgba(255, 255, 255, 0.3)',
            borderRadius: '16px',
            padding: '60px 40px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            backgroundColor: isDragActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.03)',
            transform: isDragActive ? 'scale(1.02)' : 'scale(1)',
          }}
        >
          <input {...getInputProps()} />
          
          {/* Upload Icon */}
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke={isDragActive ? '#10b981' : 'rgba(255, 255, 255, 0.5)'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              margin: '0 auto 20px',
              transition: 'all 0.3s ease',
            }}
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>

          <p
            style={{
              color: isDragActive ? '#10b981' : 'white',
              fontSize: '18px',
              fontWeight: '500',
              marginBottom: '10px',
              transition: 'color 0.3s ease',
            }}
          >
            {isDragActive ? 'Drop your image here' : 'Drag & drop an image here'}
          </p>
          
          <p
            style={{
              color: 'rgba(255, 255, 255, 0.5)',
              fontSize: '14px',
              marginTop: '10px',
            }}
          >
            or click to browse files
          </p>
          
          <p
            style={{
              color: 'rgba(255, 255, 255, 0.3)',
              fontSize: '12px',
              marginTop: '20px',
            }}
          >
            Supports: PNG, JPG, GIF, WebP, SVG (Max 10MB)
          </p>
        </div>
      </div>
    </div>
  );
};