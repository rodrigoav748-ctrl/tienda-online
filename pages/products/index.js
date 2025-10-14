import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [expandedProduct, setExpandedProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(product => product.categoria === selectedCategory);

  const toggleDescription = (productId) => {
    setExpandedProduct(expandedProduct === productId ? null : productId);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Cargando productos...</p>
      </div>
    );
  }

  return (
    <div>
      <Head>
        <title>Productos - Mi Tienda</title>
      </Head>
      
      <main className="container">
        <h1>Nuestros Productos</h1>
        
        {/* Filtros por categoría */}
        <div className="category-filters">
          <button 
            className={`category-filter ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            Todos
          </button>
          {categories.map(category => (
            <button
              key={category._id}
              className={`category-filter ${selectedCategory === category.nombre ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.nombre)}
            >
              {category.nombre}
            </button>
          ))}
        </div>

        {/* Grid de productos */}
        <div className="products-grid">
          {filteredProducts.map(product => (
            <div key={product._id} className="product-card">
              <img 
                src={product.imagen} 
                alt={product.nombre}
                className="product-image"
                onError={(e) => {
                  e.target.src = '/images/placeholder.jpg';
                }}
              />
              
              <div className="product-info">
                <h3 className="product-name">{product.nombre}</h3>
                <p className="product-price">S/ {product.precio}</p>
                
                {product.oferta && (
                  <span className="product-oferta">¡En Oferta!</span>
                )}

                {/* Contador de cantidad */}
                <div className="quantity-selector">
                  <button className="quantity-btn">-</button>
                  <span className="quantity-number">1</span>
                  <button className="quantity-btn">+</button>
                </div>

                {/* Descripción expandible */}
                <div className="product-description">
                  <button 
                    className="description-toggle"
                    onClick={() => toggleDescription(product._id)}
                  >
                    {expandedProduct === product._id ? '▲' : '▼'} Descripción
                  </button>
                  
                  {expandedProduct === product._id && (
                    <div className="description-content">
                      <p>{product.descripcion}</p>
                      <p><strong>Stock:</strong> {product.stock} unidades</p>
                      <p><strong>Categoría:</strong> {product.categoria}</p>
                    </div>
                  )}
                </div>

                <button className="btn btn-primary btn-block">
                  Agregar al Carrito
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="no-products">
            <p>No hay productos en esta categoría.</p>
          </div>
        )}
      </main>
    </div>
  );
}