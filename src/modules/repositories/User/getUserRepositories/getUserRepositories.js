import { knex } from '#common/handlers/index.js';

const getUserRepositories = async ({ user_id } = {}) => {
  const users = await knex('users')
    .select('user_id', 'user_email', 'full_name', 'user_password')
    .where({ user_id });

  return {
    users,
  };
};

export { getUserRepositories };
