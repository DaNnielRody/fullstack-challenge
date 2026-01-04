import { getUsersRepositories } from '#repositories/index.js';
import { logList, logError } from '#common/services/logger/logger.js';

const getAllUsersService = async () => {
  try {
    const { users = [] } = await getUsersRepositories();

    logList('USER', { count: users.length });

    return {
      users,
    };
  } catch (error) {
    logError('LIST', 'USER', error);
    throw error;
  }
};

export { getAllUsersService };
