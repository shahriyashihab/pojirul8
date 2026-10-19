/**
 * Safe link opener that works smoothly within iframe sandboxes
 */
export function safeOpenUrl(url: string): void {
  try {
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (err) {
    try {
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (e) {
      console.warn('Failed to open URL:', e);
    }
  }
}
