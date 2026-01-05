import { knex } from '#common/infrastructure/database/index.js';

const getUsersRepositories = async () => {
  const users = await knex('users').select('user_id', 'user_email', 'full_name');

  return {
    users,
  };
};

export { getUsersRepositories };
