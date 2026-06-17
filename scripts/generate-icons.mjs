// Genera iconos PWA placeholder (PNG de color solido con la marca) de forma
// reproducible, sin dependencias nativas. Reemplazar por arte final mas adelante.
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');
mkdirSync(publicDir, { recursive: true });

// Marca: emerald-600 (#059669) sobre el theme oscuro.
const COLOR = { r: 0x05, g: 0x96, b: 0x69, a: 0xff };

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = CRC_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

// Genera un PNG RGBA. `painter(x, y)` devuelve {r,g,b,a} por pixel.
function makePng(width, height, painter) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const bytesPerPixel = 4;
  const stride = width * bytesPerPixel;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    const rowStart = y * (stride + 1);
    raw[rowStart] = 0; // filter type none
    for (let x = 0; x < width; x++) {
      const p = rowStart + 1 + x * bytesPerPixel;
      const c = painter(x, y);
      raw[p] = c.r;
      raw[p + 1] = c.g;
      raw[p + 2] = c.b;
      raw[p + 3] = c.a;
    }
  }

  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const solidPng = (size) => makePng(size, size, () => COLOR);

const targets = [
  ['pwa-192x192.png', 192],
  ['pwa-512x512.png', 512],
  ['apple-touch-icon.png', 180],
];

for (const [name, size] of targets) {
  writeFileSync(join(publicDir, name), solidPng(size));
  console.log(`generado ${name} (${size}x${size})`);
}

const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="6" fill="#059669"/><path d="M9 21V11l7 6 7-6v10" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>\n`;
writeFileSync(join(publicDir, 'favicon.svg'), faviconSvg);
writeFileSync(join(publicDir, 'icon.svg'), faviconSvg);
console.log('generado favicon.svg + icon.svg');

// OG image 1200x630: degradado oscuro de marca (placeholder; reemplazar por arte).
const og = makePng(1200, 630, (x, y) => {
  const t = (x / 1200 + y / 630) / 2;
  return {
    r: Math.round(0x0f + (0x05 - 0x0f) * t),
    g: Math.round(0x17 + (0x96 - 0x17) * t),
    b: Math.round(0x2a + (0x69 - 0x2a) * t),
    a: 0xff,
  };
});
writeFileSync(join(publicDir, 'og-image.png'), og);
console.log('generado og-image.png (1200x630)');
