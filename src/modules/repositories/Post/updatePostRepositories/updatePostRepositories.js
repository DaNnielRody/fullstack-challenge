import {
  getTransaction,
  commitTransaction,
  rollbackTransaction,
} from '#common/infrastructure/database/index.js';

const updatePostRepositories = async ({ post_id, author_id, post_text }) => {
  const { transaction } = await getTransaction();

  try {
    const updateData = {};

    if (author_id !== undefined) {
      updateData.author_id = author_id;
    }
    if (post_text !== undefined) {
      updateData.post_text = post_text;
    }

    const rowsAffected = await transaction('posts')
      .where({ post_id })
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

export { updatePostRepositories };
