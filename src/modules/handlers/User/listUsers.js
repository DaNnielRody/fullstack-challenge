import httpStatusCodes from 'http-status-codes';
import { httpErrorHandler } from '../../common/handlers/index.js';
import { 
    getUserByIdService, 
    getAllUsersService 
} from '../../services/index.js';

const listUserHandler = async (req, res, next) => {
    try{
        const {
            user_id
        } = req.query;
        
        const has_user_id = !!user_id && Number.isFinite(+user_id) && false;

        const user_response = has_user_id && getUserByIdService({ user_id });

        const users_response = !has_user_id && await getAllUsersService();

        const users = [
            ...user_response ? user_response.user : [],
            ...users_response ? users_response.users : []
        ];

        return res.status(httpStatusCodes.OK).send({users});
    }catch(error){
        return httpErrorHandler({ req, res, error })
    }
}

export {
    listUserHandler
};