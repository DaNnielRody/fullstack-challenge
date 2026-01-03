import winston, { format, createLogger } from 'winston';
import path from 'path';

const logsDir = process.env.LOG_DIR || path.join(process.cwd(), 'app/logs');

const { combine, timestamp, colorize, errors, splat, json, printf } = format;

const logLevels = {
    error: 0,
    info: 1,
    http: 2,
};

const logColors = {
    error: 'red',
    info: 'green',
    http: 'blue',
};

winston.addColors(logColors);

const logFormat = combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    splat(),
    json(),
);

const consoleFormat = combine(
    colorize({ all: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    printf(
        (info) => {
            const { timestamp, level, message, ...meta } = info;
            const metaString = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
            return `[${timestamp}] ${level}: ${message} ${metaString}`;
        }
    ),
);

const logger = createLogger({
    level: process.env.LOG_LEVEL,
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
    logger.error(`Error in ${operation} ${entity}`, {
        operation,
        entity,
        error: error.message,
        stack: error.stack,
        ...data,
    });
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

