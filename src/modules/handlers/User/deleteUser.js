import httpStatusCodes from 'http-status-codes';
import { httpErrorHandler } from "../../common/handlers/index.js";
import { deleteUserService } from '../../services/index.js';

const deleteUserHandler = async (req, res, next) => {
    try{

        const {
            user_id
        } = req.query;

        const {
            deletedUser
        } = await deleteUserService({
            user_id
        })

        return res.status(httpStatusCodes.OK).send({deletedUser})
    }catch(error){
        return httpErrorHandler({ req, res, error })
    }
}

export {
    deleteUserHandler
};