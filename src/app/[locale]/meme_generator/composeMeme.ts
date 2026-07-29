export type BaseLayer = {
  id: string;
  xPct: number;
  yPct: number;
  widthPct: number;
  rotationDeg: number;
};

export type TextLayer = BaseLayer & {
  kind: "text";
  content: string;
  fontSizePct: number;
  style: "internal" | "external";
};

export type ImageLayer = BaseLayer & {
  kind: "image";
  src: string;
  heightPct: number;
};

export type Layer = TextLayer | ImageLayer;

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawTextLayer(
  ctx: CanvasRenderingContext2D,
  layer: TextLayer,
  naturalWidth: number,
  naturalHeight: number,
) {
  const content = layer.content.trim();
  if (!content) return;

  const fontSize = Math.max(8, layer.fontSizePct * naturalWidth);
  const cx = layer.xPct * naturalWidth;
  const cy = layer.yPct * naturalHeight;
  const maxWidth = Math.max(fontSize, layer.widthPct * naturalWidth);

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((layer.rotationDeg * Math.PI) / 180);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `900 ${fontSize}px Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif`;

  const lines = wrapText(ctx, content.toUpperCase(), maxWidth);
  const lineHeight = fontSize * 1.15;
  const totalHeight = lineHeight * lines.length;
  const startY = -totalHeight / 2 + lineHeight / 2;

  if (layer.style === "external") {
    const padding = fontSize * 0.35;
    const boxWidth = maxWidth + padding * 2;
    const boxHeight = totalHeight + padding * 2;
    ctx.fillStyle = "#ffffff";
    roundRectPath(ctx, -boxWidth / 2, -boxHeight / 2, boxWidth, boxHeight, fontSize * 0.15);
    ctx.fill();
    ctx.fillStyle = "#000000";
    lines.forEach((line, i) => ctx.fillText(line, 0, startY + i * lineHeight));
  } else {
    ctx.lineWidth = Math.max(2, fontSize * 0.06);
    ctx.strokeStyle = "#000000";
    ctx.fillStyle = "#ffffff";
    lines.forEach((line, i) => {
      const y = startY + i * lineHeight;
      ctx.strokeText(line, 0, y);
      ctx.fillText(line, 0, y);
    });
  }
  ctx.restore();
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image layer: ${src}`));
    img.src = src;
  });
}

async function drawImageLayer(
  ctx: CanvasRenderingContext2D,
  layer: ImageLayer,
  naturalWidth: number,
  naturalHeight: number,
) {
  const img = await loadImage(layer.src);
  const w = layer.widthPct * naturalWidth;
  const h = layer.heightPct * naturalHeight;
  const cx = layer.xPct * naturalWidth;
  const cy = layer.yPct * naturalHeight;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((layer.rotationDeg * Math.PI) / 180);
  ctx.drawImage(img, -w / 2, -h / 2, w, h);
  ctx.restore();
}

export async function composeMeme(
  baseImage: HTMLImageElement,
  layers: Layer[],
  mimeType: string,
): Promise<Blob> {
  const naturalWidth = baseImage.naturalWidth;
  const naturalHeight = baseImage.naturalHeight;

  const canvas = document.createElement("canvas");
  canvas.width = naturalWidth;
  canvas.height = naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser.");

  ctx.drawImage(baseImage, 0, 0, naturalWidth, naturalHeight);

  for (const layer of layers) {
    if (layer.kind === "text") {
      drawTextLayer(ctx, layer, naturalWidth, naturalHeight);
    } else {
      await drawImageLayer(ctx, layer, naturalWidth, naturalHeight);
    }
  }

  const outputType = mimeType === "image/png" ? "image/png" : "image/jpeg";
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Failed to export the meme image."))),
      outputType,
      0.92,
    );
  });
}
