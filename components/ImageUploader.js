// components/ImageUploader.js
import { useState, useRef, useEffect } from 'react';

export default function ImageUploader({ currentImage, onImageUpload }) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (currentImage) {
      setPreviewUrl(currentImage);
    }
  }, [currentImage]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError('');

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleChange = (e) => {
    setError('');
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFile = async (file) => {
    // Validaciones
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Tipo de archivo no válido. Usa JPG, PNG, GIF o WebP');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('El archivo es muy grande. Máximo 5MB');
      return;
    }

    // Preview temporal
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target.result);
    };
    reader.readAsDataURL(file);

    // Subir a MongoDB
    await uploadToMongoDB(file);
  };

  const uploadToMongoDB = async (file) => {
    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al subir la imagen');
      }

      if (data.success) {
        // data.imageUrl será algo como: /api/uploads/507f1f77bcf86cd799439011
        setPreviewUrl(data.imageUrl);
        onImageUpload(data.imageUrl);
      } else {
        throw new Error(data.message || 'Error desconocido');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError(error.message);
      setPreviewUrl(currentImage || '');
    } finally {
      setUploading(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    setPreviewUrl('');
    onImageUpload('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {previewUrl ? (
        <div style={{
          border: '2px solid #e2e8f0',
          borderRadius: '12px',
          padding: '1.5rem',
          backgroundColor: '#f8fafc'
        }}>
          <div style={{
            position: 'relative',
            width: '100%',
            height: '200px',
            marginBottom: '1rem',
            borderRadius: '8px',
            overflow: 'hidden',
            backgroundColor: 'white'
          }}>
            <img 
              src={previewUrl} 
              alt="Preview" 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain'
              }}
              onError={(e) => {
                console.error('Error loading image:', previewUrl);
                e.target.style.display = 'none';
              }}
            />
          </div>
          <div style={{
            display: 'flex',
            gap: '0.75rem',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button 
              type="button" 
              onClick={handleButtonClick}
              disabled={uploading}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                opacity: uploading ? 0.6 : 1
              }}
            >
              {uploading ? 'Subiendo...' : 'Cambiar Imagen'}
            </button>
            <button 
              type="button" 
              onClick={handleRemoveImage}
              disabled={uploading}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                opacity: uploading ? 0.6 : 1
              }}
            >
              Eliminar
            </button>
          </div>
        </div>
      ) : (
        <div
          style={{
            border: `2px dashed ${dragActive ? '#3b82f6' : '#e2e8f0'}`,
            borderRadius: '12px',
            padding: '3rem 2rem',
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: dragActive ? '#eff6ff' : '#f8fafc',
            transition: 'all 0.3s ease',
            opacity: uploading ? 0.7 : 1
          }}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleButtonClick}
        >
          {uploading ? (
            <div>
              <div style={{
                width: '3rem',
                height: '3rem',
                border: '3px solid #e2e8f0',
                borderTop: '3px solid #3b82f6',
                borderRadius: '50%',
                margin: '0 auto 1rem',
                animation: 'spin 1s linear infinite'
              }} />
              <p style={{ color: '#666', margin: 0 }}>Subiendo imagen a MongoDB...</p>
            </div>
          ) : (
            <>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📸</div>
              <p style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                color: '#1e293b',
                margin: '0 0 0.5rem 0'
              }}>
                {dragActive ? 'Suelta la imagen aquí' : 'Arrastra una imagen aquí'}
              </p>
              <p style={{
                fontSize: '0.875rem',
                color: '#64748b',
                margin: '0 0 1rem 0'
              }}>
                o
              </p>
              <button
                type="button"
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Seleccionar Archivo
              </button>
              <p style={{
                fontSize: '0.75rem',
                color: '#94a3b8',
                margin: '1rem 0 0 0'
              }}>
                JPG, PNG, GIF o WebP (máx. 5MB)
              </p>
            </>
          )}
        </div>
      )}

      {error && (
        <div style={{
          marginTop: '1rem',
          padding: '0.75rem 1rem',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          color: '#dc2626',
          fontSize: '0.875rem'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        onChange={handleChange}
        style={{ display: 'none' }}
      />

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}