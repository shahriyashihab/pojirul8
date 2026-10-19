/**
 * Image handling and compression utilities
 * Supports camera/gallery upload, client-side canvas compression to DataURL,
 * and reliable fallbacks for offline & static web hosting.
 */

export const FALLBACK_SVG_DATA =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="100%" height="100%" fill="%23f1f5f9"/><circle cx="200" cy="130" r="45" fill="%23059669" opacity="0.15"/><polygon points="200,95 225,145 175,145" fill="%23059669"/><text x="50%" y="210" font-family="sans-serif" font-size="16" font-weight="bold" fill="%23334155" text-anchor="middle">গো-খাদ্য পণ্য</text></svg>';

export const DEFAULT_PRODUCT_IMAGE =
  './images/product_wheat_bran_1792082237586.jpg';

export const PRESET_FEED_IMAGES = [
  {
    label: 'গমের ভুসি',
    category: 'গমের ভুসি',
    url: './images/product_wheat_bran_1792082237586.jpg',
  },
  {
    label: 'সরিষার খইল',
    category: 'খইল',
    url: './images/product_mustard_oilcake_1792082237453.jpg',
  },
  {
    label: 'দানাদার ফিড',
    category: 'ফিড',
    url: './images/product_pellet_feed_1792082238529.jpg',
  },
  {
    label: 'বুটের ছোলা ও ডাল',
    category: 'ছোলা ও ডাল',
    url: './images/product_bengal_gram_1792082239843.jpg',
  },
  {
    label: 'দোকানের দৃশ্য',
    category: 'অন্যান্য',
    url: './images/hero_cattle_feed_store_1792082237019.jpg',
  },
];

/**
 * Compresses an image file from user's gallery or camera into a compact JPEG base64 DataURL.
 * Keeps file size small (~40-80 KB) so it effortlessly saves in localStorage and Firestore.
 */
export async function compressImageFile(
  file: File,
  maxWidth = 700,
  maxHeight = 700,
  quality = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      return reject(new Error('দয়া করে শুধুমাত্র ছবি ফাইল (JPG, PNG, WEBP) নির্বাচন করুন।'));
    }

    const reader = new FileReader();

    reader.onerror = () => {
      reject(new Error('ছবি পড়তে সমস্যা হয়েছে। দয়া করে অন্য ছবি নির্বাচন করুন।'));
    };

    reader.onload = () => {
      const img = new Image();

      img.onerror = () => {
        // If image loading fails, resolve with raw data URL as fallback
        resolve(reader.result as string);
      };

      img.onload = () => {
        try {
          let { width, height } = img;

          // Calculate aspect-ratio preserved dimensions
          if (width > maxWidth || height > maxHeight) {
            if (width / height > maxWidth / maxHeight) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, width);
          canvas.height = Math.max(1, height);

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            return resolve(reader.result as string);
          }

          // Smooth rendering
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // Fill white background for transparent PNGs converted to JPEG
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Draw image
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          // Convert to JPEG data URL
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        } catch (err) {
          console.warn('Canvas compression error, using raw file data:', err);
          resolve(reader.result as string);
        }
      };

      img.src = reader.result as string;
    };

    reader.readAsDataURL(file);
  });
}
