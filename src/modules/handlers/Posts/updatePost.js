import httpStatusCodes from 'http-status-codes';
import { httpErrorHandler } from '#common/handlers/index.js';
import { updatePostService } from '#services/index.js';
import { PostValidationError } from '#common/errors/index.js';
import { logError } from '#common/services/logger/logger.js';

const updatePostHandler = async (req, res, next) => {
  try {
    const post_id = Number(req.params.id);
    const { author_id, post_text } = req.body;
    const author_id_num = Number(author_id);

    if (!Number.isInteger(post_id) || post_id <= 0) {
      const error = new PostValidationError(
        'Invalid post id: must be a positive integer',
        { post_id }
      );
      logError('UPDATE', 'POST', error, { post_id });
      throw error;
    }

    if (!Number.isInteger(author_id_num) || author_id_num <= 0) {
      const error = new PostValidationError(
        'Invalid author_id: must be a positive integer',
        { author_id: author_id_num }
      );
      logError('UPDATE', 'POST', error, {
        post_id,
        author_id: author_id_num,
      });
      throw error;
    }

    if (typeof post_text !== 'string' || post_text.trim().length === 0) {
      const error = new PostValidationError(
        'Invalid post_text: must be a non-empty string',
        { post_text }
      );
      logError('UPDATE', 'POST', error, {
        post_id,
        author_id: author_id_num,
      });
      throw error;
    }

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
