import { getPostByPostIdRepositories, deletePostRepositories } from "#repositories/index.js";
import { logDelete, logError } from '#common/services/logger/logger.js';

const deletePostService = async ({
    post_id
}) => {
    try {
        const {
            posts = []
        } = await getPostByPostIdRepositories({
            post_id
        });

        const has_post = Array.isArray(posts) && posts.length === 1;

        if(!has_post){
            logError('DELETE', 'POST', new Error("Hasn't post to delete"), { post_id })
            throw new Error("Hasn't post to delete")
        }

        const [post_to_delete] = posts;

        await deletePostRepositories({
            post_id: post_to_delete.id
        })

        logDelete('POST', { 
            post_id: post_to_delete.id,
            author_id: post_to_delete.author_id
        })

        return {
            deletedPost: post_to_delete
        };
    } catch (error) {
        logError('DELETE', 'POST', error, { post_id })
        throw error
    }
}

export {
    deletePostService
};