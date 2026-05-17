import sharp from 'sharp'
import { readFileSync } from 'fs'

const svg = readFileSync('src/asset/tamil_english_app_icon.svg')

// Extract just the icon square (the viewBox is 680x680 but icon is 140,40 → 400x400)
// We'll render the full SVG and crop/resize to 1024x1024
await sharp(svg, { density: 300 })
  .resize(1024, 1024, { fit: 'contain', background: { r: 30, g: 27, b: 75, alpha: 1 } })
  .png()
  .toFile('resources/icon.png')

console.log('✓ resources/icon.png created (1024x1024)')
