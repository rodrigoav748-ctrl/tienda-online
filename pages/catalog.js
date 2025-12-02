// pages/catalog.js (versión simplificada)
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
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const router = useRouter();

  useEffect(() => {
    loadPublicProducts();
    loadCategories();
  }, []);

  const loadPublicProducts = async () => {
    try {
      setLoading(true);
      // Usar límite pequeño para vista pública
      const response = await fetch('/api/products?limit=8');
      const data = await response.json();
      
      if (data.success) {
        const activeProducts = data.data.filter(p => p.activo === true);
        setProducts(activeProducts.slice(0, 6)); // Mostrar solo 6
        
        // Estimar total (puedes hacer otra llamada para obtener el total real)
        setTotalProducts(data.pagination.total || activeProducts.length);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  // ... resto de tus funciones loadCategories, calcularPrecioConDescuento, etc.

  const filteredProducts = products.filter(product => {
    // ... tu lógica de filtrado existente
    return true; // Simplificado
  });

  const goToLogin = () => {
    router.push('/login?redirect=/products&message=Accede+al+catálogo+completo');
  };

  if (loading) {
    return (
      <div className="loading-full">
        <div className="spinner"></div>
        <p>Cargando vista previa...</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Vista Previa - Mi Tienda</title>
        <meta name="description" content="Vista previa de nuestro catálogo. Regístrate para ver todos los productos." />
      </Head>

      <div className="catalog-container">
        <header className="catalog-header">
          <div className="header-content">
            <h1>🛍️ Catálogo de Productos</h1>
            <p className="subtitle">
              Vista previa - {filteredProducts.length} de {totalProducts}+ productos disponibles
            </p>
          </div>
          
          <div className="header-actions">
            <div className="search-box">
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="search-icon">🔍</span>
            </div>
            
            <div className="auth-buttons">
              <button className="btn-login" onClick={goToLogin}>
                Iniciar Sesión
              </button>
              <button 
                className="btn-register"
                onClick={() => router.push('/register?redirect=/products')}
              >
                Registrarse
              </button>
            </div>
          </div>
        </header>

        <div className="catalog-main">
          <aside className="catalog-sidebar">
            <div className="sidebar-card">
              <div className="card-icon">🔒</div>
              <h3>Acceso Limitado</h3>
              <p>Estás viendo una selección reducida</p>
              <button className="btn-unlock" onClick={goToLogin}>
                Desbloquear Catálogo Completo
              </button>
            </div>
            
            {/* Tus filtros existentes aquí */}
          </aside>

          <main className="catalog-products">
            <div className="products-grid">
              {filteredProducts.map((product, index) => (
                <div key={product._id} className="product-card preview-card">
                  {/* Tu contenido de producto aquí */}
                  
                  <div className="preview-banner">
                    <span>VISTA PREVIA</span>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Mensaje para ver más productos */}
            <div className="more-products-cta">
              <div className="cta-content">
                <h2>🔓 ¿Quieres ver más productos?</h2>
                <p>
                  Estás viendo solo {filteredProducts.length} de más de {totalProducts} productos disponibles.
                  <strong> Inicia sesión o regístrate para acceder a todo nuestro catálogo.</strong>
                </p>
                
                <div className="benefits">
                  <div className="benefit">
                    <span>📦</span>
                    <span>+{totalProducts - filteredProducts.length} productos más</span>
                  </div>
                  <div className="benefit">
                    <span>💰</span>
                    <span>Precios especiales</span>
                  </div>
                  <div className="benefit">
                    <span>🛒</span>
                    <span>Comprar online</span>
                  </div>
                  <div className="benefit">
                    <span>🎁</span>
                    <span>Ofertas exclusivas</span>
                  </div>
                </div>
                
                <div className="cta-actions">
                  <button className="cta-btn primary" onClick={goToLogin}>
                    Iniciar Sesión
                  </button>
                  <button 
                    className="cta-btn secondary"
                    onClick={() => router.push('/register?redirect=/products')}
                  >
                    Registrarme Gratis
                  </button>
                </div>
                
                <p className="cta-note">
                  El registro es rápido, seguro y sin compromiso
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>

      <style jsx>{`
        .catalog-container {
          min-height: 100vh;
          background: #f8f9fa;
        }
        
        .catalog-header {
          background: white;
          padding: 20px;
          border-bottom: 2px solid #e9ecef;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 20px;
        }
        
        .header-content h1 {
          margin: 0;
          color: #333;
        }
        
        .subtitle {
          color: #666;
          margin: 5px 0 0 0;
          font-size: 0.95em;
        }
        
        .header-actions {
          display: flex;
          gap: 15px;
          align-items: center;
          flex-wrap: wrap;
        }
        
        .search-box {
          position: relative;
        }
        
        .search-box input {
          padding: 10px 35px 10px 15px;
          border: 1px solid #ddd;
          border-radius: 25px;
          width: 250px;
        }
        
        .search-icon {
          position: absolute;
          right: 15px;
          top: 50%;
          transform: translateY(-50%);
          color: #666;
        }
        
        .auth-buttons {
          display: flex;
          gap: 10px;
        }
        
        .btn-login, .btn-register {
          padding: 10px 20px;
          border-radius: 25px;
          border: none;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }
        
        .btn-login {
          background: #3498db;
          color: white;
        }
        
        .btn-login:hover {
          background: #2980b9;
        }
        
        .btn-register {
          background: #2ecc71;
          color: white;
        }
        
        .btn-register:hover {
          background: #27ae60;
        }
        
        .catalog-main {
          display: flex;
          max-width: 1400px;
          margin: 0 auto;
          padding: 20px;
          gap: 20px;
        }
        
        .catalog-sidebar {
          flex: 0 0 250px;
        }
        
        .sidebar-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px;
          border-radius: 10px;
          text-align: center;
          margin-bottom: 20px;
        }
        
        .card-icon {
          font-size: 2.5em;
          margin-bottom: 10px;
        }
        
        .sidebar-card h3 {
          margin: 0 0 10px 0;
          color: white;
        }
        
        .sidebar-card p {
          opacity: 0.9;
          margin-bottom: 20px;
          font-size: 0.9em;
        }
        
        .btn-unlock {
          background: white;
          color: #667eea;
          border: none;
          padding: 10px 20px;
          border-radius: 25px;
          font-weight: 600;
          cursor: pointer;
          width: 100%;
          transition: all 0.3s;
        }
        
        .btn-unlock:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        
        .catalog-products {
          flex: 1;
        }
        
        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }
        
        .preview-card {
          position: relative;
          overflow: hidden;
        }
        
        .preview-banner {
          position: absolute;
          top: 10px;
          right: 10px;
          background: rgba(255, 107, 0, 0.9);
          color: white;
          padding: 5px 10px;
          border-radius: 15px;
          font-size: 0.75em;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .more-products-cta {
          background: white;
          border-radius: 15px;
          padding: 40px;
          text-align: center;
          box-shadow: 0 5px 20px rgba(0,0,0,0.1);
          border: 2px solid #3498db;
          margin-top: 40px;
        }
        
        .cta-content h2 {
          color: #333;
          margin-bottom: 15px;
        }
        
        .cta-content p {
          color: #666;
          max-width: 600px;
          margin: 0 auto 30px;
          line-height: 1.6;
        }
        
        .benefits {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 20px;
          margin: 30px 0;
        }
        
        .benefit {
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 120px;
        }
        
        .benefit span:first-child {
          font-size: 2em;
          margin-bottom: 10px;
        }
        
        .benefit span:last-child {
          font-size: 0.9em;
          color: #555;
        }
        
        .cta-actions {
          display: flex;
          justify-content: center;
          gap: 15px;
          margin: 30px 0 20px;
        }
        
        .cta-btn {
          padding: 12px 30px;
          border-radius: 25px;
          font-weight: 600;
          font-size: 1em;
          border: none;
          cursor: pointer;
          transition: all 0.3s;
        }
        
        .cta-btn.primary {
          background: #3498db;
          color: white;
        }
        
        .cta-btn.primary:hover {
          background: #2980b9;
          transform: translateY(-2px);
        }
        
        .cta-btn.secondary {
          background: #2ecc71;
          color: white;
        }
        
        .cta-btn.secondary:hover {
          background: #27ae60;
          transform: translateY(-2px);
        }
        
        .cta-note {
          color: #888;
          font-size: 0.9em;
          margin-top: 15px;
        }
        
        @media (max-width: 768px) {
          .catalog-header {
            flex-direction: column;
            text-align: center;
          }
          
          .catalog-main {
            flex-direction: column;
          }
          
          .catalog-sidebar {
            flex: none;
            width: 100%;
          }
          
          .cta-actions {
            flex-direction: column;
          }
          
          .cta-btn {
            width: 100%;
          }
        }
      `}</style>
    </>
  );
}

Catalog.getInitialProps = () => {
  return {};
};