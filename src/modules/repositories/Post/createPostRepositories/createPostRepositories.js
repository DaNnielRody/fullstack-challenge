const {
    getTransaction,
    commitTransaction,
    rollbackTransaction
} = require('../../../common/handlers')


const createPostRepositories = async ({
    post
} = {}) => {
    const { transaction } = await getTransaction();

    try {
        const post_created = await transaction('posts').insert(post)

        await commitTransaction({transaction})

        return { post_created };

    } catch (err) {
        await rollbackTransaction({transaction})
        throw err
    }
}

module.exports = {
    createPostRepositories
}