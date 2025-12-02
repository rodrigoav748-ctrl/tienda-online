import { useState, useEffect, useRef, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { getProductImage } from '../lib/imageMapper';

// Configuración de paginación
const ITEMS_PER_PAGE = 12; // Productos por carga
const LOAD_THRESHOLD = 200; // Pixeles antes del final para cargar más

export default function Catalog() {
  const [allProducts, setAllProducts] = useState([]); // Todos los productos
  const [displayedProducts, setDisplayedProducts] = useState([]); // Productos mostrados
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showOfertas, setShowOfertas] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalFilteredCount, setTotalFilteredCount] = useState(0);
  const router = useRouter();
  const observerRef = useRef();
  const loaderRef = useRef();

  // Cargar productos y categorías iniciales
  useEffect(() => {
    loadInitialProducts();
    loadCategories();
  }, []);

  // Observador para scroll infinito
  useEffect(() => {
    if (loadingMore || !hasMore || !loaderRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore && hasMore) {
          loadMoreProducts();
        }
      },
      { threshold: 0.1, rootMargin: `0px 0px ${LOAD_THRESHOLD}px 0px` }
    );

    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [loadingMore, hasMore, displayedProducts]);

  // Filtrar productos cuando cambian los filtros
  useEffect(() => {
    if (allProducts.length > 0) {
      filterAndPaginateProducts();
    }
  }, [allProducts, searchTerm, selectedCategories, showOfertas, priceRange]);

  const loadInitialProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products/all');
      const data = await response.json();
      
      if (data.success) {
        // Filtrar solo productos activos
        const activeProducts = data.data.filter(p => p.activo === true);
        const productsWithQuantity = activeProducts.map(p => ({ 
          ...p, 
          quantity: 1 
        }));
        
        setAllProducts(productsWithQuantity);
        
        // Calcular rango de precios
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
        const activeCategories = data.data.filter(cat => cat.activa === true);
        setCategories(activeCategories);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories([]);
    }
  };

  const filterAndPaginateProducts = useCallback(() => {
    // Resetear paginación al cambiar filtros
    setCurrentPage(1);
    
    // Filtrar productos
    const filtered = allProducts.filter(product => {
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

    setTotalFilteredCount(filtered.length);
    
    // Mostrar solo primera página
    const firstPageProducts = filtered.slice(0, ITEMS_PER_PAGE);
    setDisplayedProducts(firstPageProducts);
    setHasMore(filtered.length > ITEMS_PER_PAGE);
  }, [allProducts, searchTerm, selectedCategories, showOfertas, priceRange, categories]);

  const loadMoreProducts = () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    
    setTimeout(() => {
      const nextPage = currentPage + 1;
      const startIndex = 0; // Siempre recalcular desde el inicio debido a filtros
      const endIndex = nextPage * ITEMS_PER_PAGE;
      
      const filtered = allProducts.filter(product => {
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

      const nextProducts = filtered.slice(0, endIndex);
      setDisplayedProducts(nextProducts);
      setCurrentPage(nextPage);
      setHasMore(filtered.length > endIndex);
      setLoadingMore(false);
    }, 300); // Pequeño delay para mejor UX
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
    setCurrentPage(1);
    
    if (allProducts.length > 0) {
      const prices = allProducts.map(p => getPrecioFinal(p));
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      setPriceRange({ min: minPrice, max: maxPrice });
    }
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setAllProducts(prev => prev.map(product => 
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
              
              <div className="products-count-info">
                <small>
                  Mostrando {displayedProducts.length} de {totalFilteredCount} productos
                </small>
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
                  {totalFilteredCount} {totalFilteredCount === 1 ? 'producto' : 'productos'}
                  {searchTerm && ` encontrado${totalFilteredCount !== 1 ? 's' : ''}`}
                  {totalFilteredCount > displayedProducts.length && (
                    <span className="showing-count">
                      (mostrando {displayedProducts.length})
                    </span>
                  )}
                </span>
              </div>
            </div>

            {displayedProducts.length === 0 ? (
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
              <>
                <div className="products-grid">
                  {displayedProducts.map(product => {
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
                              {product.descripcion.length > 100 
                                ? `${product.descripcion.substring(0, 100)}...` 
                                : product.descripcion}
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

                {/* Elemento para detectar scroll */}
                <div ref={loaderRef} style={{ height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {loadingMore && (
                    <div className="loading-more">
                      <div className="spinner-small"></div>
                      <span>Cargando más productos...</span>
                    </div>
                  )}
                  {!hasMore && displayedProducts.length > 0 && (
                    <div className="end-of-catalog">
                      <p>🎉 ¡Has visto todos los productos!</p>
                    </div>
                  )}
                </div>
              </>
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

      <style jsx>{`
        .loading-more {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20px;
          color: #666;
        }
        
        .spinner-small {
          width: 30px;
          height: 30px;
          border: 3px solid #f3f3f3;
          border-top: 3px solid #3498db;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 10px;
        }
        
        .end-of-catalog {
          text-align: center;
          padding: 20px;
          color: #666;
          font-style: italic;
          border-top: 1px solid #eee;
          margin-top: 20px;
        }
        
        .products-count-info {
          margin: 10px 0;
          padding: 8px;
          background: #f8f9fa;
          border-radius: 4px;
          text-align: center;
          font-size: 0.9em;
          color: #666;
        }
        
        .showing-count {
          font-size: 0.9em;
          color: #666;
          margin-left: 5px;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}

// Deshabilitar SSR
Catalog.getInitialProps = () => {
  return {};
};