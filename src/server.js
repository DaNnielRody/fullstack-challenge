import { logger } from '#common/services/logger/logger.js';
import config from '#modules/config.js';
import { app } from './app.js';

app.listen(config.server.port, () => {
  logger.info('Server running', { port: config.server.port });
});