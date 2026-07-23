import sharp from "sharp";
import { NextResponse } from "next/server";
import { baseName } from "@/lib/imageFormats";
import { escapeXml } from "@/lib/escapeXml";

export const runtime = "nodejs";

function wrapText(text: string, maxCharsPerLine: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxCharsPerLine && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function buildMemeText(
  text: string,
  fontSize: number,
  width: number,
  y: number,
  anchor: "top" | "bottom",
): string {
  if (!text.trim()) return "";
  const maxCharsPerLine = Math.max(6, Math.floor(width / (fontSize * 0.62)));
  const lines = wrapText(text.toUpperCase(), maxCharsPerLine);
  const lineHeight = fontSize * 1.15;

  return lines
    .map((line, i) => {
      const offset = anchor === "top" ? i * lineHeight : (i - (lines.length - 1)) * lineHeight;
      const lineY = y + offset;
      return `<text x="${width / 2}" y="${lineY}" font-family="Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif"
        font-weight="900" font-size="${fontSize}" fill="#ffffff" stroke="#000000"
        stroke-width="${Math.max(2, fontSize * 0.06)}" text-anchor="middle"
        paint-order="stroke">${escapeXml(line)}</text>`;
    })
    .join("");
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");
  const topText = String(formData.get("topText") ?? "").slice(0, 200);
  const bottomText = String(formData.get("bottomText") ?? "").slice(0, 200);

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json(
      { error: "밈을 만들 이미지를 업로드해주세요." },
      { status: 400 },
    );
  }

  if (!topText.trim() && !bottomText.trim()) {
    return NextResponse.json(
      { error: "상단 또는 하단 텍스트를 하나 이상 입력해주세요." },
      { status: 400 },
    );
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  let image;
  let metadata;
  try {
    image = sharp(bytes);
    metadata = await image.metadata();
  } catch {
    return NextResponse.json(
      { error: "이미지를 읽을 수 없습니다. 올바른 이미지인지 확인해주세요." },
      { status: 400 },
    );
  }

  const width = metadata.width ?? 800;
  const height = metadata.height ?? 600;
  const fontSize = Math.max(20, Math.round(width * 0.08));

  const topSvg = buildMemeText(topText, fontSize, width, fontSize * 1.1, "top");
  const bottomSvg = buildMemeText(
    bottomText,
    fontSize,
    width,
    height - fontSize * 0.4,
    "bottom",
  );

  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      ${topSvg}
      ${bottomSvg}
    </svg>
  `;

  const format = metadata.format;
  const composed = image.composite([{ input: Buffer.from(svg), top: 0, left: 0 }]);

  let buffer: Buffer;
  let contentType: string;
  let ext: string;

  if (format === "png") {
    buffer = await composed.png().toBuffer();
    contentType = "image/png";
    ext = "png";
  } else if (format === "webp") {
    buffer = await composed.webp().toBuffer();
    contentType = "image/webp";
    ext = "webp";
  } else {
    buffer = await composed.jpeg({ quality: 92 }).toBuffer();
    contentType = "image/jpeg";
    ext = "jpg";
  }

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${encodeURIComponent(
        `${baseName(file.name)}_meme.${ext}`,
      )}"`,
    },
  });
}
