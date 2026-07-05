import { v2 as cloudinary } from 'cloudinary';
import { env } from './envConfig.js';

cloudinary.config({
  cloudinary_url: env.cloudinaryUrl,
});

export async function connectCloudinary() {
  if (!env.cloudinaryUrl) {
    return {
      connected: false,
      message: 'CLOUDINARY_URL is not configured',
    };
  }

  try {
    const result = await cloudinary.api.ping();
    return {
      connected: true,
      cloudName: cloudinary.config().cloud_name,
      status: result,
    };
  } catch (error) {
    return {
      connected: false,
      message: error.message || 'Unable to reach Cloudinary',
    };
  }
}

export default cloudinary;
