import cloudinary from 'cloudinary';

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export class MediaService {
  static generateSignature(context: 'IssueAttachment' | 'LostFoundAttachment' | 'ResolutionPhoto') {
    const timestamp = Math.round(Date.now() / 1000);
    const folder = `campus_connect/${context}`;
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET || 'campus_connect_preset';

    const paramsToSign = {
      timestamp,
      folder,
      upload_preset: uploadPreset,
    };

    const apiSecret = process.env.CLOUDINARY_API_SECRET || 'dummysecret';
    const signature = cloudinary.v2.utils.api_sign_request(paramsToSign, apiSecret);

    return {
      timestamp,
      folder,
      signature,
      apiKey: process.env.CLOUDINARY_API_KEY || '1234567890',
      cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'campusconnect',
      uploadPreset,
    };
  }

  static validateFileConstraints(
    fileType: string,
    fileSize: number,
    context: 'IssueAttachment' | 'LostFoundAttachment' | 'ResolutionPhoto'
  ): { valid: boolean; error?: string } {
    const normalizedType = fileType.toUpperCase();

    if (context === 'ResolutionPhoto') {
      if (fileSize > 5 * 1024 * 1024) return { valid: false, error: 'Resolution photos must not exceed 5 MB' };
      if (!['JPEG', 'PNG', 'IMAGE/JPEG', 'IMAGE/PNG'].includes(normalizedType)) {
        return { valid: false, error: 'Resolution photos must be JPEG or PNG format' };
      }
    } else if (context === 'LostFoundAttachment') {
      if (fileSize > 10 * 1024 * 1024) return { valid: false, error: 'Attachments must not exceed 10 MB' };
      if (!['JPEG', 'PNG', 'IMAGE/JPEG', 'IMAGE/PNG'].includes(normalizedType)) {
        return { valid: false, error: 'Lost & Found photos must be JPEG or PNG format' };
      }
    } else {
      if (fileSize > 10 * 1024 * 1024) return { valid: false, error: 'Attachments must not exceed 10 MB' };
      if (!['JPEG', 'PNG', 'PDF', 'MP4', 'IMAGE/JPEG', 'IMAGE/PNG', 'APPLICATION/PDF', 'VIDEO/MP4'].includes(normalizedType)) {
        return { valid: false, error: 'Allowed formats: JPEG, PNG, PDF, MP4' };
      }
    }

    return { valid: true };
  }
}
