import {
    getTransaction,
    commitTransaction,
    rollbackTransaction
} from '../../../common/handlers/index.js';

const deletePostRepositories = async (
    {post_id}
) => {
    const { transaction } = await getTransaction();

    try {
        const deleted = await transaction('posts').where({ id: post_id }).del()

        await commitTransaction({transaction})

        return {
            deleted
        }
        
    } catch (err) {
        await rollbackTransaction({transaction})
        throw err
    }
}

export {
    deletePostRepositories
};