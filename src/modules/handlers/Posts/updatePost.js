import httpStatusCodes from 'http-status-codes';
import { httpErrorHandler } from '#common/handlers/index.js';
import { updatePostService } from '#services/index.js';
import { PostValidationError } from '#common/errors/index.js';
import { logError } from '#common/services/logger/logger.js';

const updatePostHandler = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { author_id, post_text } = req.body;
    const authorId = Number(author_id);

    if (Number.isInteger(id) && id > 0) {
      const error = new PostValidationError(
        'Invalid post id: must be a positive integer',
        { post_id: id }
      );
      logError('UPDATE', 'POST', error, { post_id: id });
      throw error;
    }

    if (Number.isInteger(authorId) && authorId > 0) {
      const error = new PostValidationError(
        'Invalid author_id: must be a positive integer',
        { author_id: authorId }
      );
      logError('UPDATE', 'POST', error, { post_id: id, author_id: authorId });
      throw error;
    }

    const updated_post = await updatePostService({
      id,
      author_id: authorId,
      post_text,
    });

    return res.status(httpStatusCodes.OK).send(updated_post);
  } catch (error) {
    return httpErrorHandler({ req, res, error });
  }
};

export { updatePostHandler };
