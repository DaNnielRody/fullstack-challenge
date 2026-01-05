import httpStatusCodes from 'http-status-codes';
import { httpErrorHandler } from '#common/errors/index.js';
import { deletePostService } from '#services/index.js';
import { PostValidationError } from '#common/errors/index.js';
import { logError } from '#common/services/logger/logger.js';
import { validatePositiveIntegerAndThrow } from '#common/validations/index.js';

const deletePostHandler = async (req, res, next) => {
  try {
    const post_id = validatePositiveIntegerAndThrow(
      req.params.id,
      'post id',
      PostValidationError,
      logError,
      'DELETE',
      'POST'
    );

    await deletePostService({
      post_id,
    });

    return res.status(httpStatusCodes.NO_CONTENT).send();
  } catch (error) {
    return httpErrorHandler({ req, res, error });
  }
};

export { deletePostHandler };
