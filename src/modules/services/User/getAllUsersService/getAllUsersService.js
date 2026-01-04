import { getUsersRepositories } from '#repositories/index.js';
import { logList } from '#common/services/logger/logger.js';
import { handleServiceError } from '#common/errors/index.js';

const getAllUsersService = async () => {
  try {
    const { users = [] } = await getUsersRepositories();

    logList('USER', { count: users.length });

    return {
      users,
    };
  } catch (error) {
    handleServiceError('LIST', 'USER', error, {});
  }
};

export { getAllUsersService };
