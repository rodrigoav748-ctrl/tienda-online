import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import dynamic from 'next/dynamic';

export default function AdminPanel() {
  const { user, isAdmin, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('products');
  
  // Estados para productos
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showProductForm, setShowProductForm] = useState(false);
  
  // Estados para categorías
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [productForm, setProductForm] = useState({
    codigo: '',
    nombre: '',
    precio: '',
    stock: '',
    descripcion: '',
    categoria: '',
    descuento: 0,
    peso: 0,
    imagen: ''
  });

  const [autoGenerateCode, setAutoGenerateCode] = useState(true);

  const generateProductCode = () => {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `PROD${timestamp}${random}`.toUpperCase();
  };

  useEffect(() => {
    if (autoGenerateCode && !editingProduct) {
      setProductForm(prev => ({
        ...prev,
        codigo: generateProductCode()
      }));
    }
  }, [autoGenerateCode, editingProduct]);

  const [categoryForm, setCategoryForm] = useState({
    nombre: '',
    descripcion: '',
    activa: true
  });

  // Efecto para filtrar productos
  useEffect(() => {
    let filtered = products;

    // Filtro por búsqueda
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        product.nombre.toLowerCase().includes(term) ||
        product.codigo.toLowerCase().includes(term) ||
        (product.descripcion && product.descripcion.toLowerCase().includes(term))
      );
    }

    // Filtro por categoría
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.categoria === selectedCategory);
    }

    // Filtro por estado
    if (statusFilter !== 'all') {
      const isActive = statusFilter === 'active';
      filtered = filtered.filter(product => product.activo === isActive);
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory, statusFilter]);

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
      setIsLoading(true);
      const response = await fetch('/api/products/all');
      const data = await response.json();
      if (data.success) {
        setProducts(data.data || []);
        setFilteredProducts(data.data || []);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      setMessage('❌ Error al cargar productos');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      if (data.success) {
        setCategories(data.data || []);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      setMessage('❌ Error al cargar categorías');
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!productForm.codigo || !productForm.nombre || !productForm.precio || !productForm.stock || !productForm.categoria) {
      setMessage('❌ Por favor complete todos los campos requeridos');
      return;
    }

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
        
        setTimeout(() => {
          setShowProductForm(false);
        }, 2000);
      } else {
        setMessage(`❌ ${data.error || data.message || 'Error al guardar el producto'}`);
      }
    } catch (error) {
      console.error('❌ Error saving product:', error);
      setMessage('❌ Error al guardar el producto');
    }
  };

  const ImageUploader = dynamic(
    () => import('../../components/ImageUploader'),
    {
      ssr: false,
      loading: () => (
        <div className="image-uploader-loading">
          <p>Cargando uploader...</p>
        </div>
      )
    }
  );

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!categoryForm.nombre.trim()) {
      setMessage('❌ El nombre de la categoría es requerido');
      return;
    }

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

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(categoryForm),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(`✅ Categoría ${editingCategory ? 'actualizada' : 'creada'} exitosamente`);
        loadCategories();
        resetCategoryForm();
        
        setTimeout(() => {
          setShowCategoryForm(false);
        }, 2000);
      } else {
        setMessage(`❌ ${data.error || data.message || 'Error al guardar la categoría'}`);
      }
    } catch (error) {
      setMessage(`❌ Error al guardar la categoría: ${error.message}`);
    }
  };

  const deleteProduct = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este producto? Esta acción no se puede deshacer.')) return;

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
    if (!confirm('¿Estás seguro de eliminar esta categoría? Los productos de esta categoría quedarán sin categoría.')) return;

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setMessage('❌ No estás autenticado');
        return;
      }

      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setMessage('✅ Categoría eliminada exitosamente');
        loadCategories();
      } else {
        setMessage(`❌ ${data.message || 'Error al eliminar la categoría'}`);
      }
    } catch (error) {
      setMessage(`❌ Error al eliminar la categoría: ${error.message}`);
    }
  };

  const editProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      codigo: product.codigo,
      nombre: product.nombre,
      precio: product.precio,
      stock: product.stock,
      descripcion: product.descripcion || '',
      categoria: product.categoria,
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
      setMessage(`❌ Error: ${error.message}`);
    }
  };

  const editCategory = (category) => {
    setEditingCategory(category);
    setCategoryForm({
      nombre: category.nombre,
      descripcion: category.descripcion || '',
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
      activa: true
    });
    setEditingCategory(null);
    setShowCategoryForm(false);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setStatusFilter('all');
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
        <header className="admin-header-compact">
          <div className="admin-header-content-compact">
            <h1>⚙️ Panel de Administración</h1>
            
            <div className="admin-tabs-inline">
              <button
                className={`admin-tab-inline ${activeTab === 'products' ? 'active' : ''}`}
                onClick={() => setActiveTab('products')}
              >
                📦 Productos
              </button>
              <button
                className={`admin-tab-inline ${activeTab === 'categories' ? 'active' : ''}`}
                onClick={() => setActiveTab('categories')}
              >
                🏷️ Categorías
              </button>
            </div>

            <button
              className="btn btn-secondary btn-sm"
              onClick={() => router.push('/products')}
            >
              ← Volver a Tienda
            </button>
          </div>
        </header>

        {message && (
          <div className={`admin-message ${message.includes('✅') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <div className="admin-content">
          {activeTab === 'products' && (
            <>
              <div className="admin-actions">
                <div className="admin-actions-left">
                  <button
                    className="btn btn-primary"
                    onClick={() => setShowProductForm(!showProductForm)}
                  >
                    {showProductForm ? '❌ Cancelar' : '➕ Nuevo Producto'}
                  </button>
                </div>
                <div className="admin-stats">
                  <span className="stat-item">
                    <strong>{filteredProducts.length}</strong> productos
                  </span>
                  <span className="stat-item">
                    <strong>{products.filter(p => p.activo).length}</strong> activos
                  </span>
                </div>
              </div>

              {/* BARRA DE BÚSQUEDA Y FILTROS */}
              <div className="search-filters-bar">
                <div className="search-box">
                  <input
                    type="text"
                    placeholder="🔍 Buscar producto por nombre, código o descripción..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                  {searchTerm && (
                    <button 
                      className="clear-search-btn"
                      onClick={() => setSearchTerm('')}
                      title="Limpiar búsqueda"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="filters-container">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">📂 Todas las categorías</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat.nombre}>{cat.nombre}</option>
                    ))}
                  </select>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">📊 Todos los estados</option>
                    <option value="active">✅ Activos</option>
                    <option value="inactive">⏸️ Inactivos</option>
                  </select>

                  {(searchTerm !== '' || selectedCategory !== 'all' || statusFilter !== 'all') && (
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={clearFilters}
                    >
                      🗑️ Limpiar filtros
                    </button>
                  )}
                </div>
              </div>

              {showProductForm && (
                <form onSubmit={handleProductSubmit} className="admin-form">
                  <h3>{editingProduct ? '✏️ Editar Producto' : '➕ Nuevo Producto'}</h3>
                  
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Código / Código de Barras *</label>
                      <input
                        type="text"
                        value={productForm.codigo}
                        onChange={(e) => setProductForm({...productForm, codigo: e.target.value.toUpperCase()})}
                        className="form-input"
                        required
                        disabled={!!editingProduct}
                        placeholder="PROD001 o código de barras"
                      />
                      <small style={{color: '#666', fontSize: '0.85rem'}}>
                        Acepta códigos de productos o códigos de barras
                      </small>
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
                        <option value="">📁 Seleccionar categoría...</option>
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
                  </div>

                  <div className="form-group">
                    <label className="form-label">Descripción</label>
                    <textarea
                      value={productForm.descripcion}
                      onChange={(e) => setProductForm({...productForm, descripcion: e.target.value})}
                      className="form-input"
                      rows="3"
                      placeholder="Descripción detallada del producto..."
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Imagen del Producto</label>
                    <ImageUploader
                      currentImage={productForm.imagen}
                      onImageUpload={(imageUrl) => {
                        setProductForm({...productForm, imagen: imageUrl});
                      }}
                    />
                    <small style={{color: '#666', fontSize: '0.85rem', display: 'block', marginTop: '8px'}}>
                      Sube una imagen desde tu computadora o arrastra y suelta aquí
                    </small>
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

              {isLoading ? (
                <div className="loading-table">
                  <div className="spinner"></div>
                  <p>Cargando productos...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="no-results">
                  <p>📭 No se encontraron productos</p>
                  {searchTerm && <p>Intenta con otros términos de búsqueda</p>}
                  <button 
                    className="btn btn-secondary"
                    onClick={clearFilters}
                  >
                    🗑️ Limpiar filtros
                  </button>
                </div>
              ) : (
                <div className="admin-table-container">
                  <div className="table-header-info">
                    <span>Mostrando {filteredProducts.length} de {products.length} productos</span>
                    {searchTerm && (
                      <span className="search-info">
                        Resultados para: "{searchTerm}"
                      </span>
                    )}
                  </div>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th>Precio</th>
                        <th>Stock</th>
                        <th>Categoría</th>
                        <th>Descuento</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map(product => (
                        <tr key={product._id} className={!product.activo ? 'inactive-row' : ''}>
                          <td>
                            <div className="product-name-cell">
                              <div className="product-image-preview">
                                {product.imagen ? (
                                  <img 
                                    src={product.imagen} 
                                    alt={product.nombre}
                                    className="product-thumbnail"
                                  />
                                ) : (
                                  <div className="no-image">📷</div>
                                )}
                              </div>
                              <div className="product-info">
                                <strong>{product.nombre}</strong>
                                <small className="product-code">{product.codigo}</small>
                                {product.descripcion && (
                                  <p className="product-description">
                                    {product.descripcion.length > 50 
                                      ? `${product.descripcion.substring(0, 50)}...` 
                                      : product.descripcion}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td>
                            <strong className="price-cell">
                              ${parseFloat(product.precio).toFixed(2)}
                            </strong>
                            {product.descuento > 0 && (
                              <div className="original-price">
                                <s>${(parseFloat(product.precio) / (1 - product.descuento/100)).toFixed(2)}</s>
                              </div>
                            )}
                          </td>
                          <td>
                            <span className={`stock-badge ${product.stock <= 5 ? 'low-stock' : product.stock <= 20 ? 'medium-stock' : 'high-stock'}`}>
                              {product.stock} unidades
                            </span>
                          </td>
                          <td>
                            <span className="category-badge">
                              {product.categoria}
                            </span>
                          </td>
                          <td>
                            {product.descuento > 0 ? (
                              <span className="discount-badge">
                                -{product.descuento}%
                              </span>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td>
                            <button
                              className={`status-toggle ${product.activo ? 'active' : 'inactive'}`}
                              onClick={() => toggleProductStatus(product)}
                              title={product.activo ? 'Click para desactivar' : 'Click para activar'}
                            >
                              {product.activo ? '✅ Activo' : '⏸️ Inactivo'}
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
              )}
            </>
          )}

          {activeTab === 'categories' && (
            <>
              <div className="admin-actions">
                <div className="admin-actions-left">
                  <button
                    className="btn btn-primary"
                    onClick={() => setShowCategoryForm(!showCategoryForm)}
                  >
                    {showCategoryForm ? '❌ Cancelar' : '➕ Nueva Categoría'}
                  </button>
                </div>
                <div className="admin-stats">
                  <span className="stat-item">
                    <strong>{categories.length}</strong> categorías
                  </span>
                  <span className="stat-item">
                    <strong>{categories.filter(c => c.activa).length}</strong> activas
                  </span>
                </div>
              </div>

              {showCategoryForm && (
                <form onSubmit={handleCategorySubmit} className="admin-form">
                  <h3>{editingCategory ? '✏️ Editar Categoría' : '➕ Nueva Categoría'}</h3>
                  
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Nombre *</label>
                      <input
                        type="text"
                        value={categoryForm.nombre}
                        onChange={(e) => setCategoryForm({...categoryForm, nombre: e.target.value})}
                        className="form-input"
                        required
                        placeholder="Ej: Electrónica, Ropa, Hogar"
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
                      placeholder="Descripción de la categoría..."
                    />
                  </div>

                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={categoryForm.activa}
                        onChange={(e) => setCategoryForm({...categoryForm, activa: e.target.checked})}
                      />
                      <span>Categoría activa (visible en la tienda)</span>
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
                <div className="table-header-info">
                  <span>Total: {categories.length} categorías</span>
                </div>
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
                        <td>
                          <strong>{category.nombre}</strong>
                        </td>
                        <td>
                          <div className="category-description">
                            {category.descripcion || '-'}
                          </div>
                        </td>
                        <td>
                          <button
                            className={`status-toggle ${category.activa ? 'active' : 'inactive'}`}
                            onClick={() => toggleCategoryStatus(category)}
                            title={category.activa ? 'Click para desactivar' : 'Click para activar'}
                          >
                            {category.activa ? '✅ Activa' : '⏸️ Inactiva'}
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
};