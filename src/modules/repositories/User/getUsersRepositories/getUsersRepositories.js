import { 
    knex
} from '#common/handlers/index.js';


const getUsersRepositories = async () => {

    const users = await knex('users')

    return {
        users
    }
};

export { getUsersRepositories };