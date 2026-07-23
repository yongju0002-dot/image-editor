import sharp, { type Sharp } from "sharp";
import { NextResponse } from "next/server";
import { baseName, formatExtension, formatMime, type ImageFormat } from "@/lib/imageFormats";
import { zipOrFileResponse, type OutputFile } from "@/lib/zipOrFileResponse";

export const runtime = "nodejs";

const VALID_FORMATS: ImageFormat[] = ["jpeg", "png", "webp", "gif", "bmp", "tiff"];

export async function POST(request: Request) {
  const formData = await request.formData();
  const files = formData.getAll("files");
  const format = formData.get("format") as ImageFormat | null;

  const imageFiles = files.filter(
    (file): file is File => file instanceof File && file.size > 0,
  );

  if (imageFiles.length === 0) {
    return NextResponse.json(
      { error: "변환할 이미지를 1개 이상 업로드해주세요." },
      { status: 400 },
    );
  }

  if (!format || !VALID_FORMATS.includes(format)) {
    return NextResponse.json(
      { error: "변환할 형식을 선택해주세요." },
      { status: 400 },
    );
  }

  const outputs: OutputFile[] = [];
  const needsFlatten = format === "jpeg" || format === "bmp";

  for (const file of imageFiles) {
    const bytes = Buffer.from(await file.arrayBuffer());
    let image;
    try {
      image = sharp(bytes);
      await image.metadata();
    } catch {
      return NextResponse.json(
        { error: `"${file.name}" 파일을 읽을 수 없습니다. 올바른 이미지인지 확인해주세요.` },
        { status: 400 },
      );
    }

    if (needsFlatten) {
      image = image.flatten({ background: "#ffffff" });
    }

    let buffer: Buffer;
    switch (format) {
      case "jpeg":
        buffer = await image.jpeg({ quality: 92 }).toBuffer();
        break;
      case "png":
        buffer = await image.png().toBuffer();
        break;
      case "webp":
        buffer = await image.webp({ quality: 92 }).toBuffer();
        break;
      case "gif":
        buffer = await image.gif().toBuffer();
        break;
      case "tiff":
        buffer = await image.tiff({ quality: 92 }).toBuffer();
        break;
      case "bmp":
        // sharp has no native bmp encoder; PNG-in-.bmp is not valid, so
        // fall back to a raw pixel BMP encoder built by hand.
        buffer = await encodeBmp(image);
        break;
    }

    outputs.push({
      name: `${baseName(file.name)}.${formatExtension[format]}`,
      buffer,
      contentType: formatMime[format],
    });
  }

  return zipOrFileResponse(outputs, "converted_images.zip");
}

async function encodeBmp(image: Sharp): Promise<Buffer> {
  const { data, info } = await image
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const rowSize = width * 3;
  const rowPadded = Math.ceil(rowSize / 4) * 4;
  const pixelArraySize = rowPadded * height;
  const fileSize = 54 + pixelArraySize;

  const buffer = Buffer.alloc(fileSize);
  buffer.write("BM", 0, "ascii");
  buffer.writeUInt32LE(fileSize, 2);
  buffer.writeUInt32LE(54, 10);
  buffer.writeUInt32LE(40, 14);
  buffer.writeInt32LE(width, 18);
  buffer.writeInt32LE(height, 22);
  buffer.writeUInt16LE(1, 26);
  buffer.writeUInt16LE(24, 28);
  buffer.writeUInt32LE(0, 30);
  buffer.writeUInt32LE(pixelArraySize, 34);

  for (let row = 0; row < height; row++) {
    const srcRow = height - 1 - row;
    let destOffset = 54 + row * rowPadded;
    for (let col = 0; col < width; col++) {
      const srcOffset = (srcRow * width + col) * channels;
      const r = data[srcOffset];
      const g = data[srcOffset + 1];
      const b = data[srcOffset + 2];
      buffer[destOffset++] = b;
      buffer[destOffset++] = g;
      buffer[destOffset++] = r;
    }
  }

  return buffer;
}
