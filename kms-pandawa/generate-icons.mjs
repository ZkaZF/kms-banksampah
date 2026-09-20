import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0d9488;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#059669;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="80" fill="url(#grad)"/>
  <path d="M128 160h256v32H128zM128 224h256v32H128zM128 288h192v32H128z" fill="white" opacity="0.9"/>
  <circle cx="400" cy="112" r="48" fill="white" opacity="0.2"/>
  <circle cx="112" cy="400" r="32" fill="white" opacity="0.15"/>
  <text x="256" y="380" font-family="system-ui, sans-serif" font-size="48" font-weight="bold" fill="white" text-anchor="middle" opacity="0.9">♻️</text>
</svg>
`;

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, 'public', 'icons');

async function generateIcons() {
  for (const size of sizes) {
    const pngPath = path.join(iconsDir, `icon-${size}.png`);
    await sharp(Buffer.from(svg))
      .resize(size, size)
      .png()
      .toFile(pngPath);
    console.log(`Generated ${pngPath}`);
  }
  
  // Also create a 192 and 512 specifically for the manifest
  await sharp(Buffer.from(svg))
    .resize(192, 192)
    .png()
    .toFile(path.join(iconsDir, 'icon-192.png'));
    
  await sharp(Buffer.from(svg))
    .resize(512, 512)
    .png()
    .toFile(path.join(iconsDir, 'icon-512.png'));
    
  console.log('All icons generated!');
}

generateIcons().catch(console.error);