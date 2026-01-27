/**
 * Storage Abstraction Layer
 *
 * Provides a unified interface for file storage with support for:
 * - Local storage (development)
 * - Supabase Storage (production)
 */

import { promises as fs } from "fs";
import path from "path";

export interface StorageProvider {
  /**
   * Upload a file to storage
   * @param fileBuffer - The file content as a Buffer
   * @param fileName - The name of the file
   * @param contentType - MIME type of the file
   * @returns The public URL of the uploaded file
   */
  upload(fileBuffer: Buffer, fileName: string, contentType: string): Promise<{ url: string; path: string }>;

  /**
   * Delete a file from storage
   * @param filePath - The path of the file to delete
   */
  delete(filePath: string): Promise<void>;

  /**
   * Get the public URL for a file
   * @param filePath - The path of the file
   * @returns The public URL
   */
  getPublicUrl(filePath: string): string;
}

/**
 * Local file system storage provider
 * Stores files in /public/uploads/ directory
 */
export class LocalStorageProvider implements StorageProvider {
  private uploadDir: string;
  private baseUrl: string;

  constructor() {
    this.uploadDir = path.join(process.cwd(), "public", "uploads");
    this.baseUrl = "/uploads";
  }

  async upload(fileBuffer: Buffer, fileName: string, contentType: string): Promise<{ url: string; path: string }> {
    // Ensure upload directory exists
    await fs.mkdir(this.uploadDir, { recursive: true });

    // Generate unique filename to avoid collisions
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const ext = this.getExtension(fileName, contentType);
    const uniqueFileName = `${timestamp}-${randomStr}${ext}`;

    const filePath = path.join(this.uploadDir, uniqueFileName);
    await fs.writeFile(filePath, fileBuffer);

    const url = `${this.baseUrl}/${uniqueFileName}`;
    return { url, path: uniqueFileName };
  }

  async delete(filePath: string): Promise<void> {
    const fullPath = path.join(this.uploadDir, filePath);
    try {
      await fs.unlink(fullPath);
    } catch (error) {
      // File might not exist, which is fine
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        throw error;
      }
    }
  }

  getPublicUrl(filePath: string): string {
    return `${this.baseUrl}/${filePath}`;
  }

  private getExtension(fileName: string, contentType: string): string {
    // Try to get extension from filename first
    const extMatch = fileName.match(/\.[a-zA-Z0-9]+$/);
    if (extMatch) {
      return extMatch[0].toLowerCase();
    }

    // Fallback to content type
    const mimeToExt: Record<string, string> = {
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/gif": ".gif",
      "image/webp": ".webp",
    };
    return mimeToExt[contentType] || ".bin";
  }
}

/**
 * Supabase Storage provider
 * For production use with Supabase
 */
export class SupabaseStorageProvider implements StorageProvider {
  private bucketName: string;
  private supabaseUrl: string;
  private supabaseKey: string;

  constructor() {
    this.bucketName = process.env.SUPABASE_STORAGE_BUCKET || "survey-images";
    this.supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    this.supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

    if (!this.supabaseUrl || !this.supabaseKey) {
      console.warn("Supabase credentials not configured. File uploads will fail.");
    }
  }

  async upload(fileBuffer: Buffer, fileName: string, contentType: string): Promise<{ url: string; path: string }> {
    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const ext = this.getExtension(fileName, contentType);
    const uniqueFileName = `${timestamp}-${randomStr}${ext}`;
    const filePath = `uploads/${uniqueFileName}`;

    // Upload to Supabase Storage via REST API
    const uploadUrl = `${this.supabaseUrl}/storage/v1/object/${this.bucketName}/${filePath}`;

    // Convert Buffer to Uint8Array for fetch body compatibility
    const uint8Array = new Uint8Array(fileBuffer);

    const response = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.supabaseKey}`,
        "Content-Type": contentType,
        "x-upsert": "true",
      },
      body: uint8Array,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Supabase upload failed: ${error}`);
    }

    const url = this.getPublicUrl(filePath);
    return { url, path: filePath };
  }

  async delete(filePath: string): Promise<void> {
    const deleteUrl = `${this.supabaseUrl}/storage/v1/object/${this.bucketName}/${filePath}`;

    const response = await fetch(deleteUrl, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${this.supabaseKey}`,
      },
    });

    if (!response.ok && response.status !== 404) {
      const error = await response.text();
      throw new Error(`Supabase delete failed: ${error}`);
    }
  }

  getPublicUrl(filePath: string): string {
    return `${this.supabaseUrl}/storage/v1/object/public/${this.bucketName}/${filePath}`;
  }

  private getExtension(fileName: string, contentType: string): string {
    const extMatch = fileName.match(/\.[a-zA-Z0-9]+$/);
    if (extMatch) {
      return extMatch[0].toLowerCase();
    }

    const mimeToExt: Record<string, string> = {
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/gif": ".gif",
      "image/webp": ".webp",
    };
    return mimeToExt[contentType] || ".bin";
  }
}

// Singleton instance
let storageProvider: StorageProvider | null = null;

/**
 * Get the configured storage provider
 * Uses environment variable STORAGE_PROVIDER to determine which provider to use
 * Default: "local"
 */
export function getStorageProvider(): StorageProvider {
  if (storageProvider) {
    return storageProvider;
  }

  const provider = process.env.STORAGE_PROVIDER || "local";

  switch (provider) {
    case "supabase":
      storageProvider = new SupabaseStorageProvider();
      break;
    case "local":
    default:
      storageProvider = new LocalStorageProvider();
      break;
  }

  return storageProvider;
}

/**
 * Allowed image MIME types
 */
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

/**
 * Maximum file size in bytes (5MB)
 */
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Validate an uploaded image file
 */
export function validateImageFile(
  file: { size: number; type: string },
  options?: { maxSize?: number; allowedTypes?: string[] }
): { valid: boolean; error?: string } {
  const maxSize = options?.maxSize || MAX_FILE_SIZE;
  const allowedTypes = options?.allowedTypes || ALLOWED_IMAGE_TYPES;

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${Math.round(maxSize / 1024 / 1024)}MB`,
    };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${allowedTypes.join(", ")}`,
    };
  }

  return { valid: true };
}

/**
 * Convert a local file path to base64 for Claude Vision API
 */
export async function fileToBase64(filePath: string): Promise<{
  data: string;
  mediaType: "image/jpeg" | "image/png" | "image/gif" | "image/webp";
}> {
  // If it's a URL path (starts with /uploads), convert to file path
  let fullPath = filePath;
  if (filePath.startsWith("/uploads/")) {
    fullPath = path.join(process.cwd(), "public", filePath);
  } else if (!path.isAbsolute(filePath)) {
    fullPath = path.join(process.cwd(), "public", "uploads", filePath);
  }

  const buffer = await fs.readFile(fullPath);
  const base64 = buffer.toString("base64");

  // Determine media type from extension
  const ext = path.extname(fullPath).toLowerCase();
  const extToMediaType: Record<string, "image/jpeg" | "image/png" | "image/gif" | "image/webp"> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
  };

  return {
    data: base64,
    mediaType: extToMediaType[ext] || "image/png",
  };
}

/**
 * Fetch an image from URL and convert to base64 for Claude Vision API
 */
export async function urlToBase64(imageUrl: string): Promise<{
  data: string;
  mediaType: "image/jpeg" | "image/png" | "image/gif" | "image/webp";
}> {
  // If it's a local path, use fileToBase64
  if (imageUrl.startsWith("/uploads/") || !imageUrl.startsWith("http")) {
    return fileToBase64(imageUrl);
  }

  // Fetch from URL
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const base64 = buffer.toString("base64");

  // Determine media type from content-type header
  const contentType = response.headers.get("content-type") || "image/png";
  const mediaType = contentType.split(";")[0].trim() as "image/jpeg" | "image/png" | "image/gif" | "image/webp";

  // Validate media type
  if (!ALLOWED_IMAGE_TYPES.includes(mediaType)) {
    throw new Error(`Unsupported image type: ${mediaType}`);
  }

  return { data: base64, mediaType };
}
