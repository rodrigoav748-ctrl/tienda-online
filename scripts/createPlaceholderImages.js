const fs = require('fs');
const path = require('path');

// Crear imágenes placeholder simples usando SVG
const createPlaceholderSVG = (text, color) => `
<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${color}"/>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" 
        font-family="Arial, sans-serif" font-size="24" fill="white" font-weight="bold">
    ${text}
  </text>
</svg>
`;

const images = [
  { name: 'default.jpg', text: 'PRODUCTO', color: '#2c5aa0' },
  { name: 'electronics.jpg', text: 'ELECTRÓNICA', color: '#4a90e2' },
  { name: 'computers.jpg', text: 'COMPUTACIÓN', color: '#50e3c2' },
  { name: 'phones.jpg', text: 'SMARTPHONES', color: '#b8e986' },
  { name: 'tablets.jpg', text: 'TABLETS', color: '#f5a623' },
  { name: 'audio.jpg', text: 'AUDIO', color: '#d0021b' },
  { name: 'home.jpg', text: 'HOGAR', color: '#bd10e0' },
  { name: 'sports.jpg', text: 'DEPORTES', color: '#7ed321' },
  { name: 'clothing.jpg', text: 'ROPA', color: '#9013fe' },
  { name: 'gaming.jpg', text: 'GAMING', color: '#8b572a' }
];

// Asegurarse que la carpeta existe
const imagesDir = path.join(process.cwd(), 'public', 'images', 'products');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Crear imágenes placeholder
images.forEach(({ name, text, color }) => {
  const svgContent = createPlaceholderSVG(text, color);
  const filePath = path.join(imagesDir, name);
  
  // Para SVG, guardar como archivo .svg o convertir a base64 para JPG
  // Por simplicidad, guardamos como SVG con extensión .jpg (funcionará en navegadores)
  fs.writeFileSync(filePath, svgContent);
  console.log(`✅ Creada: ${name}`);
});

console.log('🎉 Todas las imágenes placeholder creadas!');