import sharp from "sharp";
import { NextResponse } from "next/server";
import { baseName } from "@/lib/imageFormats";
import { zipOrFileResponse, type OutputFile } from "@/lib/zipOrFileResponse";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const formData = await request.formData();
  const files = formData.getAll("files");
  const mode = formData.get("mode") === "percent" ? "percent" : "pixel";
  const percent = Number(formData.get("percent"));
  const targetWidth = Number(formData.get("width"));
  const targetHeight = Number(formData.get("height"));
  const keepAspect = formData.get("keepAspect") === "true";

  const imageFiles = files.filter(
    (file): file is File => file instanceof File && file.size > 0,
  );

  if (imageFiles.length === 0) {
    return NextResponse.json(
      { error: "크기를 조절할 이미지를 1개 이상 업로드해주세요." },
      { status: 400 },
    );
  }

  if (mode === "percent" && (!Number.isFinite(percent) || percent <= 0 || percent > 500)) {
    return NextResponse.json(
      { error: "퍼센트는 1~500 사이의 값이어야 합니다." },
      { status: 400 },
    );
  }

  if (
    mode === "pixel" &&
    (!Number.isFinite(targetWidth) || targetWidth <= 0) &&
    (!Number.isFinite(targetHeight) || targetHeight <= 0)
  ) {
    return NextResponse.json(
      { error: "너비 또는 높이 중 하나 이상을 입력해주세요." },
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

    let width: number | undefined;
    let height: number | undefined;

    if (mode === "percent") {
      const w = metadata.width ?? 0;
      const h = metadata.height ?? 0;
      width = Math.max(1, Math.round((w * percent) / 100));
      height = Math.max(1, Math.round((h * percent) / 100));
    } else {
      width = targetWidth > 0 ? Math.round(targetWidth) : undefined;
      height = targetHeight > 0 ? Math.round(targetHeight) : undefined;
    }

    const resized = image.resize({
      width,
      height,
      fit: keepAspect ? "inside" : "fill",
      withoutEnlargement: false,
    });

    const format = metadata.format;
    let buffer: Buffer;
    let contentType: string;
    let ext: string;

    if (format === "png") {
      buffer = await resized.png().toBuffer();
      contentType = "image/png";
      ext = "png";
    } else if (format === "webp") {
      buffer = await resized.webp().toBuffer();
      contentType = "image/webp";
      ext = "webp";
    } else if (format === "gif") {
      buffer = await resized.gif().toBuffer();
      contentType = "image/gif";
      ext = "gif";
    } else {
      buffer = await resized.jpeg({ quality: 90 }).toBuffer();
      contentType = "image/jpeg";
      ext = "jpg";
    }

    outputs.push({
      name: `${baseName(file.name)}_resized.${ext}`,
      buffer,
      contentType,
    });
  }

  return zipOrFileResponse(outputs, "resized_images.zip");
}
