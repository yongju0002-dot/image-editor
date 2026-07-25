import sharp from "sharp";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Layout = "horizontal" | "vertical" | "grid";

const MAX_IMAGES = 20;
const GRID_CELL_SIZE = 400;

export async function POST(request: Request) {
  const formData = await request.formData();
  const files = formData.getAll("files");
  const layout = (formData.get("layout") as Layout | null) ?? "horizontal";
  const gapRaw = Number(formData.get("gap"));
  const gap = Number.isFinite(gapRaw) ? Math.min(40, Math.max(0, Math.round(gapRaw))) : 10;

  const imageFiles = files.filter(
    (file): file is File => file instanceof File && file.size > 0,
  );

  if (imageFiles.length < 2) {
    return NextResponse.json(
      { error: "합칠 이미지를 2개 이상 업로드해주세요." },
      { status: 400 },
    );
  }

  if (imageFiles.length > MAX_IMAGES) {
    return NextResponse.json(
      { error: `이미지는 최대 ${MAX_IMAGES}개까지 합칠 수 있습니다.` },
      { status: 400 },
    );
  }

  const inputs: { buffer: Buffer; width: number; height: number }[] = [];
  for (const file of imageFiles) {
    const bytes = Buffer.from(await file.arrayBuffer());
    try {
      const img = sharp(bytes).rotate();
      const meta = await img.metadata();
      if (!meta.width || !meta.height) throw new Error("no dimensions");
      const buffer = await img.png().toBuffer();
      inputs.push({ buffer, width: meta.width, height: meta.height });
    } catch {
      return NextResponse.json(
        { error: `"${file.name}" 파일을 읽을 수 없습니다. 올바른 이미지인지 확인해주세요.` },
        { status: 400 },
      );
    }
  }

  let canvasWidth: number;
  let canvasHeight: number;
  let composites: { input: Buffer; left: number; top: number }[];

  if (layout === "horizontal") {
    const targetHeight = Math.min(...inputs.map((i) => i.height));
    const resized = await Promise.all(
      inputs.map((i) =>
        sharp(i.buffer)
          .resize({ height: targetHeight })
          .png()
          .toBuffer()
          .then(async (buffer) => {
            const meta = await sharp(buffer).metadata();
            return { buffer, width: meta.width ?? 0, height: targetHeight };
          }),
      ),
    );
    canvasHeight = targetHeight;
    canvasWidth = resized.reduce((sum, r) => sum + r.width, 0) + gap * (resized.length - 1);
    let x = 0;
    composites = resized.map((r) => {
      const c = { input: r.buffer, left: x, top: 0 };
      x += r.width + gap;
      return c;
    });
  } else if (layout === "vertical") {
    const targetWidth = Math.min(...inputs.map((i) => i.width));
    const resized = await Promise.all(
      inputs.map((i) =>
        sharp(i.buffer)
          .resize({ width: targetWidth })
          .png()
          .toBuffer()
          .then(async (buffer) => {
            const meta = await sharp(buffer).metadata();
            return { buffer, width: targetWidth, height: meta.height ?? 0 };
          }),
      ),
    );
    canvasWidth = targetWidth;
    canvasHeight = resized.reduce((sum, r) => sum + r.height, 0) + gap * (resized.length - 1);
    let y = 0;
    composites = resized.map((r) => {
      const c = { input: r.buffer, left: 0, top: y };
      y += r.height + gap;
      return c;
    });
  } else {
    const cols = Math.ceil(Math.sqrt(inputs.length));
    const rows = Math.ceil(inputs.length / cols);
    const resized = await Promise.all(
      inputs.map((i) =>
        sharp(i.buffer)
          .resize({
            width: GRID_CELL_SIZE,
            height: GRID_CELL_SIZE,
            fit: "contain",
            background: { r: 255, g: 255, b: 255, alpha: 1 },
          })
          .png()
          .toBuffer(),
      ),
    );
    canvasWidth = cols * GRID_CELL_SIZE + (cols - 1) * gap;
    canvasHeight = rows * GRID_CELL_SIZE + (rows - 1) * gap;
    composites = resized.map((buffer, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      return {
        input: buffer,
        left: col * (GRID_CELL_SIZE + gap),
        top: row * (GRID_CELL_SIZE + gap),
      };
    });
  }

  const merged = await sharp({
    create: {
      width: canvasWidth,
      height: canvasHeight,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .composite(composites)
    .png()
    .toBuffer();

  return new NextResponse(new Uint8Array(merged), {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename="merged_image.png"`,
    },
  });
}
