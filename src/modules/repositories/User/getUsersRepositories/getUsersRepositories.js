const { 
    client
} = require('../../../common/handlers')


const getUsersRepositories = async () => {

    const users = await client('users')

    return {
        users
    }
};

module.exports = { getUsersRepositories };