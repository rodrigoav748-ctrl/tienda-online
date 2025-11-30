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


const keywordImages = {
  'smartphone': '/images/products/phones.jpg',
  'laptop': '/images/products/computers.jpg',
  'tablet': '/images/products/tablets.jpg',
  'audífonos': '/images/products/audio.jpg',
  'tv': '/images/products/electronics.jpg',
  'playstation': '/images/products/gaming.jpg',
  'zapatillas': '/images/products/sports.jpg',
  'camisa': '/images/products/clothing.jpg'
};

export function getProductImage(product) {
  if (!product) return '/images/products/default.jpg';
  
  const productName = product.nombre?.toLowerCase() || '';
  const category = product.categoria || '';
  
  if (product.imagen && product.imagen !== '/images/placeholder.jpg') {
    return product.imagen;
  }
  
  for (const [keyword, image] of Object.entries(keywordImages)) {
    if (productName.includes(keyword.toLowerCase())) {
      return image;
    }
  }
  
  if (categoryImages[category]) {
    return categoryImages[category];
  }
  
  return generateImageFromId(product._id || product.id);
}

function generateImageFromId(productId) {
  if (!productId) return '/images/products/default.jpg';
  
  const idStr = productId.toString();
  let hash = 0;
  for (let i = 0; i < idStr.length; i++) {
    hash = ((hash << 5) - hash) + idStr.charCodeAt(i);
    hash = hash & hash;
  }
  
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