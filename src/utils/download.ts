export function downloadCanvas(
  canvas: HTMLCanvasElement,
  filename: string,
  mimeType = 'image/png',
): Promise<void> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Failed to encode image for download.'));
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      // Give the browser a tick to start the download before revoking.
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      resolve();
    }, mimeType);
  });
}
