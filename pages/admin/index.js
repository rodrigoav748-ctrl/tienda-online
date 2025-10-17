import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';

export default function Admin() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const { user, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAdmin) {
      router.push('/products');
      return;
    }
    loadProducts();
    loadCategories();
  }, [isAdmin, router]);

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/products?admin=true');
      const data = await response.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const generateProductCode = () => {
    return 'PROD_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    const formData = new FormData(e.target);
    
    const productData = {
      nombre: formData.get('nombre'),
      precio: parseFloat(formData.get('precio')),
      stock: parseInt(formData.get('stock')),
      descripcion: formData.get('descripcion'),
      categoria: formData.get('categoria'),
      oferta: formData.get('oferta') === 'on',
      activo: formData.get('activo') === 'on',
      peso: parseFloat(formData.get('peso')) || 0,
      descuento: parseInt(formData.get('descuento')) || 0
    };

    if (!editingProduct) {
      productData.codigo = generateProductCode();
    }

    if (!productData.nombre || !productData.precio || productData.stock === undefined) {
      setFormError('Por favor completa todos los campos requeridos');
      return;
    }

    if (productData.precio < 0) {
      setFormError('El precio no puede ser negativo');
      return;
    }

    if (productData.stock < 0) {
      setFormError('El stock no puede ser negativo');
      return;
    }

    if (productData.descuento < 0 || productData.descuento > 100) {
      setFormError('El descuento debe estar entre 0 y 100%');
      return;
    }

    try {
      const url = editingProduct 
        ? `/api/products/${editingProduct._id}`
        : '/api/products';
      
      const method = editingProduct ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      const data = await response.json();
      
      if (data.success) {
        setFormSuccess(editingProduct ? 'Producto actualizado exitosamente' : 'Producto creado exitosamente');
        await loadProducts();
        
        setTimeout(() => {
          setShowForm(false);
          setEditingProduct(null);
          setFormSuccess('');
          e.target.reset();
        }, 1000);
      } else {
        setFormError(data.error || 'Error al guardar el producto');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      setFormError('Error de conexión al servidor');
    }
  };

  const editProduct = (product) => {
    setEditingProduct(product);
    setShowForm(true);
    setFormError('');
    setFormSuccess('');
  };

  const toggleProductStatus = async (productId, currentStatus) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ activo: !currentStatus }),
      });

      const data = await response.json();
      if (data.success) {
        await loadProducts();
      } else {
        alert('Error al actualizar el producto: ' + data.error);
      }
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Error de conexión');
    }
  };

  const deleteProduct = async (productId) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) return;
    
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        await loadProducts();
      } else {
        alert('Error al eliminar el producto: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error de conexión');
    }
  };

  const goBack = () => {
    router.push('/products');
  };

  if (!user || !isAdmin) {
    return (
      <div className="loading-full">
        <div className="spinner"></div>
        <p>Verificando permisos...</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Panel de Administración</title>
      </Head>

      <div className="admin-container">
        <div className="admin-header">
          <div className="admin-header-left">
            <button className="btn-back" onClick={goBack}>
              ← Volver a Productos
            </button>
            <h1>⚙️ Panel de Administración</h1>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => {
              setEditingProduct(null);
              setShowForm(true);
              setFormError('');
              setFormSuccess('');
            }}
          >
            ➕ Agregar Producto
          </button>
        </div>

        <div className="admin-stats">
          <div className="stat-card">
            <div className="stat-number">{products.length}</div>
            <div className="stat-label">Total Productos</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{products.filter(p => p.activo).length}</div>
            <div className="stat-label">Productos Activos</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{products.filter(p => p.oferta).length}</div>
            <div className="stat-label">En Oferta</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{products.filter(p => p.stock === 0).length}</div>
            <div className="stat-label">Sin Stock</div>
          </div>
        </div>

        {showForm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2>{editingProduct ? 'Editar Producto' : 'Agregar Producto'}</h2>
                <button 
                  className="close-btn"
                  onClick={() => {
                    setShowForm(false);
                    setEditingProduct(null);
                    setFormError('');
                    setFormSuccess('');
                  }}
                >
                  ×
                </button>
              </div>
              
              {formError && (
                <div className="alert alert-error">
                  {formError}
                </div>
              )}
              
              {formSuccess && (
                <div className="alert alert-success">
                  {formSuccess}
                </div>
              )}

              <form onSubmit={handleSubmit} className="product-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Nombre del Producto *</label>
                    <input
                      type="text"
                      name="nombre"
                      defaultValue={editingProduct?.nombre}
                      required
                      placeholder="Ej: Smartphone Samsung Galaxy"
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Precio ($) *</label>
                    <input
                      type="number"
                      name="precio"
                      step="0.01"
                      min="0"
                      defaultValue={editingProduct?.precio}
                      required
                      placeholder="0.00"
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Stock *</label>
                    <input
                      type="number"
                      name="stock"
                      min="0"
                      defaultValue={editingProduct?.stock || 0}
                      required
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Categoría *</label>
                    <select name="categoria" defaultValue={editingProduct?.categoria || ''} required className="form-input">
                      <option value="">Seleccionar categoría</option>
                      {categories.map(cat => (
                        <option key={cat._id} value={cat.nombre}>
                          {cat.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Peso (kg)</label>
                    <input
                      type="number"
                      name="peso"
                      step="0.01"
                      min="0"
                      defaultValue={editingProduct?.peso || 0}
                      placeholder="0.00"
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">% Descuento</label>
                    <input
                      type="number"
                      name="descuento"
                      min="0"
                      max="100"
                      defaultValue={editingProduct?.descuento || 0}
                      placeholder="0-100"
                      className="form-input"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Descripción</label>
                  <textarea
                    name="descripcion"
                    rows="3"
                    defaultValue={editingProduct?.descripcion}
                    placeholder="Descripción detallada del producto..."
                    className="form-input"
                  ></textarea>
                </div>
                
                <div className="form-checkboxes">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="oferta"
                      defaultChecked={editingProduct?.oferta}
                    />
                    <span>¿En oferta?</span>
                  </label>
                  
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="activo"
                      defaultChecked={editingProduct?.activo !== false}
                    />
                    <span>Producto activo</span>
                  </label>
                </div>
                
                <div className="form-actions">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => {
                      setShowForm(false);
                      setEditingProduct(null);
                      setFormError('');
                      setFormSuccess('');
                    }}
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={!!formSuccess}
                  >
                    {editingProduct ? 'Actualizar' : 'Crear'} Producto
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="products-table-container">
          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>Cargando productos...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="no-products">
              <p>No hay productos registrados</p>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  setEditingProduct(null);
                  setShowForm(true);
                }}
              >
                ➕ Crear Primer Producto
              </button>
            </div>
          ) : (
            <table className="products-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Categoría</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product._id}>
                    <td>
                      <div className="product-cell">
                        <strong>{product.nombre}</strong>
                        <small>{product.descripcion}</small>
                        {product.descuento > 0 && (
                          <small className="discount-info">
                            🏷️ {product.descuento}% de descuento
                          </small>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="price-cell">
                        ${product.precio}
                        {product.descuento > 0 && (
                          <div className="discounted-price">
                            ${(product.precio * (1 - product.descuento / 100)).toFixed(2)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`stock-badge ${product.stock === 0 ? 'out-of-stock' : product.stock < 10 ? 'low-stock' : ''}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td>{product.categoria}</td>
                    <td>
                      <span className={`status-badge ${product.activo ? 'active' : 'inactive'}`}>
                        {product.activo ? 'Activo' : 'Inactivo'}
                      </span>
                      {product.oferta && <span className="oferta-badge">🔥 Oferta</span>}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn-edit"
                          onClick={() => editProduct(product)}
                          title="Editar producto"
                        >
                          ✏️
                        </button>
                        <button 
                          className="btn-toggle"
                          onClick={() => toggleProductStatus(product._id, product.activo)}
                          title={product.activo ? 'Desactivar producto' : 'Activar producto'}
                        >
                          {product.activo ? '❌' : '✅'}
                        </button>
                        <button 
                          className="btn-delete"
                          onClick={() => deleteProduct(product._id)}
                          title="Eliminar producto"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}