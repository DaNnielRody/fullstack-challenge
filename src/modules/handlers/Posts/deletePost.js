import httpStatusCodes from 'http-status-codes';
import { httpErrorHandler } from "../../common/handlers/index.js";
import { deletePostService } from '../../services/index.js';

const deletePostHandler = async (req, res, next) => {
    try{

        const {
            post_id
        } = req.query;

        const {
            deletedPost
        } = await deletePostService({
            post_id
        })

        return res.status(httpStatusCodes.OK).send({deletedPost})
    }catch(error){
        return httpErrorHandler({ req, res, error })
    }
}

export {
    deletePostHandler
};