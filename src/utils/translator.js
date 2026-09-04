/**
 * 100% Free Client-side Translation Utility
 * Uses Google's open endpoint (zero billing, zero account requirements)
 * Seamless fallback to empty string if offline.
 */

export async function translateToEnglish(text) {
  if (!text || typeof text !== 'string' || !text.trim()) {
    return '';
  }

  const cleanText = text.trim();

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(cleanText)}`;
    const response = await fetch(url);
    if (!response.ok) return '';

    const data = await response.json();
    if (data && Array.isArray(data[0])) {
      const translated = data[0].map(chunk => chunk[0]).join('').trim();
      // If the translated output is identical to original (e.g. already English), return it or mark translated
      return translated;
    }
    return '';
  } catch (err) {
    // Offline or network error: gracefully fail with zero impact
    console.warn('Silent translation notice (offline/fallback):', err);
    return '';
  }
}
