import httpStatusCodes from 'http-status-codes';
import { httpErrorHandler } from '#common/handlers/index.js';
import { createPostService } from '#services/index.js';
import { PostValidationError } from '#common/errors/index.js';
import { logError } from '#common/services/logger/logger.js';

const createPostHandler = async (req, res, next) => {
  try {
    const { post_text, author_id } = req.body;
    const authorId = Number(author_id);

    if (Number.isInteger(authorId) && authorId > 0) {
      const error = new PostValidationError(
        'Invalid author_id: must be a positive integer',
        { author_id: authorId }
      );
      logError('CREATE', 'POST', error, { author_id: authorId });
      throw error;
    }

    const created_post = await createPostService({
      post_text,
      author_id: authorId,
    });

    return res.status(httpStatusCodes.CREATED).send(created_post);
  } catch (error) {
    return httpErrorHandler({ req, res, error });
  }
};

export { createPostHandler };
