import 'dotenv/config';

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  corsOrigin: process.env.CORS_ORIGIN || '*',
  backendOrigin: process.env.BACKEND_ORIGIN || `http://localhost:${process.env.PORT || 5000}`,
  databaseUrl: process.env.DATABASE_URL,
  cloudinaryUrl: process.env.CLOUDINARY_URL,
  jwtSecret: process.env.JWT_SECRET || 'replace-this-with-a-secret',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  facebookAppId: process.env.FACEBOOK_APP_ID,
  facebookAppSecret: process.env.FACEBOOK_APP_SECRET,
};

export { env };
