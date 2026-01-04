import httpStatusCodes from 'http-status-codes';
import { httpErrorHandler } from '#common/handlers/index.js';
import { updatePostService } from '#services/index.js';
import { PostValidationError } from '#common/errors/index.js';
import { logError } from '#common/services/logger/logger.js';
import {
  validateStringAndThrow,
  validatePositiveIntegerAndThrow,
} from '#common/validations/index.js';

const updatePostHandler = async (req, res, next) => {
  try {
    const post_id = validatePositiveIntegerAndThrow(
      req.params.id,
      'post id',
      PostValidationError,
      logError,
      'UPDATE',
      'POST'
    );

    const { author_id, post_text } = req.body;

    const author_id_num = validatePositiveIntegerAndThrow(
      author_id,
      'author_id',
      PostValidationError,
      logError,
      'UPDATE',
      'POST',
      { post_id }
    );

    validateStringAndThrow(
      post_text,
      'post_text',
      PostValidationError,
      logError,
      'UPDATE',
      'POST',
      { post_id, author_id: author_id_num }
    );

    const updated_post = await updatePostService({
      post_id,
      author_id: author_id_num,
      post_text,
    });

    return res.status(httpStatusCodes.OK).send(updated_post);
  } catch (error) {
    return httpErrorHandler({ req, res, error });
  }
};

export { updatePostHandler };
