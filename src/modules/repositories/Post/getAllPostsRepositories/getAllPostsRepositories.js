import { knex } from '#common/handlers/index.js';

const getAllPostsRepositories = async () => {
  const posts = await knex('posts').select('post_id', 'author_id', 'post_text');

  return {
    posts,
  };
};

export { getAllPostsRepositories };
