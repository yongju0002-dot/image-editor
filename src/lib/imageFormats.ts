export type ImageFormat = "jpeg" | "png" | "webp" | "gif" | "bmp" | "tiff";

export const formatMime: Record<ImageFormat, string> = {
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  bmp: "image/bmp",
  tiff: "image/tiff",
};

export const formatExtension: Record<ImageFormat, string> = {
  jpeg: "jpg",
  png: "png",
  webp: "webp",
  gif: "gif",
  bmp: "bmp",
  tiff: "tiff",
};

export function baseName(fileName: string): string {
  const dot = fileName.lastIndexOf(".");
  return dot > 0 ? fileName.slice(0, dot) : fileName;
}

export function isImageFile(file: File): boolean {
  return file.type.startsWith("image/") || /\.(jpe?g|png|webp|gif|bmp|tiff?|svg|heic)$/i.test(file.name);
}
