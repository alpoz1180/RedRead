/**
 * Generate ultra-premium dark share card using Canvas API
 * Returns a Blob for sharing/downloading
 */
export async function generateShareImage(params: {
  insight: string;
  date: string;
  streak: number;
  avgMood: number;
}): Promise<Blob> {
  const { insight, streak, avgMood } = params;

  // Get first 2 sentences only (split after punctuation)
  const sentences = insight.split(/(?<=[.!?])\s+/);
  const shortInsight = sentences.slice(0, 2).join(' ')
    .replace(/[\u{1F300}-\u{1FFFF}]/gu, '') // Remove emojis
    .trim();

  // Create temporary canvas for measurement
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d')!;
  
  const padding = 80;
  const maxWidth = 920;
  let fontSize = 36;
  const minFontSize = 28;
  const lineHeight = 52;
  const textStartY = 400;

  // Helper function: Word wrap with font size adjustment
  function wrapText(ctx: CanvasRenderingContext2D, text: string, maxW: number, fSize: number): { lines: string[], finalSize: number } {
    ctx.font = `300 ${fSize}px Arial, sans-serif`;
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    words.forEach((word) => {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxW && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });
    
    if (currentLine) {
      lines.push(currentLine);
    }

    // If too many lines, reduce font size and try again
    if (lines.length > 8 && fSize > minFontSize) {
      return wrapText(ctx, text, maxW, fSize - 2);
    }

    return { lines, finalSize: fSize };
  }

  // Measure text first
  const { lines, finalSize } = wrapText(tempCtx, shortInsight, maxWidth, fontSize);
  
  // Calculate text end position
  const textEndY = textStartY + (lines.length * lineHeight);
  
  // Calculate canvas height: text end + 80px (stats spacing) + 50px (stats height) + 70px (watermark spacing + height)
  const canvasHeight = textEndY + 200;

  // Create actual canvas
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d')!;

  // ===== 1. DARK GRADIENT BACKGROUND =====
  const bgGradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
  bgGradient.addColorStop(0, '#0a0a0f');
  bgGradient.addColorStop(1, '#1a1a2e');
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, 1080, canvasHeight);

  // ===== 2. SUBTLE CORAL CIRCLES =====
  ctx.fillStyle = 'rgba(244, 105, 74, 0.15)';
  ctx.beginPath();
  ctx.arc(1000, 200, 300, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(80, canvasHeight - 180, 280, 0, Math.PI * 2);
  ctx.fill();

  // ===== 3. TOP BRANDING =====
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.font = '300 32px Arial, sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.fillText('YourMoody', padding, 120);

  // ===== 4. BIG CORAL QUOTE MARK =====
  ctx.font = 'bold 120px Georgia, serif';
  ctx.fillStyle = '#F4694A';
  ctx.fillText('"', padding, 280);

  // ===== 5. INSIGHT TEXT =====
  ctx.font = `300 ${finalSize}px Arial, sans-serif`;
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  lines.forEach((line, index) => {
    const y = textStartY + (index * lineHeight);
    ctx.fillText(line, padding, y);
  });

  // ===== 6. STATS ROW (80px BELOW TEXT) =====
  const statsY = textEndY + 80;
  
  ctx.font = '400 32px Arial, sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  
  ctx.fillText(`🔥 ${streak} gün streak`, padding, statsY);
  
  ctx.textAlign = 'right';
  ctx.fillText(`⭐ ${avgMood.toFixed(1)} ortalama mood`, 1080 - padding, statsY);

  // ===== 7. WATERMARK (BELOW STATS) =====
  const watermarkY = statsY + 60;
  
  ctx.font = '300 24px Arial, sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('yourmoody.app', padding, watermarkY);

  // Convert to blob
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), 'image/png', 1.0);
  });
}
