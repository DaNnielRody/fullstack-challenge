import {
    getTransaction,
    commitTransaction,
    rollbackTransaction
} from '../../../common/handlers/index.js';


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

export {
    createPostRepositories
};