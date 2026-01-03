import {
    getTransaction,
    commitTransaction,
    rollbackTransaction
} from '../../../common/handlers/index.js';

const deleteUserRepositories = async ({
    user_id
}) => {
    const { transaction } = await getTransaction();

    try {
        const rowsAffected = await transaction('users').where({id: user_id}).del()

        await commitTransaction({transaction})

        return {
            rowsAffected
        }
        
    } catch (err) {
        await rollbackTransaction({transaction})
        throw err
    }
}

export {
    deleteUserRepositories
};