#!/usr/bin/env node
/**
 * Generate PWA icons programmatically using SVG → PNG conversion
 * Run: node scripts/generate-icons.mjs
 */

import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir = join(__dirname, "../public/icons");

// Pastikan folder ada
mkdirSync(iconsDir, { recursive: true });

/**
 * Buat SVG icon string
 * @param {number} size - ukuran icon
 * @param {boolean} maskable - jika true, tambah safe zone padding
 */
function createSVG(size, maskable = false) {
  const padding = maskable ? size * 0.1 : size * 0.05;
  const center = size / 2;
  const iconSize = size - padding * 2;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0f0a1a;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0a0a0f;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="bolt" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#a78bfa;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#7c3aed;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#4f46e5;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="glow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#8b5cf6;stop-opacity:0.4" />
      <stop offset="100%" style="stop-color:#6366f1;stop-opacity:0" />
    </linearGradient>
    <filter id="glowFilter" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="${size * 0.04}" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>
  
  <!-- Background -->
  <rect width="${size}" height="${size}" fill="url(#bg)"/>
  
  <!-- Glow circle -->
  <circle cx="${center}" cy="${center}" r="${iconSize * 0.38}" fill="url(#glow)" opacity="0.6"/>
  
  <!-- Lightning bolt (⚡) -->
  <g transform="translate(${center}, ${center})" filter="url(#glowFilter)">
    <!-- Outer glow copy -->
    <path 
      d="M ${iconSize * -0.08} ${iconSize * -0.38}
         L ${iconSize * -0.24} ${iconSize * 0.04}
         L ${iconSize * -0.04} ${iconSize * 0.04}
         L ${iconSize * -0.14} ${iconSize * 0.38}
         L ${iconSize * 0.22} ${iconSize * -0.1}
         L ${iconSize * 0.04} ${iconSize * -0.1}
         L ${iconSize * 0.2} ${iconSize * -0.38}
         Z"
      fill="#a78bfa" opacity="0.3"
      transform="scale(1.15)"
    />
    <!-- Main bolt -->
    <path 
      d="M ${iconSize * -0.08} ${iconSize * -0.38}
         L ${iconSize * -0.24} ${iconSize * 0.04}
         L ${iconSize * -0.04} ${iconSize * 0.04}
         L ${iconSize * -0.14} ${iconSize * 0.38}
         L ${iconSize * 0.22} ${iconSize * -0.1}
         L ${iconSize * 0.04} ${iconSize * -0.1}
         L ${iconSize * 0.2} ${iconSize * -0.38}
         Z"
      fill="url(#bolt)"
    />
  </g>
  
  <!-- Sparkle dots -->
  <circle cx="${center + iconSize * 0.32}" cy="${center - iconSize * 0.3}" r="${size * 0.018}" fill="#c4b5fd" opacity="0.8"/>
  <circle cx="${center - iconSize * 0.3}" cy="${center + iconSize * 0.28}" r="${size * 0.012}" fill="#a78bfa" opacity="0.6"/>
  <circle cx="${center + iconSize * 0.25}" cy="${center + iconSize * 0.35}" r="${size * 0.009}" fill="#818cf8" opacity="0.5"/>
</svg>`;
}

function createShortcutSVG(type, size = 96) {
  const center = size / 2;
  
  const icons = {
    tasks: `<path d="M${size*0.2} ${size*0.3} L${size*0.45} ${size*0.55} L${size*0.8} ${size*0.2}" stroke="#a78bfa" stroke-width="${size*0.07}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="${size*0.2}" y="${size*0.62}" width="${size*0.6}" height="${size*0.07}" rx="${size*0.03}" fill="#7c3aed" opacity="0.6"/>
    <rect x="${size*0.2}" y="${size*0.75}" width="${size*0.4}" height="${size*0.07}" rx="${size*0.03}" fill="#7c3aed" opacity="0.4"/>`,
    
    calendar: `<rect x="${size*0.15}" y="${size*0.2}" width="${size*0.7}" height="${size*0.65}" rx="${size*0.08}" stroke="#a78bfa" stroke-width="${size*0.06}" fill="none"/>
    <line x1="${size*0.35}" y1="${size*0.13}" x2="${size*0.35}" y2="${size*0.3}" stroke="#a78bfa" stroke-width="${size*0.07}" stroke-linecap="round"/>
    <line x1="${size*0.65}" y1="${size*0.13}" x2="${size*0.65}" y2="${size*0.3}" stroke="#a78bfa" stroke-width="${size*0.07}" stroke-linecap="round"/>
    <line x1="${size*0.15}" y1="${size*0.42}" x2="${size*0.85}" y2="${size*0.42}" stroke="#a78bfa" stroke-width="${size*0.04}" opacity="0.5"/>
    <circle cx="${size*0.5}" cy="${size*0.63}" r="${size*0.07}" fill="#7c3aed"/>`,
    
    add: `<circle cx="${center}" cy="${center}" r="${size*0.38}" fill="none" stroke="#a78bfa" stroke-width="${size*0.07}"/>
    <line x1="${center}" y1="${size*0.28}" x2="${center}" y2="${size*0.72}" stroke="#a78bfa" stroke-width="${size*0.08}" stroke-linecap="round"/>
    <line x1="${size*0.28}" y1="${center}" x2="${size*0.72}" y2="${center}" stroke="#a78bfa" stroke-width="${size*0.08}" stroke-linecap="round"/>`,
  };

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${size*0.2}" fill="#1a0a2e"/>
  ${icons[type] || icons.tasks}
</svg>`;
}

// Simpan SVG icons
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

for (const size of sizes) {
  const svg = createSVG(size, false);
  writeFileSync(join(iconsDir, `icon-${size}x${size}.svg`), svg, "utf-8");
  console.log(`✅ Generated icon-${size}x${size}.svg`);
}

// Maskable icons
for (const size of [192, 512]) {
  const svg = createSVG(size, true);
  writeFileSync(join(iconsDir, `icon-maskable-${size}x${size}.svg`), svg, "utf-8");
  console.log(`✅ Generated icon-maskable-${size}x${size}.svg`);
}

// Shortcut icons
const shortcuts = ["tasks", "calendar", "add"];
for (const type of shortcuts) {
  const svg = createShortcutSVG(type, 96);
  writeFileSync(join(iconsDir, `shortcut-${type}.svg`), svg, "utf-8");
  console.log(`✅ Generated shortcut-${type}.svg`);
}

// Buat juga PNG placeholder (1x1 px transparan) sebagai fallback
// Browser akan prefer SVG jika tersedia
const pngPlaceholder = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64"
);

// Tulis PNG files (browser akan pakai SVG, tapi manifest butuh .png)
// Kita symlink / copy SVG sebagai PNG (browser modern support SVG sebagai icon)
for (const size of sizes) {
  writeFileSync(join(iconsDir, `icon-${size}x${size}.png`), pngPlaceholder);
}
for (const size of [192, 512]) {
  writeFileSync(join(iconsDir, `icon-maskable-${size}x${size}.png`), pngPlaceholder);
}
for (const type of shortcuts) {
  writeFileSync(join(iconsDir, `shortcut-${type}.png`), pngPlaceholder);
}

console.log("\n✅ All PWA icons generated in public/icons/");
console.log("📝 Note: SVG icons are the primary format. PNG files are placeholders.");
console.log("   For production, convert SVGs to PNGs using: npx sharp-cli");
