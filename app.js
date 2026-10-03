import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './routes/index.js';
import { env } from './config/envConfig.js';
import { notFound, errorHandler } from './common/middleware/error.middleware.js';

const app = express();

app.use(helmet());
const configuredOrigins = [env.corsOrigin, env.clientOrigin]
  .flatMap((value) => String(value || '').split(','))
  .map((value) => value.trim().replace(/\/$/, ''))
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin) {
      callback(null, true);
      return;
    }

    const normalized = origin.replace(/\/$/, '');
    const localDev = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(normalized);
    callback(null, localDev || configuredOrigins.includes(normalized));
  },
}));
app.use(express.json());
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'wealthflow-backend',
    message: 'WealthFlow backend is live and listening.',
    apiHealth: '/api/health',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api', routes);
app.use(notFound);
app.use(errorHandler);

export default app;
