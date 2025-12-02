// pages/admin/index.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else if (!isAdmin) {
      router.push('/');
    }
  }, [isAuthenticated, isAdmin, router]);

  const loadAllProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/products/all'); 
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.data); 
      } else {
        setError(data.error || 'Error desconocido al cargar productos.');
      }
    } catch (err) {
      setError('Error de red al conectar con la API.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      loadAllProducts();
    }
  }, [isAuthenticated, isAdmin]);

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="loading-full">
        <div className="spinner"></div>
        <p>Verificando credenciales...</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Panel de Administración</title>
      </Head>

      <div className="admin-container">
        <h1>⚙️ Panel de Administración de Productos</h1>
        
        {error && <div className="alert alert-danger">{error}</div>}

        {isLoading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Cargando todos los productos...</p>
          </div>
        ) : (
          <>
            <div className="admin-actions">
              <button 
                className="btn btn-primary"
                onClick={() => router.push('/admin/create-product')}
              >
                + Crear Nuevo Producto
              </button>
              <button className="btn btn-secondary" onClick={loadAllProducts}>
                🔄 Recargar Lista ({products.length})
              </button>
            </div>
            
            <div className="products-table-container">
              <h2>Listado de Productos ({products.length})</h2>
              
              <table className="admin-products-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Código</th>
                    <th>Precio</th>
                    <th>Stock</th>
                    <th>Activo</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product._id}>
                      <td>{product._id.substring(18)}...</td>
                      <td>{product.nombre}</td>
                      <td>{product.codigo}</td>
                      <td>${product.precio.toFixed(2)}</td>
                      <td>{product.stock}</td>
                      <td>{product.activo ? '✅ Sí' : '❌ No'}</td>
                      <td>
                        <button 
                          className="btn btn-info btn-sm"
                          onClick={() => router.push(`/admin/edit-product/${product._id}`)}
                        >
                          ✏️ Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </>
  );
}