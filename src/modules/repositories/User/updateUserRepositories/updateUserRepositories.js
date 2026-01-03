const {
    getTransaction,
    commitTransaction,
    rollbackTransaction
} = require('../../../common/handlers')

const updateUserRepositories = async ({
    id,
    user_email,
    user_password,
    full_name
}) => {
    const { transaction } = await getTransaction();

    try {

        const rowsAffected = await transaction('users').where({ id }).update({
            user_email,
            user_password,
            full_name
        });

        await commitTransaction({ transaction })

        return {
            rowsAffected
        }

    } catch (err) {
        await rollbackTransaction({ transaction })
        throw err
    }
}

module.exports = { updateUserRepositories };