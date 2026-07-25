import sharp from "sharp";
import { NextResponse } from "next/server";
import { baseName } from "@/lib/imageFormats";
import { zipOrFileResponse, type OutputFile } from "@/lib/zipOrFileResponse";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const formData = await request.formData();
  const files = formData.getAll("files");

  const imageFiles = files.filter(
    (file): file is File => file instanceof File && file.size > 0,
  );

  if (imageFiles.length === 0) {
    return NextResponse.json(
      { error: "메타데이터를 제거할 이미지를 1개 이상 업로드해주세요." },
      { status: 400 },
    );
  }

  const outputs: OutputFile[] = [];

  for (const file of imageFiles) {
    const bytes = Buffer.from(await file.arrayBuffer());
    let image;
    let metadata;
    try {
      image = sharp(bytes);
      metadata = await image.metadata();
    } catch {
      return NextResponse.json(
        { error: `"${file.name}" 파일을 읽을 수 없습니다. 올바른 이미지인지 확인해주세요.` },
        { status: 400 },
      );
    }

    // .rotate() with no args bakes the EXIF orientation into the actual
    // pixel data first - without this, simply dropping EXIF (by not calling
    // withMetadata()) would leave photos that rely on EXIF orientation
    // (very common from phone cameras) rendered sideways/upside-down.
    const cleaned = image.rotate();

    const format = metadata.format;
    let buffer: Buffer;
    let contentType: string;
    let ext: string;

    if (format === "png") {
      buffer = await cleaned.png().toBuffer();
      contentType = "image/png";
      ext = "png";
    } else if (format === "webp") {
      buffer = await cleaned.webp().toBuffer();
      contentType = "image/webp";
      ext = "webp";
    } else if (format === "tiff") {
      buffer = await cleaned.tiff().toBuffer();
      contentType = "image/tiff";
      ext = "tiff";
    } else {
      buffer = await cleaned.jpeg({ quality: 92 }).toBuffer();
      contentType = "image/jpeg";
      ext = "jpg";
    }

    outputs.push({
      name: `${baseName(file.name)}_cleaned.${ext}`,
      buffer,
      contentType,
    });
  }

  return zipOrFileResponse(outputs, "cleaned_images.zip");
}
