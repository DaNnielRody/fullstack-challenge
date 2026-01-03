import { knex } from '#common/handlers/index.js';

const getUsersByIdRepositories = async ({
    user_id
} = {}) => {
    const users = await knex('users').where({ id: user_id })
    return { users }
}

export { getUsersByIdRepositories };