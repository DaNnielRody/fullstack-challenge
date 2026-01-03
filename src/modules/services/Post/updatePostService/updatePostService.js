import { getPostByPostIdRepositories, updatePostRepositories } from "#repositories/index.js";
import { logUpdate, logError } from '#common/services/logger/logger.js';

const updatePostService = async ({
    id,
    author_id,
    post_text
}) => {
    try {
        const {
            posts = []
        } = await getPostByPostIdRepositories({
            post_id: id
        });

        const has_post = Array.isArray(posts) && posts.length === 1;

        if (!has_post) {
            logError('UPDATE', 'POST', new Error("Hasn't post to update"), { post_id: id })
            throw new Error("Hasn't post to update")
        }

        await updatePostRepositories({
            id,
            author_id,
            post_text
        })

        logUpdate('POST', { 
            post_id: id,
            author_id
        });

        return {
            updatedpost: {
                id,
                author_id,
                post_text
            }
        };
    } catch (error) {
        logError('UPDATE', 'POST', error, { post_id: id })
        throw error
    }
}

export {
    updatePostService
};