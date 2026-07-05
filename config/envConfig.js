import 'dotenv/config';

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  corsOrigin: process.env.CORS_ORIGIN || '*',
  databaseUrl: process.env.DATABASE_URL,
  cloudinaryUrl: process.env.CLOUDINARY_URL,
  jwtSecret: process.env.JWT_SECRET || 'replace-this-with-a-secret',
};

export { env };
