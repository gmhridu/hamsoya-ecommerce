import { compressImage, shouldCompressImage } from "./image-compression";

// Client-side ImageKit configuration (for frontend uploads)
export const imagekitConfig = {
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
};

// Upload parameters for profile images
export const profileImageUploadParams = {
  folder: "/profile-images/",
  useUniqueFileName: true,
  overwriteFile: false,

  transformation: {
    pre: "w-400,h-400,c-maintain_ratio,f-webp,q-auto", // ✅ WebP
    post: [
      {
        type: "transformation",
        value: "w-200,h-200,c-maintain_ratio,f-webp,q-auto", // ✅ WebP
      },
    ],
  },

  tags: ["profile", "avatar", "user"],
};

// Upload parameters for product images
export const productImageUploadParams = {
  folder: "/product-images/",
  useUniqueFileName: true,
  overwriteFile: false,

  transformation: {
    pre: "w-800,h-800,c-maintain_ratio,f-webp,q-auto", // ✅ WebP
    post: [
      {
        type: "transformation",
        value: "w-400,h-400,c-maintain_ratio,f-webp,q-auto", // ✅ WebP
      },
    ],
  },

  tags: ["product", "ecommerce"],
};

// Optimized compression settings for faster uploads
export const optimizedCompressionSettings = {
  maxWidth: 600,
  maxHeight: 600,
  quality: 0.85,
  format: "webp" as const, // ✅ compress as WebP
  maxSizeKB: 300, // Reduced from 500KB for faster uploads
};

// File validation
export const validateImageFile = (
  file: File,
): { isValid: boolean; error?: string } => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: "Please upload a valid image file (JPEG, PNG, or WebP)",
    };
  }

  const maxSize = 10 * 1024 * 1024; // 10MB in bytes
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: "Image size must be less than 10MB",
    };
  }

  return { isValid: true };
};

// Generate authentication parameters for client-side upload
export async function getImageKitAuthParams() {
  const res = await fetch("/api/imagekit/auth");
  if (!res.ok) throw new Error("Failed to fetch ImageKit auth");
  return res.json();
}

// Upload image to ImageKit with optional transformation
export async function uploadImageToImageKit(
  file: File,
  fileName: string,
  folder: string,
  transformation?: any, // ✅ pass transformation for WebP upload
  onProgress?: (progress: number) => void,
): Promise<{ url: string; fileId: string }> {
  const auth = await getImageKitAuthParams();

  const formData = new FormData();
  formData.append("file", file);
  formData.append("fileName", fileName);
  formData.append("folder", folder);
  formData.append("publicKey", imagekitConfig.publicKey);
  formData.append("signature", auth.signature);
  formData.append("expire", auth.expire);
  formData.append("token", auth.token);

  if (transformation) {
    formData.append("transformation", JSON.stringify(transformation));
  }

  return uploadWithProgress(formData, onProgress);
}

// Helper function for upload with real progress tracking
function uploadWithProgress(
  formData: FormData,
  onProgress?: (progress: number) => void,
): Promise<{ url: string; fileId: string; name: string }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable && onProgress) {
        const progress = Math.round((event.loaded / event.total) * 100);
        onProgress(progress);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const result = JSON.parse(xhr.responseText);
          resolve({
            url: result.url,
            fileId: result.fileId,
            name: result.name,
          });
        } catch (error) {
          reject(new Error("Invalid response format"));
        }
      } else {
        try {
          const errorData = JSON.parse(xhr.responseText);
          reject(
            new Error(
              errorData.message || `Upload failed with status ${xhr.status}`,
            ),
          );
        } catch {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      }
    });

    xhr.addEventListener("error", () => {
      reject(new Error("Network error during upload"));
    });

    xhr.addEventListener("timeout", () => {
      reject(new Error("Upload timeout"));
    });

    xhr.timeout = 30000;

    xhr.open("POST", "https://upload.imagekit.io/api/v1/files/upload");
    xhr.send(formData);
  });
}

// Upload profile image with compression and progress tracking
export async function uploadProfileImage(
  file: File,
  userId: string,
  onProgress?: (progress: number) => void,
) {
  const fileName = `profile-${userId}-${Date.now()}`;


  let fileToUpload = file;

  if (shouldCompressImage(file, optimizedCompressionSettings.maxSizeKB)) {


    try {
      const compressionResult = await compressImage(
        file,
        optimizedCompressionSettings,
      );

      fileToUpload = compressionResult.file;

    } catch (error) {
      console.warn("⚠️ Image compression failed, uploading original:", error);
    }
  }

  // ✅ pass transformation for WebP
  return uploadImageToImageKit(
    fileToUpload,
    fileName,
    profileImageUploadParams.folder,
    profileImageUploadParams.transformation,
    onProgress,
  );
}

// Generate optimized image URL using ImageKit URL transformations
export function getOptimizedImageUrl(
  imageUrl: string,
  transformations?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: "auto" | "webp" | "jpg" | "png";
  },
): string {
  if (!imageUrl || !imageUrl.includes("imagekit.io")) {
    return imageUrl;
  }

  const params = [];

  if (transformations?.width) {
    params.push(`w-${transformations.width}`);
  }

  if (transformations?.height) {
    params.push(`h-${transformations.height}`);
  }

  if (transformations?.quality) {
    params.push(`q-${transformations.quality}`);
  }

  // ✅ Default format is WebP
  const format = transformations?.format || "webp";
  params.push(`f-${format}`);

  if (params.length === 0) {
    return imageUrl;
  }

  const transformationString = params.join(",");

  if (imageUrl.includes("/tr:")) {
    return imageUrl.replace("/tr:", `/tr:${transformationString},`);
  } else {
    const urlParts = imageUrl.split("/");
    const filename = urlParts.pop();
    const basePath = urlParts.join("/");
    return `${basePath}/tr:${transformationString}/${filename}`;
  }
}

// Delete image from ImageKit
export async function deleteImageFromImageKit(fileId: string): Promise<void> {
  try {
    const response = await fetch("/api/imagekit/delete", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fileId }),
    });

    if (!response.ok) {
      throw new Error("Failed to delete image");
    }
  } catch (error) {
    console.error("Error deleting image from ImageKit:", error);
    throw error;
  }
}
