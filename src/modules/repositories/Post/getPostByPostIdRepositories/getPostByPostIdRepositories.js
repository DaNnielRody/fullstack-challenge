import { 
    knex,
} from '#common/handlers/index.js';



const getPostByPostIdRepositories = async ({
    post_id
} = {}) => {
    const posts = await knex('posts').where({ id: post_id })

    return { posts };
};

export { getPostByPostIdRepositories };