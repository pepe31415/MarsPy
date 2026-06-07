#!/usr/bin/env node
// Opcionalmente si aún no se disponen de las imágenes de insignias, este script tiene como propósito generar badges SVG
// de prueba automáticamente cuando aún no se tienen las imágenes reales de las insignias.
// node generate-placeholders.js

const fs = require('fs')
const path = require('path')

const badges = [
  { file: 'Insignia_n1_n2.png', name: '💨', color: '#00bcd4' },
  { file: 'Insignia_n3_n4.png', name: '🚨', color: '#4caf50' },
  { file: 'Insignia_n5_n6.png', name: '📦', color: '#ff5722' },
  { file: 'Insignia_n7_n8.png', name: '📡', color: '#ff9800' },
  { file: 'Insignia_n9.png', name: '🏆', color: '#ffd740' },
]

badges.forEach(({ file, name, color }) => {
  const svg = `<svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="g" cx="50%" cy="40%">
      <stop offset="0%" stop-color="${color}" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="${color}" stop-opacity="0.05"/>
    </radialGradient>
  </defs>
  <circle cx="64" cy="64" r="58" fill="url(#g)" stroke="${color}" stroke-width="2" opacity="0.8"/>
  <circle cx="64" cy="64" r="45" fill="none" stroke="${color}" stroke-width="1" opacity="0.4"/>
  <text x="64" y="78" text-anchor="middle" font-size="44" font-family="sans-serif">${name}</text>
</svg>`

  const outPath = path.join(__dirname, '..', 'backend', 'assets', 'badges', file.replace('.png', '.svg'))
  fs.writeFileSync(outPath, svg)
  console.log(`Created ${outPath}`)
})

console.log('✅ Placeholder assets generated!')
console.log('Note: Update the DB seed to use .svg extension, or replace with real .png files')
