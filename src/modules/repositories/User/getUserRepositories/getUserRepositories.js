const { 
    client
} = require('../../../common/handlers')


const getUserRepositories = async ({
    user_id
} = {}) => {

    const users = await client('users').where({ id: user_id })

    return {
        users
    };
};

module.exports = { getUserRepositories };