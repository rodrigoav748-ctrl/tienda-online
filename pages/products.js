import { useState, useEffect, useRef, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { getProductImage } from '../lib/imageMapper';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showOfertas, setShowOfertas] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const { user, isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();
  const observer = useRef();

  // Observer para el último producto
  const lastProductRef = useCallback(node => {
    if (loadingMore) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loadingMore) {
        loadMoreProducts();
      }
    });

    if (node) observer.current.observe(node);
  }, [loadingMore, hasMore]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadInitialProducts();
      loadCategories();
      loadCart();
    }
  }, [isAuthenticated]);

  // Carga inicial de productos
  const loadInitialProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products?page=1&limit=12');
      const data = await response.json();
      
      if (data.success) {
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
        
        // Verificar si hay más productos
        setHasMore(data.pagination.hasMore);
        setCurrentPage(1);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar más productos
  const loadMoreProducts = async () => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const response = await fetch(`/api/products?page=${nextPage}&limit=12`);
      const data = await response.json();
      
      if (data.success) {
        const activeProducts = data.data.filter(p => p.activo === true);
        const productsWithQuantity = activeProducts.map(p => ({ ...p, quantity: 1 }));
        
        setProducts(prev => [...prev, ...productsWithQuantity]);
        setCurrentPage(nextPage);
        setHasMore(data.pagination.hasMore);
      }
    } catch (error) {
      console.error('Error loading more products:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories([]);
    }
  };

  const loadCart = () => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error('Error loading cart:', error);
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
                         product.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    
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
    setCurrentPage(1);
    setHasMore(true);
    loadInitialProducts();
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setProducts(prev => prev.map(product => 
      product._id === productId 
        ? { ...product, quantity: newQuantity }
        : product
    ));
  };

  const addToCart = (product) => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/products');
      return;
    }

    const quantity = product.quantity || 1;
    const precioFinal = getPrecioFinal(product);
    
    if (product.stock < quantity) {
      alert('No hay suficiente stock disponible');
      return;
    }

    const existingItem = cart.find(item => item.id === product._id);
    
    let newCart;
    if (existingItem) {
      newCart = cart.map(item =>
        item.id === product._id
          ? { 
              ...item, 
              quantity: item.quantity + quantity,
              price: precioFinal
            }
          : item
      );
    } else {
      newCart = [...cart, {
        id: product._id,
        name: product.nombre,
        price: precioFinal,
        originalPrice: product.precio,
        discount: product.descuento,
        quantity: quantity,
        stock: product.stock,
        image: product.imagen
      }];
    }
    
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const removeFromCart = (itemId) => {
    const newCart = cart.filter(item => item.id !== itemId);
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const clearCart = () => {
    if (confirm('¿Estás seguro de vaciar el carrito?')) {
      setCart([]);
      localStorage.removeItem('cart');
    }
  };

  const updateCartItemQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(itemId);
      return;
    }

    const item = cart.find(i => i.id === itemId);
    if (item && newQuantity > item.stock) {
      alert(`Solo hay ${item.stock} unidades disponibles`);
      return;
    }

    const newCart = cart.map(item =>
      item.id === itemId
        ? { ...item, quantity: newQuantity }
        : item
    );
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const proceedToPayment = () => {
    if (cart.length === 0) return;
    router.push('/checkout');
  };

  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  const ahorroTotal = cart.reduce((total, item) => {
    if (item.discount > 0) {
      const precioOriginal = item.originalPrice * item.quantity;
      const precioConDescuento = item.price * item.quantity;
      return total + (precioOriginal - precioConDescuento);
    }
    return total;
  }, 0);

  if (!isAuthenticated) {
    return (
      <div className="loading-full">
        <div className="spinner"></div>
        <p>Redirigiendo al login...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading-full">
        <div className="spinner"></div>
        <p>Cargando productos...</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Productos - Mi Tienda</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="description" content="Explora nuestro catálogo de productos" />
      </Head>

      <div className="store-layout">
        <header className="store-header-compact">
          <div className="header-compact-left">
            <h1 className="store-title-compact">🛍️ Tienda</h1>
          </div>
          
          <div className="header-compact-center">
            <div className="search-bar-compact">
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input-compact"
              />
              <span className="search-icon">🔍</span>
            </div>
          </div>

          <div className="header-compact-right">
            <UserDropdown user={user} isAdmin={isAdmin} />
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
              
              <button className="btn btn-secondary btn-sm" onClick={resetFilters}>
                🔄 Limpiar filtros
              </button>
            </div>
          </aside>

          <main className="products-main">
            <div className="products-header">
              <h2>Nuestros Productos</h2>
              <div className="products-stats">
                <span>{filteredProducts.length} productos</span>
                {hasMore && <span className="more-available">+ más disponibles</span>}
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="no-products">
                <div className="no-products-icon">😔</div>
                <h3>No hay productos</h3>
                <p>No encontramos productos con los filtros seleccionados</p>
                <button className="btn btn-primary" onClick={resetFilters}>
                  Mostrar todos los productos
                </button>
              </div>
            ) : (
              <>
                <div className="products-grid">
                  {filteredProducts.map((product, index) => {
                    const precioFinal = getPrecioFinal(product);
                    const tieneDescuento = product.descuento > 0;
                    const isLastProduct = index === filteredProducts.length - 1;
                    
                    return (
                      <div 
                        key={product._id} 
                        className="product-card"
                        ref={isLastProduct ? lastProductRef : null}
                      >
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
                              onClick={() => addToCart(product)}
                              disabled={product.stock === 0}
                            >
                              {product.stock === 0 ? 'Sin Stock' : ' Agregar'}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {loadingMore && (
                  <div className="loading-more">
                    <div className="spinner-small"></div>
                    <p>Cargando más productos...</p>
                  </div>
                )}

                {!hasMore && products.length > 0 && (
                  <div className="no-more-products">
                    <p>🎉 ¡Has visto todos nuestros productos!</p>
                  </div>
                )}
              </>
            )}
          </main>

          <aside className="cart-sidebar">
            <div className="cart-header">
              <h3>🛒 Carrito</h3>
              <div className="cart-items-count">{cart.length}</div>
            </div>

            {cart.length === 0 ? (
              <div className="cart-empty">
                <div className="empty-icon">🛒</div>
                <p>Tu carrito está vacío</p>
                <small>Agrega algunos productos</small>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map(item => (
                    <div key={item.id} className="cart-item">
                      <div className="item-image">
                        <img 
                          src={item.image || getProductImage({_id: item.id})} 
                          alt={item.name}
                          onError={(e) => {
                            e.target.src = getProductImage({_id: item.id});
                          }}
                        />
                      </div>
                      <div className="item-details">
                        <div className="item-name">{item.name}</div>
                        <div className="item-price">${item.price.toFixed(2)}</div>
                        
                        <div className="cart-quantity-control">
                          <button 
                            className="cart-qty-btn"
                            onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                          >
                            -
                          </button>
                          <input
                            type="number"
                            className="cart-qty-input"
                            value={item.quantity}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 1;
                              updateCartItemQuantity(item.id, val);
                            }}
                            min="1"
                            max={item.stock}
                          />
                          <button 
                            className="cart-qty-btn"
                            onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                          >
                            +
                          </button>
                        </div>

                        {item.discount > 0 && (
                          <div className="item-discount">-{item.discount}%</div>
                        )}
                      </div>
                      <div className="item-actions">
                        <div className="item-total">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                        <button 
                          className="btn-remove-item"
                          onClick={() => removeFromCart(item.id)}
                          title="Eliminar"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="cart-summary">
                  {ahorroTotal > 0 && (
                    <div className="savings-info">
                      <span>🎉 Ahorraste:</span>
                      <span>${ahorroTotal.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="cart-total">
                    <span>Total:</span>
                    <span className="total-amount">${cartTotal.toFixed(2)}</span>
                  </div>

                  <button 
                    className="btn btn-secondary btn-block btn-clear-cart"
                    onClick={clearCart}
                  >
                    Vaciar Carrito
                  </button>

                  <button 
                    className="btn btn-primary checkout-btn"
                    onClick={proceedToPayment}
                  >
                    Proceder al Pago →
                  </button>
                </div>
              </>
            )}
          </aside>
        </div>
      </div>

      <style jsx>{`
        .more-available {
          color: #666;
          font-size: 0.9em;
          margin-left: 10px;
        }

        .loading-more {
          text-align: center;
          padding: 40px 20px;
          color: #666;
        }

        .spinner-small {
          border: 3px solid #f3f3f3;
          border-top: 3px solid #3498db;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          animation: spin 1s linear infinite;
          margin: 0 auto 10px;
        }

        .no-more-products {
          text-align: center;
          padding: 30px;
          color: #888;
          font-style: italic;
          border-top: 1px solid #eee;
          margin-top: 20px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}

function UserDropdown({ user, isAdmin }) {
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
  };

  const goToProfile = () => {
    router.push('/account');
    setIsOpen(false);
  };

  const goToAdmin = () => {
    router.push('/admin');
    setIsOpen(false);
  };

  return (
    <div className="user-dropdown">
      <button 
        className="user-menu-btn"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="user-avatar">👤</span>
        <span className="user-name">{user.nombre}</span>
        <span className={`dropdown-arrow ${isOpen ? 'open' : ''}`}>▼</span>
      </button>

      {isOpen && (
        <div className="dropdown-menu">
          <button onClick={goToProfile} className="dropdown-item">
            <span className="item-icon">👤</span>
            Mi Cuenta
          </button>
          
          {isAdmin && (
            <button onClick={goToAdmin} className="dropdown-item">
              <span className="item-icon">⚙️</span>
              Panel Admin
            </button>
          )}
          
          <div className="dropdown-divider"></div>
          
          <button onClick={handleLogout} className="dropdown-item logout">
            <span className="item-icon">🚪</span>
            Cerrar Sesión
          </button>
        </div>
      )}
    </div>
  );
}

// CRÍTICO: Deshabilitar SSR para esta página
Products.getInitialProps = () => {
  return {};
};