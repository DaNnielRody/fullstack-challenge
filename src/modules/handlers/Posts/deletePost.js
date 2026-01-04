import httpStatusCodes from 'http-status-codes';
import { httpErrorHandler } from '#common/handlers/index.js';
import { deletePostService } from '#services/index.js';
import { PostValidationError } from '#common/errors/index.js';
import { logError } from '#common/services/logger/logger.js';

const deletePostHandler = async (req, res, next) => {
  try {
    const post_id = Number(req.params.id);

    if (!Number.isInteger(post_id) || post_id <= 0) {
      const error = new PostValidationError(
        'Invalid post id: must be a positive integer',
        { post_id }
      );
      logError('DELETE', 'POST', error, { post_id });
      throw error;
    }

    await deletePostService({
      post_id,
    });

    return res.status(httpStatusCodes.NO_CONTENT).send();
  } catch (error) {
    return httpErrorHandler({ req, res, error });
  }
};

export { deletePostHandler };
