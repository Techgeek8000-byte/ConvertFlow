// ============================================================
// ConvertFlow — Image Converters
// Image conversion using Canvas API
// ============================================================

// Map of format names to MIME types
const FORMAT_TO_MIME: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  avif: 'image/avif',
  bmp: 'image/bmp',
  gif: 'image/gif',
  ico: 'image/x-icon',
  tiff: 'image/tiff',
  tif: 'image/tiff',
};

const SUPPORTED_OUTPUT_MIME = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/avif',
  'image/bmp',
]);

/**
 * Load a File into an HTMLImageElement
 */
function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Failed to load image: ${file.name}`));
    };
    img.src = url;
  });
}

/**
 * Draw an image onto a canvas, handling SVG sizing
 */
function drawImageToCanvas(img: HTMLImageElement, scale: number = 1): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas 2D context');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas;
}

/**
 * Convert canvas to Blob using the specified MIME type and quality.
 * Falls back to toDataURL when toBlob is not supported for the format.
 */
function canvasToBlob(canvas: HTMLCanvasElement, mimeType: string, quality: number = 0.92): Promise<Blob> {
  return new Promise((resolve, reject) => {
    // Try native toBlob first (works for png, jpeg, webp in most browsers)
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
          return;
        }

        // Fallback: use toDataURL and convert to blob
        try {
          const dataUrl = canvas.toDataURL(mimeType, quality);
          const byteString = atob(dataUrl.split(',')[1]);
          const ab = new ArrayBuffer(byteString.length);
          const ia = new Uint8Array(ab);
          for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
          }
          resolve(new Blob([ab], { type: mimeType }));
        } catch (e) {
          reject(new Error(`Format ${mimeType} is not supported by this browser`));
        }
      },
      mimeType,
      quality,
    );
  });
}

// -------------------------------------------------------
// Image Format Converter
// -------------------------------------------------------

export async function imageConvert(file: File, targetFormat: string, quality?: number): Promise<Blob> {
  const formatLower = targetFormat.toLowerCase().replace('.', '');
  const mimeType = FORMAT_TO_MIME[formatLower];

  if (!mimeType) {
    throw new Error(`Unsupported target format: ${targetFormat}`);
  }

  const img = await loadImageFromFile(file);
  const canvas = drawImageToCanvas(img);

  const q = mimeType === 'image/png' ? undefined : (quality ?? 0.92);

  const blob = await canvasToBlob(canvas, mimeType, q);

  // Verify the blob has the correct type; if not, try PNG as fallback
  if (blob.type && blob.type !== mimeType && SUPPORTED_OUTPUT_MIME.has(mimeType)) {
    // Re-attempt with PNG as universal fallback
    return canvasToBlob(canvas, 'image/png');
  }

  return blob;
}

// -------------------------------------------------------
// Image Compressor
// -------------------------------------------------------

export async function imageCompress(file: File, quality: number): Promise<Blob> {
  const q = Math.max(0, Math.min(100, quality)) / 100;

  const img = await loadImageFromFile(file);
  const canvas = drawImageToCanvas(img);

  // Determine output format based on input
  const inputMime = file.type || 'image/png';
  let outputMime = inputMime;

  // For formats that don't support quality, fall back to JPEG or WebP
  if (inputMime === 'image/png' || inputMime === 'image/bmp' || inputMime === 'image/gif') {
    outputMime = 'image/webp'; // WebP supports both lossy and transparency
  }

  if (!SUPPORTED_OUTPUT_MIME.has(outputMime)) {
    outputMime = 'image/jpeg';
  }

  return canvasToBlob(canvas, outputMime, q);
}

// -------------------------------------------------------
// Image to Base64
// -------------------------------------------------------

export function imageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read file as data URL'));
      }
    };
    reader.onerror = () => {
      reject(new Error(`Failed to read file: ${file.name}`));
    };
    reader.readAsDataURL(file);
  });
}

// -------------------------------------------------------
// Base64 to Image
// -------------------------------------------------------

export function base64ToImage(base64: string, filename?: string): { blob: Blob; name: string; error?: string } {
  try {
    // Handle both raw base64 and data URL format
    let mimeType = 'image/png';
    let base64Data = base64.trim();

    if (base64Data.startsWith('data:')) {
      const commaIndex = base64Data.indexOf(',');
      if (commaIndex === -1) {
        return { blob: new Blob(), name: '', error: 'Invalid data URL: missing comma separator' };
      }
      const meta = base64Data.slice(0, commaIndex);
      base64Data = base64Data.slice(commaIndex + 1);

      // Extract MIME type from data URL
      const mimeMatch = meta.match(/data:([^;]+)/);
      if (mimeMatch) {
        mimeType = mimeMatch[1];
      }
    }

    // Decode base64
    const byteString = atob(base64Data);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    const blob = new Blob([ab], { type: mimeType });

    // Determine file extension from MIME type
    const extMap: Record<string, string> = {
      'image/png': '.png',
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/webp': '.webp',
      'image/avif': '.avif',
      'image/bmp': '.bmp',
      'image/gif': '.gif',
      'image/svg+xml': '.svg',
      'image/tiff': '.tiff',
    };

    const ext = extMap[mimeType] || '.png';
    const name = filename || `converted${ext}`;

    return { blob, name };
  } catch (e) {
    return {
      blob: new Blob(),
      name: '',
      error: `Failed to decode Base64 image: ${e instanceof Error ? e.message : String(e)}`,
    };
  }
}

// -------------------------------------------------------
// SVG to PNG Rasterizer
// -------------------------------------------------------

export async function svgToPng(file: File, scale: number = 1): Promise<Blob> {
  // Validate that the file is an SVG
  if (!file.type.includes('svg') && !file.name.toLowerCase().endsWith('.svg')) {
    throw new Error('Input file must be an SVG image');
  }

  // Read the SVG content to get dimensions
  const svgText = await file.text();

  // Create a blob URL for the SVG
  const svgBlob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  try {
    const img = new Image();

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Failed to load SVG image'));
      img.src = url;
    });

    // Use the SVG's natural dimensions, or fall back to 300x150 if not specified
    const width = img.naturalWidth || 300;
    const height = img.naturalHeight || 150;

    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas 2D context');

    // White background (SVGs may have transparent backgrounds)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const blob = await canvasToBlob(canvas, 'image/png');

    URL.revokeObjectURL(url);
    return blob;
  } catch (e) {
    URL.revokeObjectURL(url);
    throw e;
  }
}