import { useState } from 'react';
import Head from 'next/head';

export default function Upload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileSelect = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage('Por favor selecciona un archivo');
      return;
    }

    setUploading(true);
    setMessage('');

    // En una implementación real, aquí subirías el archivo a un servicio como Cloudinary
    // Por ahora simulamos la subida
    setTimeout(() => {
      setUploading(false);
      setMessage('✅ Imagen subida exitosamente (simulación)');
      setSelectedFile(null);
      document.getElementById('file-input').value = '';
    }, 2000);
  };

  return (
    <>
      <Head>
        <title>Subir Imágenes - Mi Tienda</title>
      </Head>

      <main className="container">
        <div className="upload-container">
          <h1>Subir Imágenes de Productos</h1>
          
          <div className="upload-card">
            <div className="upload-area">
              <input
                id="file-input"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="file-input"
              />
              <label htmlFor="file-input" className="file-label">
                {selectedFile ? selectedFile.name : 'Seleccionar Imagen'}
              </label>
            </div>

            {selectedFile && (
              <div className="file-preview">
                <img 
                  src={URL.createObjectURL(selectedFile)} 
                  alt="Vista previa" 
                  className="preview-image"
                />
              </div>
            )}

            <button 
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="btn btn-primary btn-block"
            >
              {uploading ? 'Subiendo...' : 'Subir Imagen'}
            </button>

            {message && (
              <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
                {message}
              </div>
            )}
          </div>

          <div className="upload-info">
            <h3>Instrucciones:</h3>
            <ul>
              <li>Formatos permitidos: JPG, PNG, WebP</li>
              <li>Tamaño máximo: 5MB</li>
              <li>Recomendado: 800x600 píxeles</li>
            </ul>
          </div>
        </div>
      </main>
    </>
  );
}