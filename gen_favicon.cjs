const fs = require('fs');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0D4F73"/>
      <stop offset="100%" stop-color="#041c28"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="12" fill="url(#bg)"/>
  <rect x="3" y="3" width="58" height="58" rx="10" fill="none" stroke="#00F5FF" stroke-width="1.5" opacity="0.6"/>
  <text x="32" y="44" font-family="Georgia, serif" font-size="30" font-weight="bold" fill="#00F5FF" text-anchor="middle" letter-spacing="-1">[G]</text>
</svg>`;

fs.writeFileSync('public/favicon.svg', svg);
console.log('SVG favicon created successfully');
