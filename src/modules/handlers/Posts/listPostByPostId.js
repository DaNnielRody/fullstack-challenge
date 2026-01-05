import httpStatusCodes from 'http-status-codes';
import { httpErrorHandler } from '#common/errors/index.js';
import { getPostByPostIdService } from '#services/index.js';
import { PostValidationError } from '#common/errors/index.js';
import { logError } from '#common/services/logger/logger.js';
import { validatePositiveIntegerAndThrow } from '#common/validations/index.js';

const listPostByPostIdHandler = async (req, res, next) => {
  try {
    const post_id = validatePositiveIntegerAndThrow(
      req.params.id,
      'post_id',
      PostValidationError,
      logError,
      'READ',
      'POST'
    );

    const { post } = await getPostByPostIdService({
      post_id,
    });

    return res.status(httpStatusCodes.OK).send(post);
  } catch (error) {
    return httpErrorHandler({ req, res, error });
  }
};

export { listPostByPostIdHandler };

