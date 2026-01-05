import winston, { format, createLogger } from 'winston';
import path from 'path';
import fs from 'fs';
import config from '#modules/config.js';

const logsDir = path.join(process.cwd(), config.logger.dir);

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const { combine, timestamp, colorize, errors, splat, json, printf } = format;

const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
};

const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'blue',
};

winston.addColors(logColors);

const logFormat = combine(
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  splat(),
  json()
);

const consoleFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  printf((info) => {
    const { timestamp, level, message, ...meta } = info;
    const metaString = Object.keys(meta).length
      ? JSON.stringify(meta, null, 2)
      : '';
    return `[${timestamp}] ${level}: ${message} ${metaString}`;
  })
);

const logger = createLogger({
  level: config.logger.level,
  levels: logLevels,
  format: logFormat,
  transports: [
    new winston.transports.Console({
      format: consoleFormat,
    }),
    new winston.transports.File({
      filename: path.join(logsDir, 'app.log'),
      level: 'info',
      format: logFormat,
    }),
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'exceptions.log'),
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'rejections.log'),
    }),
  ],
});

const logOperation = (operation, entity, data = {}) => {
  logger.info(`${operation} ${entity}`, {
    operation,
    entity,
    ...data,
  });
};

const logError = (operation, entity, error, data = {}) => {
  const isDomainError = error.statusCode && error.statusCode < 500;
  const logLevel = isDomainError ? 'warn' : 'error';

  const logEntry = {
    operation,
    entity,
    error_code: error.code || 'UNKNOWN',
    message: error.message,
    ...data,
  };

  if (!isDomainError) {
    logEntry.stack = error.stack;
    logEntry.error_name = error.name;
  }

  logger[logLevel](`${operation} ${entity} failed`, logEntry);
};

const logCreate = (entity, data = {}) => {
  logOperation('CREATE', entity, data);
};

const logUpdate = (entity, data = {}) => {
  logOperation('UPDATE', entity, data);
};

const logDelete = (entity, data = {}) => {
  logOperation('DELETE', entity, data);
};

const logRead = (entity, data = {}) => {
  logOperation('READ', entity, data);
};

const logList = (entity, data = {}) => {
  logOperation('LIST', entity, data);
};

export {
  logger,
  logOperation,
  logError,
  logCreate,
  logUpdate,
  logDelete,
  logRead,
  logList,
};
