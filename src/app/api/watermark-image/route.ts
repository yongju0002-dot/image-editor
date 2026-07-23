import sharp from "sharp";
import { NextResponse } from "next/server";
import { baseName } from "@/lib/imageFormats";
import { escapeXml } from "@/lib/escapeXml";

export const runtime = "nodejs";

type Position =
  | "top-left"
  | "top-center"
  | "top-right"
  | "middle-left"
  | "middle-center"
  | "middle-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

function anchorFor(position: Position): { anchor: string; baseline: string } {
  const [vertical, horizontal] = position.split("-");

  const anchor = horizontal === "left" ? "start" : horizontal === "right" ? "end" : "middle";
  const baseline = vertical === "top" ? "hanging" : vertical === "bottom" ? "baseline" : "middle";
  return { anchor, baseline };
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");
  const text = String(formData.get("text") ?? "").slice(0, 200);
  const opacity = Math.min(100, Math.max(5, Number(formData.get("opacity")) || 50)) / 100;
  const position = (formData.get("position") as Position) || "bottom-right";
  const fontSize = Math.min(200, Math.max(10, Number(formData.get("fontSize")) || 32));

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json(
      { error: "워터마크를 추가할 이미지를 업로드해주세요." },
      { status: 400 },
    );
  }

  if (!text.trim()) {
    return NextResponse.json(
      { error: "워터마크 텍스트를 입력해주세요." },
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
  const padding = Math.round(fontSize * 0.8);
  const [vertical, horizontal] = position.split("-");
  const x = horizontal === "left" ? padding : horizontal === "right" ? width - padding : width / 2;
  const y = vertical === "top" ? padding : vertical === "bottom" ? height - padding : height / 2;
  const { anchor, baseline } = anchorFor(position);

  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <text x="${x}" y="${y}" font-family="sans-serif" font-weight="700" font-size="${fontSize}"
        fill="#ffffff" fill-opacity="${opacity}" stroke="#000000" stroke-opacity="${opacity * 0.6}"
        stroke-width="${Math.max(1, fontSize * 0.03)}"
        text-anchor="${anchor}" dominant-baseline="${baseline}">${escapeXml(text)}</text>
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
        `${baseName(file.name)}_watermarked.${ext}`,
      )}"`,
    },
  });
}
