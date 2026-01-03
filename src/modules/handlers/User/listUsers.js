import httpStatusCodes from 'http-status-codes';
import { httpErrorHandler } from '#common/handlers/index.js';
import { getAllUsersService } from '#services/index.js';

const listUserHandler = async (req, res, next) => {
    try{
        const users_response = await getAllUsersService();
        const users = users_response.users || [];

        return res.status(httpStatusCodes.OK).send({users});
    }catch(error){
        return httpErrorHandler({ req, res, error })
    }
}

export {
    listUserHandler
};