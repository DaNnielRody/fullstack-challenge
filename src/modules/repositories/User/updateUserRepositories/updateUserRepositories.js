import {
  getTransaction,
  commitTransaction,
  rollbackTransaction,
} from '#common/infrastructure/database/index.js';

const updateUserRepositories = async ({
  user_id,
  user_email,
  user_password,
  full_name,
}) => {
  const { transaction } = await getTransaction();

  try {
    const updateData = {};

    if (user_email !== undefined) {
      updateData.user_email = user_email;
    }
    if (user_password !== undefined) {
      updateData.user_password = user_password;
    }
    if (full_name !== undefined) {
      updateData.full_name = full_name;
    }

    const rowsAffected = await transaction('users')
      .where({ user_id })
      .update(updateData);

    await commitTransaction({ transaction });

    return {
      rowsAffected,
    };
  } catch (err) {
    await rollbackTransaction({ transaction });
    throw err;
  }
};

export { updateUserRepositories };
