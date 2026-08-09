import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import { env } from './config/env';
import { prisma } from './lib/prisma';
import { authRouter } from './modules/auth/presentation/auth.routes';
import { breedingRouter } from './modules/breeding/presentation/breeding.routes';
import { buckRouter } from './modules/bucks/presentation/buck.routes';
import { clusterRouter } from './modules/clusters/presentation/cluster.routes';
import { doeRouter } from './modules/does/presentation/doe.routes';
import { farmerRouter } from './modules/farmers/presentation/farmer.routes';
import { notificationRouter } from './modules/notifications/presentation/notification.routes';
import { reportRouter } from './modules/reports/presentation/report.routes';
import { progenyRouter } from './modules/progeny/presentation/progeny.routes';
import { villageRouter } from './modules/villages/presentation/village.routes';
import { weightRouter } from './modules/weights/presentation/weight.routes';
import { healthRouter } from './routes/health';
import { errorHandler } from './presentation/middleware/errorHandler';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: true,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

  app.get('/', (_req, res) => {
    res.json({
      name: 'AICRP Goat Breeding API',
      status: 'ok',
      version: '0.1.0',
    });
  });

  app.use(`${env.apiPrefix}/health`, healthRouter);
  app.use(`${env.apiPrefix}/auth`, authRouter);
  app.use(`${env.apiPrefix}/clusters`, clusterRouter);
  app.use(`${env.apiPrefix}/villages`, villageRouter);
  app.use(`${env.apiPrefix}/farmers`, farmerRouter);
  app.use(`${env.apiPrefix}/bucks`, buckRouter);
  app.use(`${env.apiPrefix}/does`, doeRouter);
  app.use(`${env.apiPrefix}/breeding-events`, breedingRouter);
  app.use(`${env.apiPrefix}/progeny`, progenyRouter);
  app.use(`${env.apiPrefix}/weights`, weightRouter);
  app.use(`${env.apiPrefix}/notifications`, notificationRouter);
  app.use(`${env.apiPrefix}/reports`, reportRouter);

  app.use((_req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  app.use(errorHandler);

  return app;
}

export async function shutdown() {
  await prisma.$disconnect();
}
