import sharp from "sharp";
import { NextResponse } from "next/server";
import { baseName } from "@/lib/imageFormats";
import { zipOrFileResponse, type OutputFile } from "@/lib/zipOrFileResponse";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const formData = await request.formData();
  const files = formData.getAll("files");
  const angle = Number(formData.get("angle")) || 0;
  const flipH = formData.get("flipH") === "true";
  const flipV = formData.get("flipV") === "true";

  const imageFiles = files.filter(
    (file): file is File => file instanceof File && file.size > 0,
  );

  if (imageFiles.length === 0) {
    return NextResponse.json(
      { error: "회전할 이미지를 1개 이상 업로드해주세요." },
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

    let pipeline = image.rotate(angle, { background: "#ffffff" });
    if (flipH) pipeline = pipeline.flop();
    if (flipV) pipeline = pipeline.flip();

    const format = metadata.format;
    let buffer: Buffer;
    let contentType: string;
    let ext: string;

    if (format === "png") {
      buffer = await pipeline.png().toBuffer();
      contentType = "image/png";
      ext = "png";
    } else if (format === "webp") {
      buffer = await pipeline.webp().toBuffer();
      contentType = "image/webp";
      ext = "webp";
    } else if (format === "gif") {
      buffer = await pipeline.gif().toBuffer();
      contentType = "image/gif";
      ext = "gif";
    } else {
      buffer = await pipeline.jpeg({ quality: 92 }).toBuffer();
      contentType = "image/jpeg";
      ext = "jpg";
    }

    outputs.push({
      name: `${baseName(file.name)}_rotated.${ext}`,
      buffer,
      contentType,
    });
  }

  return zipOrFileResponse(outputs, "rotated_images.zip");
}
