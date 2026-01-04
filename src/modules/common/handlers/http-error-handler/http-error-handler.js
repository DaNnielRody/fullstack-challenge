import { StatusCodes } from 'http-status-codes';
import { v4 as uuidv4 } from 'uuid';
import { DomainError } from '#common/errors/index.js';

const httpErrorHandler = ({ req, res, error }) => {
  const response_status_code =
    error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  const is_internal =
    response_status_code === StatusCodes.INTERNAL_SERVER_ERROR;
  const is_domain_error = error instanceof DomainError;
  const error_id = uuidv4();
  const is_critical = response_status_code >= 500;

  let response = {};

  if (is_domain_error) {
    response = {
      code: error.code || 'INTERNAL_ERROR',
      message: error.message,
    };
  } else if (is_internal) {
    response = {
      code: 'INTERNAL_ERROR',
    };
  } else {
    response = {
      code: 'INTERNAL_ERROR',
      message: error.message,
    };
  }

  const logEntry = {
    timestamp: new Date().toISOString(),
    level: is_critical ? 'error' : 'warn',
    error_id,
    error_code: error.code || 'INTERNAL_ERROR',
    message: error.message,
    request: {
      method: req.method,
      path: req.originalUrl || req.path,
      status: response_status_code,
      ip: req.ip || req.headers['x-forwarded-for']?.split(',')[0]?.trim(),
      user_agent: (() => {
        const ua = req.headers['user-agent'];
        if (!ua) return undefined;
        const chromeMatch = ua.match(/Chrome\/([^\s]+)/);
        if (chromeMatch) return `Chrome/${chromeMatch[1]}`;
        const firefoxMatch = ua.match(/Firefox\/([^\s]+)/);
        if (firefoxMatch) return `Firefox/${firefoxMatch[1]}`;
        const safariMatch = ua.match(/Safari\/([^\s]+)/);
        if (safariMatch) return `Safari/${safariMatch[1]}`;
        return ua.split(' ')[0];
      })(),
    },
    context: {
      ...(error.email && { email: error.email }),
      ...(error.user_id && { user_id: error.user_id }),
      ...(error.post_id && { post_id: error.post_id }),
      ...(error.author_id && { author_id: error.author_id }),
      ...(error.entityId && { entity_id: error.entityId }),
      ...(error.referenceId && { reference_id: error.referenceId }),
      ...(error.details && { details: error.details }),
    },
  };

  if (is_critical) {
    logEntry.stack = error.stack;
    logEntry.error_name = error.name;
  }

  console.error(JSON.stringify(logEntry));

  return res.status(response_status_code).json(response).end();
};
export { httpErrorHandler };
