import httpStatusCodes from 'http-status-codes';
import { httpErrorHandler } from '#common/handlers/index.js';
import { 
    getPostByUserIdService 
} from '#services/index.js';

const listPostHandler = async (req, res, next) => {
    try{
        const {
            user_id
        } = req.query;
        
        const {
            posts
        } = await getPostByUserIdService({
            user_id
        })

        return res.status(httpStatusCodes.OK).send({posts});
    }catch(error){
        return httpErrorHandler({ req, res, error })
    }
}

export {
    listPostHandler
};