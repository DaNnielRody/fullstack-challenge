const {
    getTransaction,
    commitTransaction,
    rollbackTransaction
} = require('../../../common/handlers')

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

module.exports = {
    deletePostRepositories
}