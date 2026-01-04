import { getAllPostsRepositories } from '#repositories/index.js';
import { logList } from '#common/services/logger/logger.js';
import { handleServiceError } from '#common/errors/index.js';

const getAllPostsService = async () => {
  try {
    const { posts = [] } = await getAllPostsRepositories();

    logList('POST', { count: posts.length });

    return {
      posts,
    };
  } catch (error) {
    handleServiceError('LIST', 'POST', error, {});
  }
};

export { getAllPostsService };

