import httpStatusCodes from 'http-status-codes';
import { httpErrorHandler } from '#common/handlers/index.js';
import { createPostService } from '#services/index.js';
import { PostValidationError } from '#common/errors/index.js';
import { logError } from '#common/services/logger/logger.js';

const createPostHandler = async (req, res, next) => {
  try {
    const { post_text, author_id } = req.body;
    const author_id_num = Number(author_id);

    if (typeof post_text !== 'string' || post_text.trim().length === 0) {
      const error = new PostValidationError(
        'Invalid post_text: must be a non-empty string',
        { post_text }
      );
      logError('CREATE', 'POST', error, { author_id: author_id_num });
      throw error;
    }

    if (!Number.isInteger(author_id_num) || author_id_num <= 0) {
      const error = new PostValidationError(
        'Invalid author_id: must be a positive integer',
        { author_id: author_id_num }
      );
      logError('CREATE', 'POST', error, { author_id: author_id_num });
      throw error;
    }

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
