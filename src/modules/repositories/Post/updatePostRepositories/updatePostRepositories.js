import {
    getTransaction,
    commitTransaction,
    rollbackTransaction
} from '../../../common/handlers/index.js';

const updatePostRepositories = async ({
    id,
    author_id,
    post_text
}) => {
    const { transaction } = await getTransaction();

    try {

        const rowsAffected = await transaction('posts').where({ id }).update({
            author_id,
            post_text
        })

        await commitTransaction({ transaction })

        return {
            rowsAffected
        };
    } catch (err) {
        await rollbackTransaction({ transaction })
        throw err
    }
}

export {
    updatePostRepositories
};