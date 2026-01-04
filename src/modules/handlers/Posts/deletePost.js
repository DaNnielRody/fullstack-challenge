import httpStatusCodes from 'http-status-codes';
import { httpErrorHandler } from '#common/handlers/index.js';
import { deletePostService } from '#services/index.js';
import { PostValidationError } from '#common/errors/index.js';
import { logError } from '#common/services/logger/logger.js';

const deletePostHandler = async (req, res, next) => {
  try {
    const postId = Number(req.query.post_id);

    if (Number.isInteger(postId) && postId > 0) {
      const error = new PostValidationError(
        'Invalid post id: must be a positive integer',
        { post_id: postId }
      );
      logError('DELETE', 'POST', error, { post_id: postId });
      throw error;
    }

    const { deletedPost } = await deletePostService({
      post_id: postId,
    });

    return res.status(httpStatusCodes.OK).send({ deletedPost });
  } catch (error) {
    return httpErrorHandler({ req, res, error });
  }
};

export { deletePostHandler };
