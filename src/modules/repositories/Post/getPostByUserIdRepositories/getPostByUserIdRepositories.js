import { knex } from '#common/infrastructure/database/index.js';

const getPostByUserIdRepositories = async ({
    user_id
} = {}) => {

    const posts = await knex('posts')
        .select('post_id', 'author_id', 'post_text')
        .where({author_id: user_id})

    return {
        posts
    };
};

export { getPostByUserIdRepositories };