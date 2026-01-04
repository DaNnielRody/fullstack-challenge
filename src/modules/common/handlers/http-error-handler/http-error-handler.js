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

  let response = {};

  if (is_domain_error) {
    response = {
      type: error.name,
      message: error.message,
    };

    if (error.details) {
      response.details = error.details;
    }
    if (error.user_id) {
      response.user_id = error.user_id;
    }
    if (error.post_id) {
      response.post_id = error.post_id;
    }
    if (error.author_id) {
      response.author_id = error.author_id;
    }
    if (error.email) {
      response.email = error.email;
    }
    if (error.entityId) {
      response.entity_id = error.entityId;
    }
    if (error.referenceId) {
      response.reference_id = error.referenceId;
    }
  } else if (is_internal) {
    response = {
      type: `internal server error (${error_id})`,
    };
  } else {
    response = {
      message: error.message,
      details: error.details || error,
    };
  }

  const error_context = {
    error: String(error),
    error_id,
    error_name: error.name,
    is_domain_error,
    request: {
      headers: req.headers || {},
      host: req.get('host') || '',
      response_status_code: response_status_code || 0,
      params: req.params || {},
      path: req.originalUrl || '',
      protocol: req.protocol || '',
      query: req.query || {},
    },
    response,
    stack: error.stack,
  };
  console.log(JSON.stringify(error_context));

  return res.status(response_status_code).json(response).end();
};
export { httpErrorHandler };
