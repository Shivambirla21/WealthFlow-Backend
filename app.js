import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './routes/index.js';
import { env } from './config/envConfig.js';
import { notFound, errorHandler } from './common/middleware/error.middleware.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.corsOrigin }));
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
