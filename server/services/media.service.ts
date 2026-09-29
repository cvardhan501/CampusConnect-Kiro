import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary from environment variables
if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export interface UploadedMedia {
  url: string;
  thumbnailUrl: string;
  publicId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
}

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export class MediaService {
  static validateFile(file: File | { type: string; size: number; name: string }): void {
    if (!file) {
      throw new Error('No file provided for upload.');
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
      throw new Error(`Unsupported file format (${file.type}). Allowed formats: JPG, JPEG, PNG, WEBP.`);
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new Error(`File size exceeds maximum allowed limit of 5MB (${(file.size / (1024 * 1024)).toFixed(2)}MB).`);
    }
  }

  static async uploadImageBuffer(
    buffer: Buffer,
    fileName: string,
    mimeType: string
  ): Promise<UploadedMedia> {
    this.validateFile({ type: mimeType, size: buffer.length, name: fileName });

    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_SECRET) {
      try {
        const result = await new Promise<any>((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: 'campus_connect',
              resource_type: 'image',
              transformation: [{ width: 1200, height: 1200, crop: 'limit' }],
            },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            }
          );
          uploadStream.end(buffer);
        });

        // Generate a 300x300 thumbnail URL
        const thumbUrl = cloudinary.url(result.public_id, {
          width: 300,
          height: 300,
          crop: 'fill',
          secure: true,
        });

        return {
          url: result.secure_url,
          thumbnailUrl: thumbUrl || result.secure_url,
          publicId: result.public_id,
          fileName,
          fileSize: buffer.length,
          fileType: mimeType,
        };
      } catch (err: any) {
        console.warn('Cloudinary upload failed, falling back to secure data URL storage:', err?.message || err);
      }
    }

    // Fallback for offline/local environment: create base64 Data URL format with valid metadata
    const base64Data = buffer.toString('base64');
    const dataUrl = `data:${mimeType};base64,${base64Data}`;
    const syntheticId = `cc_img_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    return {
      url: dataUrl,
      thumbnailUrl: dataUrl,
      publicId: syntheticId,
      fileName,
      fileSize: buffer.length,
      fileType: mimeType,
    };
  }
}
