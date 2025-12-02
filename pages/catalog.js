import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { getProductImage } from '../lib/imageMapper';

export default function Catalog() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showOfertas, setShowOfertas] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = async () => {
    try {
      // 🔥 Cambio aquí: usar /api/products/all en lugar de /api/products
      const response = await fetch('/api/products/all');
      const data = await response.json();
      
      if (data.success) {
        // Filtrar solo productos activos para el catálogo público
        const activeProducts = data.data.filter(p => p.activo === true);
        const productsWithQuantity = activeProducts.map(p => ({ ...p, quantity: 1 }));
        setProducts(productsWithQuantity);
        
        if (productsWithQuantity.length > 0) {
          const prices = productsWithQuantity.map(p => 
            p.descuento > 0 ? calcularPrecioConDescuento(p.precio, p.descuento) : p.precio
          );
          const minPrice = Math.min(...prices);
          const maxPrice = Math.max(...prices);
          setPriceRange({ min: minPrice, max: maxPrice });
        }
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
        // Filtrar solo categorías activas
        const activeCategories = data.data.filter(cat => cat.activa === true);
        setCategories(activeCategories);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories([]);
    }
  };

  const calcularPrecioConDescuento = (precioOriginal, descuento) => {
    return precioOriginal * (1 - descuento / 100);
  };

  const getPrecioFinal = (product) => {
    if (product.descuento > 0) {
      return calcularPrecioConDescuento(product.precio, product.descuento);
    }
    return product.precio;
  };

  const filteredProducts = products.filter(product => {
    const precioFinal = getPrecioFinal(product);
    const matchesSearch = product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.descripcion && product.descripcion.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         product.codigo.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategories = selectedCategories.length === 0 || 
                            selectedCategories.includes(product.categoria);
    
    const matchesOfertas = !showOfertas || product.oferta || product.descuento > 0;
    
    const matchesPrice = precioFinal >= priceRange.min && precioFinal <= priceRange.max;
    
    const categoryActive = categories.some(cat => 
      cat.nombre === product.categoria && cat.activa === true
    );
    
    return matchesSearch && matchesCategories && matchesOfertas && matchesPrice && categoryActive;
  });

  const toggleCategory = (categoryName) => {
    setSelectedCategories(prev => 
      prev.includes(categoryName)
        ? prev.filter(c => c !== categoryName)
        : [...prev, categoryName]
    );
  };

  const resetFilters = () => {
    setSelectedCategories([]);
    setShowOfertas(false);
    setSearchTerm('');
    
    if (products.length > 0) {
      const prices = products.map(p => getPrecioFinal(p));
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      setPriceRange({ min: minPrice, max: maxPrice });
    }
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setProducts(prev => prev.map(product => 
      product._id === productId 
        ? { ...product, quantity: newQuantity }
        : product
    ));
  };

  const handleAddToCart = (product) => {
    router.push('/login?redirect=/products');
  };

  const goToLogin = () => {
    router.push('/login?redirect=/products');
  };

  if (loading) {
    return (
      <div className="loading-full">
        <div className="spinner"></div>
        <p>Cargando catálogo...</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Catálogo - Mi Tienda</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="description" content="Explora nuestro catálogo de productos" />
      </Head>

      <div className="store-layout">
        <header className="store-header-compact">
          <div className="header-compact-left">
            <h1 className="store-title-compact">🛍️ Catálogo</h1>
          </div>
          
          <div className="header-compact-center">
            <div className="search-bar-compact">
              <input
                type="text"
                placeholder="Buscar por nombre, código o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input-compact"
              />
              <span className="search-icon">🔍</span>
            </div>
          </div>

          <div className="header-compact-right">
            <button className="btn btn-primary btn-sm" onClick={goToLogin}>
              🔐 Iniciar Sesión
            </button>
          </div>
        </header>

        <div className="store-main">
          <aside className="categories-sidebar">
            <div className="sidebar-section">
              <h3>🏷️ Categorías</h3>
              <div className="categories-list">
                <div 
                  className={`category-item ${selectedCategories.length === 0 ? 'active' : ''}`}
                  onClick={() => setSelectedCategories([])}
                >
                  Todas las categorías
                </div>
                {categories.map(category => (
                  <div
                    key={category._id}
                    className={`category-item ${selectedCategories.includes(category.nombre) ? 'active' : ''}`}
                    onClick={() => toggleCategory(category.nombre)}
                    title={category.descripcion || category.nombre}
                  >
                    <span className="category-name">{category.nombre}</span>
                    {selectedCategories.includes(category.nombre) && (
                      <span className="selected-check">✓</span>
                    )}
                    {category.descripcion && (
                      <div className="category-tooltip">
                        {category.descripcion}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="sidebar-section">
              <h3>🎯 Filtros</h3>
              <div className="filter-group">
                <label className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={showOfertas}
                    onChange={(e) => setShowOfertas(e.target.checked)}
                  />
                  <span>🔥 Solo ofertas</span>
                </label>
              </div>
              
              <button className="btn btn-secondary btn-sm btn-block" onClick={resetFilters}>
                🔄 Limpiar filtros
              </button>
            </div>
          </aside>

          <main className="products-main">
            <div className="products-header">
              <h2>Nuestros Productos</h2>
              <div className="products-stats">
                <span>
                  {filteredProducts.length} {filteredProducts.length === 1 ? 'producto' : 'productos'}
                  {searchTerm && ` encontrado${filteredProducts.length !== 1 ? 's' : ''}`}
                </span>
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="no-products">
                <div className="no-products-icon">
                  {searchTerm ? '🔍' : '😔'}
                </div>
                <h3>
                  {searchTerm 
                    ? 'No se encontraron resultados' 
                    : 'No hay productos disponibles'}
                </h3>
                <p>
                  {searchTerm 
                    ? `No encontramos productos que coincidan con "${searchTerm}"` 
                    : 'No hay productos con los filtros seleccionados'}
                </p>
                <button className="btn btn-primary" onClick={resetFilters}>
                  {searchTerm ? 'Limpiar búsqueda' : 'Mostrar todos los productos'}
                </button>
              </div>
            ) : (
              <div className="products-grid">
                {filteredProducts.map(product => {
                  const precioFinal = getPrecioFinal(product);
                  const tieneDescuento = product.descuento > 0;
                  
                  return (
                    <div key={product._id} className="product-card">
                      <div className="product-image-container">
                        <img 
                          src={product.imagen || getProductImage(product)}
                          alt={product.nombre}
                          className="product-image"
                          onError={(e) => {
                            e.target.src = getProductImage(product);
                          }}
                        />
                        {(product.oferta || tieneDescuento) && (
                          <div className="product-badge">
                            {tieneDescuento ? `-${product.descuento}%` : 'OFERTA'}
                          </div>
                        )}
                      </div>
                      
                      <div className="product-info">
                        <h3 
                          className="product-name"
                          title={product.descripcion || product.nombre}
                        >
                          {product.nombre}
                        </h3>
                        
                        <div className="product-price">
                          <span className="current-price">${precioFinal.toFixed(2)}</span>
                          {tieneDescuento && (
                            <span className="original-price">${product.precio.toFixed(2)}</span>
                          )}
                        </div>

                        {tieneDescuento && (
                          <div className="discount-info">
                            Ahorras ${(product.precio - precioFinal).toFixed(2)}
                          </div>
                        )}

                        <div className="product-stock">
                          <span className={`stock-indicator ${product.stock <= 10 ? 'low-stock' : ''}`}></span>
                          {product.stock} en stock
                          {product.stock <= 10 && product.stock > 0 && (
                            <span className="low-stock-badge">¡Quedan pocos!</span>
                          )}
                        </div>

                        {product.descripcion && (
                          <p className="product-description">
                            {product.descripcion}
                          </p>
                        )}

                        {product.descripcion && (
                          <div className="product-tooltip">
                            <strong>{product.nombre}</strong>
                            <p>{product.descripcion}</p>
                            {product.categoria && <small>Categoría: {product.categoria}</small>}
                            {product.codigo && <small style={{display: 'block', marginTop: '4px'}}>Código: {product.codigo}</small>}
                          </div>
                        )}

                        <div className="product-actions">
                          <div className="quantity-selector-full">
                            <button 
                              className="quantity-btn-full"
                              onClick={() => updateQuantity(product._id, (product.quantity || 1) - 1)}
                              disabled={(product.quantity || 1) <= 1}
                            >
                              -
                            </button>
                            <span className="quantity-number-full">
                              {product.quantity || 1}
                            </span>
                            <button 
                              className="quantity-btn-full"
                              onClick={() => updateQuantity(product._id, (product.quantity || 1) + 1)}
                              disabled={(product.quantity || 1) >= product.stock}
                            >
                              +
                            </button>
                          </div>

                          <button 
                            className="btn btn-primary add-to-cart-btn-full"
                            onClick={() => handleAddToCart(product)}
                            disabled={product.stock === 0}
                          >
                            {product.stock === 0 ? '❌ Sin Stock' : '🛒 Agregar'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>

          <aside className="cart-sidebar">
            <div className="cart-header">
              <h3>🛒 Carrito</h3>
            </div>

            <div className="cart-empty">
              <div className="empty-icon">🔒</div>
              <p>Inicia sesión para agregar productos al carrito</p>
              <button className="btn btn-primary" onClick={goToLogin}>
                🔐 Iniciar Sesión
              </button>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}

// Deshabilitar SSR
Catalog.getInitialProps = () => {
  return {};
};