import { getPostByPostIdRepositories, deletePostRepositories } from "../../../repositories/index.js";

const deletePostService = async ({
    post_id
}) => {

    const {
        posts = []
    } = await getPostByPostIdRepositories({
        post_id
    });

    const has_post = Array.isArray(posts) && posts.length === 1;

    if(!has_post){
        throw new Error("Hasn't post to delete")
    }

    const [post_to_delete] = posts;

    await deletePostRepositories({
        post_id: post_to_delete.id
    })

    return {
        deletedPost: post_to_delete
    };
}

export {
    deletePostService
};