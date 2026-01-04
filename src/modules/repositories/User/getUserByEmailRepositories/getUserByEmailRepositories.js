import { knex } from '#common/handlers/index.js';

const getUserByEmailRepositories = async ({ user_email } = {}) => {
  const users = await knex('users')
    .select('id', 'user_email', 'full_name')
    .where({ user_email });

  return { users };
};

export { getUserByEmailRepositories };
