import { 
    knex
} from '../../../common/handlers/index.js';

const getPostByUserIdRepositories = async ({
    user_id
} = {}) => {

    const posts = await knex('posts').where({author_id: user_id})

    return {
        posts
    };
};

export { getPostByUserIdRepositories };