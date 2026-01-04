import { knex } from '#common/handlers/index.js';

const getUsersRepositories = async () => {
  const users = await knex('users').select('id', 'user_email', 'full_name');

  return {
    users,
  };
};

export { getUsersRepositories };
