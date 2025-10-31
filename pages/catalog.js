import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { getProductImage } from '../lib/imageMapper';

export default function Catalog() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      if (data.success) {
        const activeProducts = data.data.filter(p => p.activo === true);
        setProducts(activeProducts);
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

  const getPrecioFinal = (product) => {
    if (product.descuento > 0) {
      return product.precio * (1 - product.descuento / 100);
    }
    return product.precio;
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategories = selectedCategories.length === 0 || 
                            selectedCategories.includes(product.categoria);
    
    const categoryActive = categories.some(cat => 
      cat.nombre === product.categoria && cat.activa === true
    );
    
    return matchesSearch && matchesCategories && categoryActive;
  });

  const toggleCategory = (categoryName) => {
    setSelectedCategories(prev => 
      prev.includes(categoryName)
        ? prev.filter(c => c !== categoryName)
        : [...prev, categoryName]
    );
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

      <div className="catalog-layout">
        <header className="catalog-header">
          <div className="catalog-header-content">
            <h1>🛍️ Catálogo de Productos</h1>
            
            <div className="catalog-search">
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input-compact"
              />
            </div>

            <button className="btn btn-primary" onClick={goToLogin}>
              🔐 Iniciar Sesión
            </button>
          </div>
        </header>

        <div className="catalog-main">
          <aside className="catalog-sidebar">
            <h3>🏷️ Categorías</h3>
            <div className="categories-list">
              <div 
                className={`category-item ${selectedCategories.length === 0 ? 'active' : ''}`}
                onClick={() => setSelectedCategories([])}
              >
                Todas
              </div>
              {categories.map(category => (
                <div
                  key={category._id}
                  className={`category-item ${selectedCategories.includes(category.nombre) ? 'active' : ''}`}
                  onClick={() => toggleCategory(category.nombre)}
                >
                  {category.nombre}
                  {selectedCategories.includes(category.nombre) && (
                    <span className="selected-check">✓</span>
                  )}
                </div>
              ))}
            </div>
          </aside>

          <main className="catalog-products">
            <div className="catalog-products-header">
              <h2>Productos Disponibles</h2>
              <p>{filteredProducts.length} productos</p>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="no-products">
                <div className="no-products-icon">😔</div>
                <h3>No hay productos</h3>
                <p>No encontramos productos con los filtros seleccionados</p>
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
                        {tieneDescuento && (
                          <div className="product-badge">
                            -{product.descuento}%
                          </div>
                        )}
                      </div>
                      
                      <div className="product-info">
                        <h3 className="product-name">{product.nombre}</h3>
                        
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
                          {product.stock} disponibles
                          {product.stock <= 10 && product.stock > 0 && (
                            <span className="low-stock-badge">¡Pocos!</span>
                          )}
                        </div>

                        {product.descripcion && (
                          <p className="product-description">
                            {product.descripcion}
                          </p>
                        )}

                        <button 
                          className="btn btn-primary btn-block"
                          onClick={goToLogin}
                        >
                          Iniciar sesión para comprar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>

        <div className="catalog-login-banner">
          <div className="banner-content">
            <h2>¿Listo para comprar?</h2>
            <p>Inicia sesión o crea una cuenta para agregar productos al carrito</p>
            <div className="banner-actions">
              <button className="btn btn-primary btn-lg" onClick={goToLogin}>
                Iniciar Sesión
              </button>
              <button className="btn btn-secondary btn-lg" onClick={() => router.push('/register')}>
                Crear Cuenta
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Deshabilitar SSR
Catalog.getInitialProps = () => {
  return {};
};