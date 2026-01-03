const {
    getTransaction,
    commitTransaction,
    rollbackTransaction
} = require('../../../common/handlers')


const createUserRepositories = async ({
    user
} = {}) => {
    const { transaction } = await getTransaction();

    try {
        const user_created = await transaction('users').insert(user)
        
        await commitTransaction({transaction})

        return { user_created };

    } catch (err) {
        await rollbackTransaction({transaction})
        throw err
    }
}

module.exports = {
    createUserRepositories
}