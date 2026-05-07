import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';

export function createApp() {
  const app = express();

  app.use(helmet());
  // Allow localhost and any 192.168.x.x origin (local network dev)
  app.use(cors({
    origin: (origin, cb) => {
      if (!origin || origin === config.corsOrigin || /^http:\/\/192\.168\.\d+\.\d+(:\d+)?$/.test(origin) || /^http:\/\/localhost(:\d+)?$/.test(origin)) {
        cb(null, true);
      } else {
        cb(new Error(`CORS blocked: ${origin}`));
      }
    },
    credentials: true,
  }));
  app.use(express.json());

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  app.use('/api/v1', routes);
  app.use(errorHandler);

  return app;
}
