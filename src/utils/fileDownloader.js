/**
 * File Downloader Utility
 * Supports downloading images (base64 dataUrl, Firebase Storage URLs, Blob URLs)
 * directly to device storage on both mobile (iOS/Android) and desktop (Mac/Windows).
 */
export async function downloadImage(url, filename = 'lettersforlater_photo.jpg') {
  if (!url) return;

  // Clean filename extension if needed
  const cleanName = filename.endsWith('.jpg') || filename.endsWith('.png') || filename.endsWith('.jpeg') || filename.endsWith('.webp')
    ? filename
    : `${filename}.jpg`;

  try {
    // 1. If it's a base64 data URL
    if (url.startsWith('data:')) {
      const link = document.createElement('a');
      link.href = url;
      link.download = cleanName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return true;
    }

    // 2. If it's a remote URL (e.g. Firebase Storage)
    const response = await fetch(url, { mode: 'cors' });
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = cleanName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up memory
    setTimeout(() => {
      window.URL.revokeObjectURL(blobUrl);
    }, 1500);

    return true;
  } catch (err) {
    console.warn('Direct blob download failed, falling back to direct download link:', err);
    
    // Fallback: trigger link or open in new tab
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.download = cleanName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  }
}
