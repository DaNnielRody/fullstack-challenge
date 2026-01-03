import { getUsersRepositories } from "../../../repositories/index.js";

const getAllUsersService = async () => {

    const {
        users = []
    } = await getUsersRepositories();

    const has_multiple_user = Array.isArray(users) && users.length > 0;

    return {
        users,
        has_multiple_user
    };
}

export {
    getAllUsersService
};