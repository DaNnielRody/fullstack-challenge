import httpStatusCodes from 'http-status-codes';
import { httpErrorHandler } from '#common/errors/index.js';
import { patchPostService } from '#services/index.js';
import { PostValidationError } from '#common/errors/index.js';
import { logError } from '#common/services/logger/logger.js';
import {
  validateStringAndThrow,
  validatePositiveIntegerAndThrow,
} from '#common/validations/index.js';

const patchPostHandler = async (req, res, next) => {
  try {
    const post_id = validatePositiveIntegerAndThrow(
      req.params.id,
      'post id',
      PostValidationError,
      logError,
      'PATCH',
      'POST'
    );

    const { author_id, post_text } = req.body;

    if (!author_id && !post_text) {
      const error = new PostValidationError(
        'At least one field must be provided for update',
        {}
      );
      logError('PATCH', 'POST', error, { post_id });
      throw error;
    }

    let author_id_num = undefined;
    if (author_id !== undefined) {
      author_id_num = validatePositiveIntegerAndThrow(
        author_id,
        'author_id',
        PostValidationError,
        logError,
        'PATCH',
        'POST',
        { post_id }
      );
    }

    if (post_text !== undefined) {
      validateStringAndThrow(
        post_text,
        'post_text',
        PostValidationError,
        logError,
        'PATCH',
        'POST',
        { post_id, author_id: author_id_num }
      );
    }

    const updated_post = await patchPostService({
      post_id,
      author_id: author_id_num,
      post_text,
    });

    return res.status(httpStatusCodes.OK).send(updated_post);
  } catch (error) {
    return httpErrorHandler({ req, res, error });
  }
};

export { patchPostHandler };
