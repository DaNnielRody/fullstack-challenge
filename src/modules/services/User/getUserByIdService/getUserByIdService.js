import { getUsersByIdRepositories } from "#repositories/index.js";
import { logRead, logError } from '#common/services/logger/logger.js';

const getUserByIdService = async ({
    user_id
}) => {
    try {
        const has_user_id = !!user_id;

        if (!has_user_id) {
            logError('READ', 'USER', new Error('Missing user_id'), { user_id })
            return {
                user: false,
                has_single_user: false
            }
        }

        const {
            users = []
        } = await getUsersByIdRepositories({
            user_id
        })

        const has_single_user = Array.isArray(users) && users.length > 0;

        logRead('USER', { user_id, found: has_single_user })

        return {
            user: users,
            has_single_user
        };
    } catch (error) {
        logError('READ', 'USER', error, { user_id })
        throw error
    }
}

export {
    getUserByIdService
};