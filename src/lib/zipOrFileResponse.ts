import JSZip from "jszip";
import { NextResponse } from "next/server";

export type OutputFile = {
  name: string;
  buffer: Buffer;
  contentType: string;
};

export async function zipOrFileResponse(
  files: OutputFile[],
  zipName: string,
): Promise<NextResponse> {
  if (files.length === 1) {
    const [file] = files;
    return new NextResponse(new Uint8Array(file.buffer), {
      headers: {
        "Content-Type": file.contentType,
        "Content-Disposition": `attachment; filename="${encodeURIComponent(file.name)}"`,
      },
    });
  }

  const zip = new JSZip();
  for (const file of files) {
    zip.file(file.name, file.buffer);
  }
  const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

  return new NextResponse(new Uint8Array(zipBuffer), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(zipName)}"`,
    },
  });
}
