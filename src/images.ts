import { luminance } from './model';

export function decodeImage(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const image = new Image();
    image.onload = () => { URL.revokeObjectURL(url); resolve(image); };
    image.onerror = () => { URL.revokeObjectURL(url); reject(new Error('imageDecodeError')); };
    image.src = url;
  });
}

export function canvasBlob(canvas: HTMLCanvasElement, type = 'image/png', quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('imageExportError')), type, quality));
}

export async function importImage(file: File) {
  if (file.size > 30 * 1024 * 1024) throw new Error('imageSizeError');
  if (!/^image\/(jpeg|png|webp|heic|heif)$/.test(file.type) && !/\.(jpe?g|png|webp|heic|heif)$/i.test(file.name)) {
    throw new Error('imageTypeError');
  }
  const decoded = await decodeImage(file);
  const scale = Math.min(1, 2400 / Math.max(decoded.naturalWidth, decoded.naturalHeight));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(decoded.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(decoded.naturalHeight * scale));
  const context = canvas.getContext('2d');
  if (!context) throw new Error('canvasError');
  context.imageSmoothingQuality = 'high';
  context.drawImage(decoded, 0, 0, canvas.width, canvas.height);
  const blob = await canvasBlob(canvas);
  const image = await decodeImage(blob);
  canvas.width = canvas.height = 1;
  const { palette, paletteByFrequency } = extractPalette(image);
  return { blob, image, palette, paletteByFrequency };
}

const PALETTE_SIZE = 6;

// Extracts up to PALETTE_SIZE representative colors from the photo. `palette` is sorted dark to
// light (used for background swatches and photo-derived text contrast elsewhere); `paletteByFrequency`
// keeps the same colors ordered by how common they are in the photo, most dominant first — the
// decorative palette widget uses this to pick and order which colors it shows.
export function extractPalette(image: HTMLImageElement): { palette: string[]; paletteByFrequency: string[] } {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 64;
  const context = canvas.getContext('2d', { willReadFrequently: true })!;
  context.fillStyle = '#f3f1ec';
  context.fillRect(0, 0, 64, 64);
  context.drawImage(image, 0, 0, 64, 64);
  const pixels = context.getImageData(0, 0, 64, 64).data;
  const buckets = new Map<string, { count: number; red: number; green: number; blue: number }>();
  for (let index = 0; index < pixels.length; index += 4) {
    const [red, green, blue] = [pixels[index], pixels[index + 1], pixels[index + 2]];
    const key = `${red >> 5},${green >> 5},${blue >> 5}`;
    const bucket = buckets.get(key) ?? { count: 0, red: 0, green: 0, blue: 0 };
    bucket.count++; bucket.red += red; bucket.green += green; bucket.blue += blue;
    buckets.set(key, bucket);
  }
  const candidates = [...buckets.values()].sort((first, second) => second.count - first.count)
    .map(bucket => [bucket.red, bucket.green, bucket.blue].map(channel => Math.round(channel / bucket.count)));
  const selected: number[][] = [];
  for (const candidate of candidates) {
    if (selected.every(existing => Math.hypot(...candidate.map((channel, index) => channel - existing[index])) > 48)) selected.push(candidate);
    if (selected.length === PALETTE_SIZE) break;
  }
  const base = selected[0] ?? [128, 128, 128];
  while (selected.length < PALETTE_SIZE) {
    const factor = (selected.length + 1) / (PALETTE_SIZE + 1);
    selected.push(base.map(channel => Math.round(channel + (255 - channel) * factor)));
  }
  const hexColors = selected.map(channels => '#' + channels.map(channel => channel.toString(16).padStart(2, '0')).join(''));
  return { paletteByFrequency: hexColors, palette: [...hexColors].sort((first, second) => luminance(first) - luminance(second)) };
}
