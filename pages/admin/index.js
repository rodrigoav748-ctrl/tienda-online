import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { getProductImage, getAvailableImages } from '../../lib/imageMapper';

export default function AdminPanel() {
  const { user, isAdmin, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('products');
  
  // Estados para productos
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showProductForm, setShowProductForm] = useState(false);
  
  // Estados para categorías
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [productForm, setProductForm] = useState({
    codigo: '',
    nombre: '',
    precio: '',
    stock: '',
    descripcion: '',
    categoria: '',
    oferta: false,
    descuento: 0,
    peso: 0,
    imagen: ''
  });

  const [categoryForm, setCategoryForm] = useState({
    nombre: '',
    descripcion: '',
    imagen: '',
    activa: true
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    } else if (!loading && !isAdmin) {
      router.push('/products');
    }
  }, [loading, isAuthenticated, isAdmin, router]);

  useEffect(() => {
    if (isAdmin) {
      loadProducts();
      loadCategories();
    }
  }, [isAdmin]);

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
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories?admin=true');
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const url = editingProduct 
        ? `/api/products/${editingProduct._id}`
        : '/api/products';
      
      const method = editingProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productForm),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(`✅ Producto ${editingProduct ? 'actualizado' : 'creado'} exitosamente`);
        loadProducts();
        resetProductForm();
      } else {
        setMessage(`❌ ${data.error || data.message}`);
      }
    } catch (error) {
      setMessage('❌ Error al guardar el producto');
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setMessage('❌ No estás autenticado. Por favor inicia sesión nuevamente.');
        return;
      }

      const url = editingCategory 
        ? `/api/categories/${editingCategory._id}`
        : '/api/categories';
      
      const method = editingCategory ? 'PUT' : 'POST';

      console.log('Enviando request a:', url);
      console.log('Método:', method);
      console.log('Datos:', categoryForm);

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(categoryForm),
      });

      const data = await response.json();
      console.log('Respuesta:', data);

      if (data.success) {
        setMessage(`✅ Categoría ${editingCategory ? 'actualizada' : 'creada'} exitosamente`);
        loadCategories();
        resetCategoryForm();
      } else {
        setMessage(`❌ ${data.error || data.message}`);
      }
    } catch (error) {
      console.error('Error completo:', error);
      setMessage(`❌ Error al guardar la categoría: ${error.message}`);
    }
  };

  const deleteProduct = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setMessage('✅ Producto eliminado exitosamente');
        loadProducts();
      } else {
        setMessage('❌ Error al eliminar el producto');
      }
    } catch (error) {
      setMessage('❌ Error al eliminar el producto');
    }
  };

  const deleteCategory = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta categoría?')) return;

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setMessage('❌ No estás autenticado');
        return;
      }

      console.log('Eliminando categoría:', id);

      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      console.log('Respuesta eliminación:', data);

      if (data.success) {
        setMessage('✅ Categoría eliminada exitosamente');
        loadCategories();
      } else {
        setMessage(`❌ ${data.message || 'Error al eliminar la categoría'}`);
      }
    } catch (error) {
      console.error('Error al eliminar:', error);
      setMessage(`❌ Error al eliminar la categoría: ${error.message}`);
    }
  };

  const editProduct = (product) => {
    console.log('Editando producto:', product);
    setEditingProduct(product);
    setProductForm({
      codigo: product.codigo,
      nombre: product.nombre,
      precio: product.precio,
      stock: product.stock,
      descripcion: product.descripcion || '',
      categoria: product.categoria,
      oferta: product.oferta || false,
      descuento: product.descuento || 0,
      peso: product.peso || 0,
      imagen: product.imagen || ''
    });
    setShowProductForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleProductStatus = async (product) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setMessage('❌ No estás autenticado');
        return;
      }

      const newStatus = !product.activo;
      console.log(`Cambiando estado de ${product.nombre} a:`, newStatus);

      const response = await fetch(`/api/products/${product._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          activo: newStatus
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(`✅ Producto ${newStatus ? 'activado' : 'desactivado'} exitosamente`);
        loadProducts();
      } else {
        setMessage(`❌ ${data.error || data.message}`);
      }
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      setMessage(`❌ Error: ${error.message}`);
    }
  };

  const editCategory = (category) => {
    console.log('Editando categoría:', category);
    setEditingCategory(category);
    setCategoryForm({
      nombre: category.nombre,
      descripcion: category.descripcion || '',
      imagen: category.imagen || '',
      activa: category.activa !== undefined ? category.activa : true
    });
    setShowCategoryForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleCategoryStatus = async (category) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setMessage('❌ No estás autenticado');
        return;
      }

      const newStatus = !category.activa;
      console.log(`Cambiando estado de ${category.nombre} a:`, newStatus);

      const response = await fetch(`/api/categories/${category._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          activa: newStatus
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(`✅ Categoría ${newStatus ? 'activada' : 'desactivada'} exitosamente`);
        loadCategories();
      } else {
        setMessage(`❌ ${data.error || data.message}`);
      }
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      setMessage(`❌ Error: ${error.message}`);
    }
  };

  const resetProductForm = () => {
    setProductForm({
      codigo: '',
      nombre: '',
      precio: '',
      stock: '',
      descripcion: '',
      categoria: '',
      oferta: false,
      descuento: 0,
      peso: 0,
      imagen: ''
    });
    setEditingProduct(null);
    setShowProductForm(false);
  };

  const resetCategoryForm = () => {
    setCategoryForm({
      nombre: '',
      descripcion: '',
      imagen: '',
      activa: true
    });
    setEditingCategory(null);
    setShowCategoryForm(false);
  };

  if (!isAuthenticated || loading) {
    return (
      <div className="loading-full">
        <div className="spinner"></div>
        <p>Cargando...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="loading-full">
        <div className="spinner"></div>
        <p>Acceso denegado...</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Panel de Administración - Mi Tienda</title>
      </Head>

      <div className="admin-container">
        <header className="admin-header">
          <div className="admin-header-content">
            <h1>⚙️ Panel de Administración</h1>
            <button 
              className="btn btn-secondary"
              onClick={() => router.push('/products')}
            >
              ← Volver a la Tienda
            </button>
          </div>
        </header>

        <div className="admin-tabs">
          <button 
            className={`admin-tab ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            📦 Productos
          </button>
          <button 
            className={`admin-tab ${activeTab === 'categories' ? 'active' : ''}`}
            onClick={() => setActiveTab('categories')}
          >
            🏷️ Categorías
          </button>
        </div>

        {message && (
          <div className={`admin-message ${message.includes('✅') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <div className="admin-content">
          {activeTab === 'products' && (
            <>
              <div className="admin-actions">
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowProductForm(!showProductForm)}
                >
                  {showProductForm ? '❌ Cancelar' : '➕ Nuevo Producto'}
                </button>
              </div>

              {showProductForm && (
                <form onSubmit={handleProductSubmit} className="admin-form">
                  <h3>{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</h3>
                  
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Código *</label>
                      <input
                        type="text"
                        value={productForm.codigo}
                        onChange={(e) => setProductForm({...productForm, codigo: e.target.value})}
                        className="form-input"
                        required
                        disabled={!!editingProduct}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Nombre *</label>
                      <input
                        type="text"
                        value={productForm.nombre}
                        onChange={(e) => setProductForm({...productForm, nombre: e.target.value})}
                        className="form-input"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Precio *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={productForm.precio}
                        onChange={(e) => setProductForm({...productForm, precio: e.target.value})}
                        className="form-input"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Stock *</label>
                      <input
                        type="number"
                        value={productForm.stock}
                        onChange={(e) => setProductForm({...productForm, stock: e.target.value})}
                        className="form-input"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Categoría *</label>
                      <select
                        value={productForm.categoria}
                        onChange={(e) => setProductForm({...productForm, categoria: e.target.value})}
                        className="form-input"
                        required
                      >
                        <option value="">Seleccionar...</option>
                        {categories.map(cat => (
                          <option key={cat._id} value={cat.nombre}>{cat.nombre}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Descuento (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={productForm.descuento}
                        onChange={(e) => setProductForm({...productForm, descuento: e.target.value})}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Peso (kg)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={productForm.peso}
                        onChange={(e) => setProductForm({...productForm, peso: e.target.value})}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Imagen</label>
                      <select
                        value={productForm.imagen}
                        onChange={(e) => setProductForm({...productForm, imagen: e.target.value})}
                        className="form-input"
                      >
                        <option value="">Imagen automática</option>
                        {getAvailableImages().map(img => (
                          <option key={img} value={img}>{img}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Descripción</label>
                    <textarea
                      value={productForm.descripcion}
                      onChange={(e) => setProductForm({...productForm, descripcion: e.target.value})}
                      className="form-input"
                      rows="3"
                    />
                  </div>

                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={productForm.oferta}
                        onChange={(e) => setProductForm({...productForm, oferta: e.target.checked})}
                      />
                      <span>Marcar como oferta</span>
                    </label>
                  </div>

                  <div className="form-actions">
                    <button type="button" className="btn btn-secondary" onClick={resetProductForm}>
                      Cancelar
                    </button>
                    <button type="submit" className="btn btn-primary">
                      {editingProduct ? '💾 Actualizar' : '➕ Crear'} Producto
                    </button>
                  </div>
                </form>
              )}

              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Precio</th>
                      <th>Stock</th>
                      <th>Categoría</th>
                      <th>Descuento</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(product => (
                      <tr key={product._id} className={!product.activo ? 'inactive-row' : ''}>
                        <td>
                          <div className="product-name-cell">
                            <strong>{product.nombre}</strong>
                            <small className="product-code">{product.codigo}</small>
                          </div>
                        </td>
                        <td><strong>${product.precio.toFixed(2)}</strong></td>
                        <td>{product.stock}</td>
                        <td>{product.categoria}</td>
                        <td>{product.descuento > 0 ? `${product.descuento}%` : '-'}</td>
                        <td>
                          <button 
                            className={`status-toggle ${product.activo ? 'active' : 'inactive'}`}
                            onClick={() => toggleProductStatus(product)}
                            title={product.activo ? 'Click para desactivar' : 'Click para activar'}
                          >
                            {product.activo ? '✓ Activo' : '✗ Inactivo'}
                          </button>
                        </td>
                        <td>
                          <div className="table-actions">
                            <button 
                              className="btn-icon btn-edit"
                              onClick={() => editProduct(product)}
                              title="Editar producto"
                            >
                              ✏️
                            </button>
                            <button 
                              className="btn-icon btn-delete"
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
              </div>
            </>
          )}

          {activeTab === 'categories' && (
            <>
              <div className="admin-actions">
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowCategoryForm(!showCategoryForm)}
                >
                  {showCategoryForm ? '❌ Cancelar' : '➕ Nueva Categoría'}
                </button>
              </div>

              {showCategoryForm && (
                <form onSubmit={handleCategorySubmit} className="admin-form">
                  <h3>{editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}</h3>
                  
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Nombre *</label>
                      <input
                        type="text"
                        value={categoryForm.nombre}
                        onChange={(e) => setCategoryForm({...categoryForm, nombre: e.target.value})}
                        className="form-input"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Imagen URL</label>
                      <input
                        type="text"
                        value={categoryForm.imagen}
                        onChange={(e) => setCategoryForm({...categoryForm, imagen: e.target.value})}
                        className="form-input"
                        placeholder="/images/category-placeholder.jpg"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Descripción</label>
                    <textarea
                      value={categoryForm.descripcion}
                      onChange={(e) => setCategoryForm({...categoryForm, descripcion: e.target.value})}
                      className="form-input"
                      rows="3"
                    />
                  </div>

                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={categoryForm.activa}
                        onChange={(e) => setCategoryForm({...categoryForm, activa: e.target.checked})}
                      />
                      <span>Categoría activa</span>
                    </label>
                  </div>

                  <div className="form-actions">
                    <button type="button" className="btn btn-secondary" onClick={resetCategoryForm}>
                      Cancelar
                    </button>
                    <button type="submit" className="btn btn-primary">
                      {editingCategory ? '💾 Actualizar' : '➕ Crear'} Categoría
                    </button>
                  </div>
                </form>
              )}

              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Descripción</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map(category => (
                      <tr key={category._id} className={!category.activa ? 'inactive-row' : ''}>
                        <td>{category.nombre}</td>
                        <td>{category.descripcion || '-'}</td>
                        <td>
                          <button 
                            className={`status-toggle ${category.activa ? 'active' : 'inactive'}`}
                            onClick={() => toggleCategoryStatus(category)}
                            title={category.activa ? 'Click para desactivar' : 'Click para activar'}
                          >
                            {category.activa ? '✓ Activa' : '✗ Inactiva'}
                          </button>
                        </td>
                        <td>
                          <div className="table-actions">
                            <button 
                              className="btn-icon btn-edit"
                              onClick={() => editCategory(category)}
                              title="Editar"
                            >
                              ✏️
                            </button>
                            <button 
                              className="btn-icon btn-delete"
                              onClick={() => deleteCategory(category._id)}
                              title="Eliminar"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

// CRÍTICO: Deshabilitar SSR
AdminPanel.getInitialProps = () => {
  return {};
}