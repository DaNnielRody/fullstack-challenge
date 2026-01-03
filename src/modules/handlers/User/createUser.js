import httpStatusCodes from 'http-status-codes';
import { httpErrorHandler } from "#common/handlers/index.js";
import { createUserService } from '#services/index.js';

const createUserHandler = (req, res, next) => {
    try{
        const {
            user_email,
            user_password,
            full_name
        } = req.body

        const created_user = createUserService({
            user_email,
            user_password,
            full_name
        })

        return res.status(httpStatusCodes.OK).send(created_user);
    }catch(error){
        return httpErrorHandler({ req, res, error })
    }
}

export {
    createUserHandler
};