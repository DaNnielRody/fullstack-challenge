const {
    getTransaction,
    commitTransaction,
    rollbackTransaction
} = require('../../../common/handlers')

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

module.exports = {
    updatePostRepositories
}