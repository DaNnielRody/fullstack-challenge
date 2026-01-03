import { 
    knex
} from '../../../common/handlers/index.js';


const getUserRepositories = async ({
    user_id
} = {}) => {

    const users = await knex('users').where({ id: user_id })

    return {
        users
    };
};

export { getUserRepositories };