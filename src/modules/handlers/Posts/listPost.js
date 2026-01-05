import httpStatusCodes from 'http-status-codes';
import { httpErrorHandler } from '#common/handlers/index.js';
import { getAllPostsService } from '#services/index.js';

const listPostHandler = async (req, res, next) => {
  try {
    const posts_response = await getAllPostsService();
    const posts = posts_response.posts || [];

    return res.status(httpStatusCodes.OK).send(posts);
  } catch (error) {
    return httpErrorHandler({ req, res, error });
  }
};

export { listPostHandler };
