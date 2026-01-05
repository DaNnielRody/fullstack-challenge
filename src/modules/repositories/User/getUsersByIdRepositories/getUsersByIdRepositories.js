import { knex } from '#common/infrastructure/database/index.js';

const getUsersByIdRepositories = async ({ user_id } = {}) => {
  const users = await knex('users')
    .select('user_id', 'user_email', 'full_name')
    .where({ user_id });
  return { users };
};

export { getUsersByIdRepositories };
