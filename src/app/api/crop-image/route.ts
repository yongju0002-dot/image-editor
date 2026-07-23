import sharp from "sharp";
import { NextResponse } from "next/server";
import { baseName } from "@/lib/imageFormats";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");
  const x = Math.round(Number(formData.get("x")));
  const y = Math.round(Number(formData.get("y")));
  const width = Math.round(Number(formData.get("width")));
  const height = Math.round(Number(formData.get("height")));

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json(
      { error: "자르기할 이미지를 업로드해주세요." },
      { status: 400 },
    );
  }

  if (
    [x, y, width, height].some((n) => !Number.isFinite(n)) ||
    width <= 0 ||
    height <= 0 ||
    x < 0 ||
    y < 0
  ) {
    return NextResponse.json(
      { error: "잘라낼 영역의 좌표와 크기를 올바르게 입력해주세요." },
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

  const imgWidth = metadata.width ?? 0;
  const imgHeight = metadata.height ?? 0;

  if (x + width > imgWidth || y + height > imgHeight) {
    return NextResponse.json(
      {
        error: `잘라낼 영역이 이미지 범위(${imgWidth}x${imgHeight})를 벗어납니다.`,
      },
      { status: 400 },
    );
  }

  const format = metadata.format;
  const cropped = image.extract({ left: x, top: y, width, height });

  let buffer: Buffer;
  let contentType: string;
  let ext: string;

  if (format === "png") {
    buffer = await cropped.png().toBuffer();
    contentType = "image/png";
    ext = "png";
  } else if (format === "webp") {
    buffer = await cropped.webp().toBuffer();
    contentType = "image/webp";
    ext = "webp";
  } else if (format === "gif") {
    buffer = await cropped.gif().toBuffer();
    contentType = "image/gif";
    ext = "gif";
  } else {
    buffer = await cropped.jpeg({ quality: 92 }).toBuffer();
    contentType = "image/jpeg";
    ext = "jpg";
  }

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${encodeURIComponent(
        `${baseName(file.name)}_cropped.${ext}`,
      )}"`,
    },
  });
}
