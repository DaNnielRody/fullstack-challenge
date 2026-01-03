import bcrypt from 'bcryptjs';
import { getUserRepositories, updateUserRepositories } from "#repositories/index.js";
import { logUpdate, logError } from '#common/services/logger/logger.js';

const salt = bcrypt.genSaltSync(10);

const updateUserService = async ({
    id,
    user_email,
    user_password,
    full_name
}) => {
    try {
        const {
            users = []
        } = await getUserRepositories({
            user_id: id
        });

        const has_user = Array.isArray(users) && users.length === 1;

        if (!has_user) {
            logError('UPDATE', 'USER', new Error('Missing user to update'), { user_id: id })
            throw new Error("Missing user to update")
        }

        const [user_to_update] = users;

        const crypt_password = bcrypt.hashSync(user_to_update.user_password, salt);

        await updateUserRepositories({
            id,
            user_email,
            user_password: crypt_password,
            full_name
        })

        logUpdate('USER', { 
            user_id: id,
            user_email,
            full_name
        })

        return {
            updatedUser: {
                id,
                user_email,
                user_password,
                full_name
            }
        };
    } catch (error) {
        logError('UPDATE', 'USER', error, { user_id: id })
        throw error
    }
}

export {
    updateUserService
};