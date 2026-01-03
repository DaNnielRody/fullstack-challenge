const { 
    client,
} = require('../../../common/handlers');



const getPostByPostIdRepositories = async ({
    post_id
} = {}) => {
    const posts = await client('posts').where({ id: post_id })

    return { posts };
};

module.exports = { getPostByPostIdRepositories };