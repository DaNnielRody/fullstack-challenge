import { getUserByIdService } from "#services/User/getUserByIdService/getUserByIdService.js";
import { createPostRepositories } from "#repositories/index.js";
import { logCreate, logError } from '#common/services/logger/logger.js';

const createPostService = async (post) => {
    try {
        const {
            author_id
        } = post;

        const {
            user
        } = await getUserByIdService({
            user_id: author_id
        })

        const has_author = Array.isArray(user) && user.length > 0;
        
        if(has_author === false) {
            logError('CREATE', 'POST', new Error("Hasn't author in database"), { author_id })
            throw new Error("Hasn't author in database")
        }

        const {
            post_created
        } = await createPostRepositories({
            post
        });

        const has_post_created = Array.isArray(post_created) && post_created.length > 0;

        if(has_post_created === false){
            logError('CREATE', 'POST', new Error('Failed to create post'), { author_id })
            return {
                post_created_id: []
            }  
        }

        logCreate('POST', { 
            post_id: post_created[0],
            author_id,
            title: post.title
        })

        return {
            post_created_id: post_created
        };
    } catch (error) {
        logError('CREATE', 'POST', error, { author_id: post.author_id })
        throw error
    }
}

export {
    createPostService
};