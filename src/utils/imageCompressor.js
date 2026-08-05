/**
 * Client-side Canvas Image Compression
 * Compress high-resolution images down to lightweight ~150KB - 250KB JPEG files
 * to guarantee 100% free Cloud Storage usage without exceeding limits.
 */
export async function compressImage(file, maxWidth = 900, maxHeight = 900, quality = 0.72) {
  return new Promise((resolve, reject) => {
    // If input is base64 string or already compressed data URL
    if (typeof file === 'string') {
      return resolve({ dataUrl: file, name: 'compressed_image.jpg', sizeKb: Math.round(file.length / 1024) });
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio preserving dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        // Quality rendering setup
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        const sizeKb = Math.round((dataUrl.length * 3) / 4 / 1024);

        resolve({
          dataUrl,
          name: file.name ? file.name.replace(/\.[^/.]+$/, "") + "_compressed.jpg" : 'polaroid_snapshot.jpg',
          sizeKb,
          width,
          height
        });
      };

      img.onerror = (error) => reject(error);
    };

    reader.onerror = (error) => reject(error);
  });
}

/**
 * Bulk compress array of files
 */
export async function compressImages(files) {
  const results = [];
  for (const file of files) {
    try {
      const compressed = await compressImage(file);
      results.push(compressed);
    } catch (err) {
      console.error('Error compressing image:', err);
    }
  }
  return results;
}
