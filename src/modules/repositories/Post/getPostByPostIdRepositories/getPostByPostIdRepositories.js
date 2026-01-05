import { knex } from '#common/infrastructure/database/index.js';

const getPostByPostIdRepositories = async ({ post_id } = {}) => {
  const posts = await knex('posts')
    .select('post_id', 'author_id', 'post_text')
    .where({ post_id });

  return { posts };
};

export { getPostByPostIdRepositories };
