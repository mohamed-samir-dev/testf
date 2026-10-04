/**
 * Client-side image compression & resizing utility.
 * Resizes large camera photos to a max dimension of 1600px and compresses to WebP/JPEG.
 * This drastically reduces upload time, Next.js / Express memory buffering, and Cloudinary load.
 */
export async function compressImage(
  file: File,
  options: { maxWidth?: number; maxHeight?: number; quality?: number } = {}
): Promise<File> {
  const { maxWidth = 1600, maxHeight = 1600, quality = 0.85 } = options;

  // Don't process non-image files or SVGs
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml") {
    return file;
  }

  // If the file is already small (< 400KB), keep it as-is
  if (file.size < 400 * 1024) {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect-ratio preserved dimensions
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        } else if (file.size < 800 * 1024) {
          // If dimensions are within bounds and size is under 800KB, no need to re-encode
          return resolve(file);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(file);

        ctx.drawImage(img, 0, 0, width, height);

        // Determine best output format
        const outputType = file.type === "image/png" && hasTransparency(ctx, width, height)
          ? "image/png"
          : "image/webp";

        canvas.toBlob(
          (blob) => {
            if (!blob || blob.size >= file.size) {
              // If compressed size is somehow larger, keep original
              return resolve(file);
            }
            const extension = outputType === "image/webp" ? ".webp" : ".png";
            const newName = file.name.replace(/\.[^/.]+$/, "") + extension;
            const compressedFile = new File([blob], newName, { type: outputType });
            resolve(compressedFile);
          },
          outputType,
          quality
        );
      };
      img.onerror = () => resolve(file);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

function hasTransparency(ctx: CanvasRenderingContext2D, width: number, height: number): boolean {
  try {
    const data = ctx.getImageData(0, 0, width, height).data;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] < 255) return true;
    }
    return false;
  } catch {
    return false;
  }
}
