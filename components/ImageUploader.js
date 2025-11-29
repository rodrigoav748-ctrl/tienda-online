// components/ImageUploader.js - VERSIÓN CORREGIDA PARA BUILD
import { useState, useRef, useEffect } from 'react';

export default function ImageUploader({ currentImage, onImageUpload }) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef(null);

  // Solo ejecutar en el cliente
  useEffect(() => {
    setMounted(true);
    setPreviewUrl(currentImage || '');
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

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    setError('');
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file) => {
    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Tipo de archivo no válido. Usa JPG, PNG, GIF o WebP');
      return;
    }

    // Validar tamaño (5MB máximo)
    if (file.size > 5 * 1024 * 1024) {
      setError('El archivo es muy grande. Máximo 5MB');
      return;
    }

    // Mostrar preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target.result);
    };
    reader.readAsDataURL(file);

    // Subir archivo
    await uploadFile(file);
  };

  const uploadFile = async (file) => {
    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setPreviewUrl(data.imageUrl);
        onImageUpload(data.imageUrl);
      } else {
        setError(data.message || 'Error al subir la imagen');
        setPreviewUrl(currentImage || '');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error al subir la imagen');
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

  // No renderizar hasta que esté montado en el cliente
  if (!mounted) {
    return (
      <div style={{
        border: '2px dashed #ccc',
        borderRadius: '8px',
        padding: '40px 20px',
        textAlign: 'center',
        backgroundColor: '#f9f9f9'
      }}>
        <p style={{ color: '#666', margin: 0 }}>Cargando...</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      {previewUrl ? (
        // Preview de la imagen subida
        <div style={{
          border: '2px solid #e0e0e0',
          borderRadius: '8px',
          padding: '15px',
          backgroundColor: '#f9f9f9'
        }}>
          <div style={{
            position: 'relative',
            width: '100%',
            height: '200px',
            marginBottom: '15px',
            borderRadius: '6px',
            overflow: 'hidden',
            backgroundColor: '#fff'
          }}>
            <img
              src={previewUrl}
              alt="Preview"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain'
              }}
            />
          </div>
          <div style={{
            display: 'flex',
            gap: '10px',
            justifyContent: 'center'
          }}>
            <button
              type="button"
              onClick={handleButtonClick}
              style={{
                padding: '8px 16px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Cambiar Imagen
            </button>
            <button
              type="button"
              onClick={handleRemoveImage}
              style={{
                padding: '8px 16px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Eliminar
            </button>
          </div>
        </div>
      ) : (
        // Zona de drag & drop
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${dragActive ? '#007bff' : '#ccc'}`,
            borderRadius: '8px',
            padding: '40px 20px',
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: dragActive ? '#f0f8ff' : '#f9f9f9',
            transition: 'all 0.3s ease'
          }}
          onClick={handleButtonClick}
        >
          {uploading ? (
            <div>
              <div style={{
                width: '40px',
                height: '40px',
                border: '4px solid #f3f3f3',
                borderTop: '4px solid #007bff',
                borderRadius: '50%',
                margin: '0 auto 15px',
                animation: 'spin 1s linear infinite'
              }} />
              <p style={{ color: '#666', margin: 0 }}>Subiendo imagen...</p>
            </div>
          ) : (
            <>
              <div style={{ fontSize: '48px', marginBottom: '15px' }}>
                📸
              </div>
              <p style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#333',
                margin: '0 0 8px 0'
              }}>
                {dragActive ? 'Suelta la imagen aquí' : 'Arrastra una imagen aquí'}
              </p>
              <p style={{
                fontSize: '14px',
                color: '#666',
                margin: '0 0 12px 0'
              }}>
                o
              </p>
              <button
                type="button"
                style={{
                  padding: '10px 24px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                Seleccionar Archivo
              </button>
              <p style={{
                fontSize: '12px',
                color: '#999',
                margin: '12px 0 0 0'
              }}>
                JPG, PNG, GIF o WebP (máx. 5MB)
              </p>
            </>
          )}
        </div>
      )}

      {error && (
        <div style={{
          marginTop: '10px',
          padding: '10px',
          backgroundColor: '#fee',
          border: '1px solid #fcc',
          borderRadius: '4px',
          color: '#c00',
          fontSize: '14px'
        }}>
          {error}
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