import httpStatusCodes from 'http-status-codes';
import { httpErrorHandler } from '#common/errors/index.js';
import { createPostService } from '#services/index.js';
import { PostValidationError } from '#common/errors/index.js';
import { logError } from '#common/services/logger/logger.js';
import {
  validateStringAndThrow,
  validatePositiveIntegerAndThrow,
} from '#common/validations/index.js';

const createPostHandler = async (req, res, next) => {
  try {
    const { post_text, author_id } = req.body;

    validateStringAndThrow(
      post_text,
      'post_text',
      PostValidationError,
      logError,
      'CREATE',
      'POST'
    );

    const author_id_num = validatePositiveIntegerAndThrow(
      author_id,
      'author_id',
      PostValidationError,
      logError,
      'CREATE',
      'POST'
    );

    const created_post = await createPostService({
      post_text,
      author_id: author_id_num,
    });

    return res.status(httpStatusCodes.CREATED).send(created_post);
  } catch (error) {
    return httpErrorHandler({ req, res, error });
  }
};

export { createPostHandler };
