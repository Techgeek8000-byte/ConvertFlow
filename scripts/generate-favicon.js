// Generate favicon PNG and ICO from SVG
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, '..', 'public', 'favicon.svg');
const publicDir = path.join(__dirname, '..', 'public');

async function generate() {
  const svg = fs.readFileSync(svgPath);

  // 32x32 PNG
  await sharp(svg).resize(32, 32).png().toFile(path.join(publicDir, 'favicon-32x32.png'));
  // 16x16 PNG
  await sharp(svg).resize(16, 16).png().toFile(path.join(publicDir, 'favicon-16x16.png'));
  // 180x180 Apple touch icon
  await sharp(svg).resize(180, 180).png().toFile(path.join(publicDir, 'apple-touch-icon.png'));
  // 192x192 for PWA/manifest
  await sharp(svg).resize(192, 192).png().toFile(path.join(publicDir, 'icon-192.png'));
  // 512x512 for PWA
  await sharp(svg).resize(512, 512).png().toFile(path.join(publicDir, 'icon-512.png'));

  // ICO: combine 16x16 and 32x32 BMP headers
  const png16 = await sharp(svg).resize(16, 16).png().toBuffer();
  const png32 = await sharp(svg).resize(32, 32).png().toBuffer();

  // ICO header
  const icoHeader = Buffer.alloc(6);
  icoHeader.writeUInt16LE(0, 0);  // reserved
  icoHeader.writeUInt16LE(1, 2);  // type: 1 = ICO
  icoHeader.writeUInt16LE(2, 4);  // count: 2 images

  // Directory entries
  const entry16 = createDirEntry(png16, 16);
  const entry32 = createDirEntry(png32, 32);
  const offset = 6 + 16 + 16; // header + 2 entries

  // Update offsets
  entry16.writeUInt32LE(offset, 12);
  entry32.writeUInt32LE(offset + png16.length, 12);

  const ico = Buffer.concat([icoHeader, entry16, entry32, png16, png32]);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), ico);

  console.log('✅ Generated: favicon.ico, favicon-32x32.png, favicon-16x16.png, apple-touch-icon.png, icon-192.png, icon-512.png');
}

function createDirEntry(pngBuf, size) {
  const entry = Buffer.alloc(16);
  entry.writeUInt8(size, 0);          // width (0 = 256 for 256px)
  entry.writeUInt8(size, 1);          // height
  entry.writeUInt8(0, 2);             // palette
  entry.writeUInt8(0, 3);             // reserved
  entry.writeUInt16LE(1, 4);          // color planes
  entry.writeUInt16LE(32, 6);         // bits per pixel
  entry.writeUInt32LE(pngBuf.length, 8); // image size
  // offset filled later
  return entry;
}

generate().catch(err => { console.error(err); process.exit(1); });
