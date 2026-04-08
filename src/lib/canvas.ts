import { ZOOM_FACTOR, PARALLAX_STRENGTH } from "./constants";

export function drawFrame(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  canvas: HTMLCanvasElement,
  mouse: { x: number; y: number }
) {
  const cw = canvas.width;
  const ch = canvas.height;
  const iw = image.naturalWidth;
  const ih = image.naturalHeight;

  // Cover-scale with zoom to eliminate letterboxing
  const coverScale = Math.max(cw / iw, ch / ih) * ZOOM_FACTOR;
  const drawW = iw * coverScale;
  const drawH = ih * coverScale;

  // Center the image
  let drawX = (cw - drawW) / 2;
  let drawY = (ch - drawH) / 2;

  // Parallax: shift opposite to cursor
  const overflowX = (drawW - cw) / 2;
  const overflowY = (drawH - ch) / 2;
  drawX += -mouse.x * overflowX * PARALLAX_STRENGTH;
  drawY += -mouse.y * overflowY * PARALLAX_STRENGTH;

  ctx.clearRect(0, 0, cw, ch);
  ctx.drawImage(image, drawX, drawY, drawW, drawH);
}
