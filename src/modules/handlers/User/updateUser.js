import httpStatusCodes from 'http-status-codes';
import { httpErrorHandler } from "../../common/handlers/index.js";
import { updateUserService } from '../../services/index.js';

const updateUserHandler = async (req, res, next) => {
    try{
        const { id } = req.params;
        const {
            user_email,
            user_password,
            full_name
        } = req.body

        const updated_user = await updateUserService({
            id,
            user_email,
            user_password,
            full_name
        })

        return res.status(httpStatusCodes.OK).send(updated_user);
    }catch(error){
        return httpErrorHandler({ req, res, error })
    }
}

export {
    updateUserHandler
};