import { Cloudinary } from '@cloudinary/url-gen';

// Initialize Cloudinary
const cld = new Cloudinary({
  cloud: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME
  }
});

// Export Cloudinary configuration
export const cloudinaryConfig = {
  cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET,
  apiKey: process.env.CLOUDINARY_API_KEY,
  apiSecret: process.env.CLOUDINARY_API_SECRET
};

// Log configuration (excluding sensitive data)
console.log('Cloudinary Configuration:', {
  cloudName: cloudinaryConfig.cloudName,
  uploadPreset: cloudinaryConfig.uploadPreset,
  hasApiKey: !!cloudinaryConfig.apiKey,
  hasApiSecret: !!cloudinaryConfig.apiSecret
});

export { cld }; 