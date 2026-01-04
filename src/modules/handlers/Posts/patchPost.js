import httpStatusCodes from 'http-status-codes';
import { httpErrorHandler } from '#common/handlers/index.js';
import { patchPostService } from '#services/index.js';
import { PostValidationError } from '#common/errors/index.js';
import { logError } from '#common/services/logger/logger.js';

const patchPostHandler = async (req, res, next) => {
  try {
    const post_id = Number(req.params.id);
    const { author_id, post_text } = req.body;

    if (!Number.isInteger(post_id) || post_id <= 0) {
      const error = new PostValidationError(
        'Invalid post id: must be a positive integer',
        { post_id }
      );
      logError('PATCH', 'POST', error, { post_id });
      throw error;
    }

    if (!author_id && !post_text) {
      const error = new PostValidationError(
        'At least one field must be provided for update',
        {}
      );
      logError('PATCH', 'POST', error, { post_id });
      throw error;
    }

    const updated_post = await patchPostService({
      id: post_id,
      author_id: author_id ? Number(author_id) : undefined,
      post_text,
    });

    return res.status(httpStatusCodes.OK).send(updated_post);
  } catch (error) {
    return httpErrorHandler({ req, res, error });
  }
};

export { patchPostHandler };
