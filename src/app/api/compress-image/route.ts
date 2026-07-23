import sharp from "sharp";
import { NextResponse } from "next/server";
import { baseName } from "@/lib/imageFormats";
import { zipOrFileResponse, type OutputFile } from "@/lib/zipOrFileResponse";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const formData = await request.formData();
  const files = formData.getAll("files");
  const qualityRaw = Number(formData.get("quality"));
  const quality = Number.isFinite(qualityRaw)
    ? Math.min(95, Math.max(10, Math.round(qualityRaw)))
    : 70;

  const imageFiles = files.filter(
    (file): file is File => file instanceof File && file.size > 0,
  );

  if (imageFiles.length === 0) {
    return NextResponse.json(
      { error: "압축할 이미지를 1개 이상 업로드해주세요." },
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

    const format = metadata.format;
    let buffer: Buffer;
    let contentType: string;
    let ext: string;

    if (format === "png") {
      buffer = await image
        .png({ quality, compressionLevel: 9, palette: true })
        .toBuffer();
      contentType = "image/png";
      ext = "png";
    } else if (format === "webp") {
      buffer = await image.webp({ quality }).toBuffer();
      contentType = "image/webp";
      ext = "webp";
    } else if (format === "tiff") {
      buffer = await image.tiff({ quality }).toBuffer();
      contentType = "image/tiff";
      ext = "tiff";
    } else {
      buffer = await image.jpeg({ quality, mozjpeg: true }).toBuffer();
      contentType = "image/jpeg";
      ext = "jpg";
    }

    outputs.push({
      name: `${baseName(file.name)}_compressed.${ext}`,
      buffer,
      contentType,
    });
  }

  return zipOrFileResponse(outputs, "compressed_images.zip");
}
