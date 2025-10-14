// Mapeo de categorías a imágenes
const categoryImages = {
  'Electrónica': '/images/products/electronics.jpg',
  'Computación': '/images/products/computers.jpg',
  'Smartphones': '/images/products/phones.jpg',
  'Tablets': '/images/products/tablets.jpg',
  'Audio': '/images/products/audio.jpg',
  'Hogar': '/images/products/home.jpg',
  'Deportes': '/images/products/sports.jpg',
  'Ropa': '/images/products/clothing.jpg',
  'Gaming': '/images/products/gaming.jpg',
  'Wearables': '/images/products/electronics.jpg',
  'General': '/images/products/default.jpg'
};

// Mapeo de palabras clave en nombres a imágenes
const keywordImages = {
  // Teléfonos y smartphones
  'iphone': '/images/products/phones.jpg',
  'samsung': '/images/products/phones.jpg',
  'smartphone': '/images/products/phones.jpg',
  'celular': '/images/products/phones.jpg',
  'galaxy': '/images/products/phones.jpg',
  'xiaomi': '/images/products/phones.jpg',
  'huawei': '/images/products/phones.jpg',
  'motorola': '/images/products/phones.jpg',
  
  // Laptops y computadoras
  'laptop': '/images/products/computers.jpg',
  'macbook': '/images/products/computers.jpg',
  'notebook': '/images/products/computers.jpg',
  'computadora': '/images/products/computers.jpg',
  'hp': '/images/products/computers.jpg',
  'dell': '/images/products/computers.jpg',
  'lenovo': '/images/products/computers.jpg',
  'pavilion': '/images/products/computers.jpg',
  'asus': '/images/products/computers.jpg',
  
  // Tablets
  'tablet': '/images/products/tablets.jpg',
  'ipad': '/images/products/tablets.jpg',
  
  // Audio
  'audífonos': '/images/products/audio.jpg',
  'airpods': '/images/products/audio.jpg',
  'sony': '/images/products/audio.jpg',
  'parlante': '/images/products/audio.jpg',
  'altavoz': '/images/products/audio.jpg',
  'headphones': '/images/products/audio.jpg',
  'bocina': '/images/products/audio.jpg',
  
  // TV y pantallas
  'tv': '/images/products/electronics.jpg',
  'televisor': '/images/products/electronics.jpg',
  'pantalla': '/images/products/electronics.jpg',
  'monitor': '/images/products/computers.jpg',
  'lg': '/images/products/electronics.jpg',
  
  // Gaming
  'playstation': '/images/products/gaming.jpg',
  'xbox': '/images/products/gaming.jpg',
  'nintendo': '/images/products/gaming.jpg',
  'consola': '/images/products/gaming.jpg',
  'videojuego': '/images/products/gaming.jpg',
  'ps5': '/images/products/gaming.jpg',
  'switch': '/images/products/gaming.jpg',
  
  // Wearables
  'smartwatch': '/images/products/electronics.jpg',
  'apple watch': '/images/products/electronics.jpg',
  'reloj': '/images/products/electronics.jpg',
  'fitness': '/images/products/electronics.jpg',
  'watch': '/images/products/electronics.jpg',
  
  // Deportes
  'zapatillas': '/images/products/sports.jpg',
  'tenis': '/images/products/sports.jpg',
  'running': '/images/products/sports.jpg',
  'deportivo': '/images/products/sports.jpg',
  'fútbol': '/images/products/sports.jpg',
  'balón': '/images/products/sports.jpg',
  'pelota': '/images/products/sports.jpg',
  'raqueta': '/images/products/sports.jpg',
  
  // Ropa
  'camisa': '/images/products/clothing.jpg',
  'polo': '/images/products/clothing.jpg',
  'jeans': '/images/products/clothing.jpg',
  'zapatos': '/images/products/clothing.jpg',
  'ropa': '/images/products/clothing.jpg',
  'moda': '/images/products/clothing.jpg',
  'vestido': '/images/products/clothing.jpg',
  'falda': '/images/products/clothing.jpg',
  'pantalón': '/images/products/clothing.jpg',
  
  // Hogar
  'refrigerador': '/images/products/home.jpg',
  'cocina': '/images/products/home.jpg',
  'lavadora': '/images/products/home.jpg',
  'microondas': '/images/products/home.jpg',
  'aspiradora': '/images/products/home.jpg',
  'mueble': '/images/products/home.jpg',
  'cama': '/images/products/home.jpg',
  'sofá': '/images/products/home.jpg',
  'mesa': '/images/products/home.jpg'
};

// Función principal para obtener imagen
export function getProductImage(product) {
  if (!product) return '/images/products/default.jpg';
  
  const productName = product.nombre?.toLowerCase() || '';
  const category = product.categoria || '';
  
  // 1. Si el producto ya tiene una imagen asignada, usarla
  if (product.imagen && product.imagen !== '/images/placeholder.jpg') {
    return product.imagen;
  }
  
  // 2. Buscar por palabras clave en el nombre
  for (const [keyword, image] of Object.entries(keywordImages)) {
    if (productName.includes(keyword.toLowerCase())) {
      return image;
    }
  }
  
  // 3. Buscar por categoría
  if (categoryImages[category]) {
    return categoryImages[category];
  }
  
  // 4. Generar imagen basada en ID (fallback)
  return generateImageFromId(product._id || product.id);
}

// Función para generar imagen consistente basada en ID
function generateImageFromId(productId) {
  if (!productId) return '/images/products/default.jpg';
  
  // Convertir ID a número para consistencia
  const idStr = productId.toString();
  let hash = 0;
  for (let i = 0; i < idStr.length; i++) {
    hash = ((hash << 5) - hash) + idStr.charCodeAt(i);
    hash = hash & hash; // Convertir a 32-bit integer
  }
  
  // Usar el hash para seleccionar imagen consistente
  const images = [
    '/images/products/electronics.jpg',
    '/images/products/computers.jpg',
    '/images/products/phones.jpg',
    '/images/products/tablets.jpg',
    '/images/products/audio.jpg',
    '/images/products/home.jpg',
    '/images/products/sports.jpg',
    '/images/products/clothing.jpg',
    '/images/products/gaming.jpg'
  ];
  
  const index = Math.abs(hash) % images.length;
  return images[index];
}

// Función para obtener todas las imágenes disponibles (para el admin)
export function getAvailableImages() {
  return [
    '/images/products/default.jpg',
    '/images/products/electronics.jpg',
    '/images/products/computers.jpg',
    '/images/products/phones.jpg',
    '/images/products/tablets.jpg',
    '/images/products/audio.jpg',
    '/images/products/home.jpg',
    '/images/products/sports.jpg',
    '/images/products/clothing.jpg',
    '/images/products/gaming.jpg'
  ];
}

// Función para manejar errores de carga de imágenes
export function handleImageError(e) {
  e.target.src = '/images/products/default.jpg';
  e.target.onerror = null; // Prevenir bucles infinitos
}