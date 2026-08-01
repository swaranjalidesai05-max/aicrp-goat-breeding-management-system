import { createApp, shutdown } from './app';
import { env } from './config/env';

const app = createApp();

const server = app.listen(env.port, () => {
  console.log(`[backend] listening on http://localhost:${env.port}`);
  console.log(`[backend] health: http://localhost:${env.port}${env.apiPrefix}/health`);
});

async function gracefulShutdown(signal: string) {
  console.log(`[backend] received ${signal}, shutting down...`);
  server.close(async () => {
    await shutdown();
    process.exit(0);
  });
}

process.on('SIGINT', () => {
  void gracefulShutdown('SIGINT');
});
process.on('SIGTERM', () => {
  void gracefulShutdown('SIGTERM');
});
