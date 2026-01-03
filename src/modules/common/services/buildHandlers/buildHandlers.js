import {
    listUserHandler,
    createUserHandler,
    updateUserHandler,
    deleteUserHandler,
    listPostHandler,
    createPostHandler,
    updatePostHandler,
    deletePostHandler
} from '../../../handlers/index.js';

const buildHandlers = () => {
    return {
        handlers: {
            listUserHandler,
            createUserHandler,
            updateUserHandler,
            deleteUserHandler,
            listPostHandler,
            createPostHandler,
            updatePostHandler,
            deletePostHandler
        }
    }
}

export {
    buildHandlers
};