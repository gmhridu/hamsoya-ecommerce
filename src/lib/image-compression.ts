// image-compression.ts
import imageCompression from "browser-image-compression";

export async function compressImage(
  file: File,
  options: {
    maxWidth: number;
    maxHeight: number;
    quality: number;
    format: "webp" | "jpeg" | "png";
  },
): Promise<{ file: File }> {
  const compressedFile = await imageCompression(file, {
    maxSizeMB: (options.maxWidth * options.maxHeight) / (1024 * 1024 * 2), // rough size
    maxWidthOrHeight: Math.max(options.maxWidth, options.maxHeight),
    useWebWorker: true,
    fileType: `image/${options.format}`,
    initialQuality: options.quality,
  });

  return { file: compressedFile };
}

export function shouldCompressImage(file: File, maxSizeKB: number) {
  return file.size / 1024 > maxSizeKB;
}

export function formatFileSize(size: number) {
  return `${(size / 1024 / 1024).toFixed(2)} MB`;
}
