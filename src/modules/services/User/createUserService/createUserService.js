import bcrypt from 'bcryptjs';
import { createUserRepositories } from "#repositories/index.js";
import { logCreate, logError } from '#common/services/logger/logger.js';

const salt = bcrypt.genSaltSync(10);

const createUserService = async (user) => {
    try {
        const crypt_password = bcrypt.hashSync(user.user_password, salt);

        const {
            user_created
        } = await createUserRepositories({
            user:{
                ...user,
                user_password: crypt_password
            }
        });

        const has_user_created = Array.isArray(user_created) && user_created.length > 0;

        if(has_user_created === false){
            logError('CREATE', 'USER', new Error('Failed to create user'), { user_email: user.user_email })
            return {
                user_created_id: []
            }
        }

        logCreate('USER', { 
            user_id: user_created[0], 
            user_email: user.user_email,
            full_name: user.full_name 
        })

        return {
            user_created_id: user_created
        };
    } catch (error) {
        logError('CREATE', 'USER', error, { user_email: user.user_email })
        throw error
    }
}

export {
    createUserService
};