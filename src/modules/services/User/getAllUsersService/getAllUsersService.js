import { getUsersRepositories } from "#repositories/index.js";
import { logList, logError } from '#common/services/logger/logger.js';

const getAllUsersService = async () => {
    try {
        const {
            users = []
        } = await getUsersRepositories();

        const has_multiple_user = Array.isArray(users) && users.length > 0;

        logList('USER', { count: users.length })

        return {
            users,
            has_multiple_user
        };
    } catch (error) {
        logError('LIST', 'USER', error)
        throw error
    }
}

export {
    getAllUsersService
};