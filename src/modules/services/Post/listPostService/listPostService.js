import { getUserByIdService } from "#services/User/getUserByIdService/getUserByIdService.js";
import { getPostByUserIdRepositories } from "#repositories/index.js";
import { logList, logError } from '#common/services/logger/logger.js';

const getPostByUserIdService = async ({
    user_id
}) => {
    try {
        const {
            user
        } = await getUserByIdService({
            user_id
        })

        const has_author = Array.isArray(user) && user.length > 0;

        if(has_author === false) {
            logError('LIST', 'POST', new Error("Missing author in database"), { user_id })
            throw new Error("Missing author in database")
        }

        const {
            posts = []
        } = await getPostByUserIdRepositories({
            user_id
        });

        logList('POST', { user_id, count: posts.length })

        return {
            posts
        };
    } catch (error) {
        logError('LIST', 'POST', error, { user_id })
        throw error;
    }
}

export {
    getPostByUserIdService
};