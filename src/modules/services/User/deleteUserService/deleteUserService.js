import { getUserRepositories, deleteUserRepositories } from "#repositories/index.js";
import { logDelete, logError } from '#common/services/logger/logger.js';

const deleteUserService = async ({
    user_id
}) => {
    try {
        const {
            users = []
        } = await getUserRepositories({
            user_id
        });

        const has_user = Array.isArray(users) && users.length === 1;

        if(!has_user){
            logError('DELETE', 'USER', new Error('No user to delete'), { user_id })
            throw new Error("No user to delete")
        }

        const [user_to_delete] = users;

        await deleteUserRepositories({
            user_id: user_to_delete.id
        })

        logDelete('USER', { 
            user_id: user_to_delete.id,
            user_email: user_to_delete.user_email,
            full_name: user_to_delete.full_name
        });

        return {
            deletedUser: user_to_delete
        };
    } catch (error) {
        logError('DELETE', 'USER', error, { user_id })
        throw error
    }
}

export {
    deleteUserService
};