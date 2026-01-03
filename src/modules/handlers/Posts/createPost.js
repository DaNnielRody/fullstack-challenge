import httpStatusCodes from 'http-status-codes';
import { httpErrorHandler } from "#common/handlers/index.js";
import { createPostService } from '#services/index.js';

const createPostHandler = async(req, res, next) => {
    try{
        const {
            post_text,
            author_id
        } = req.body

        const created_post = await createPostService({
            post_text,
            author_id
        })

        return res.status(httpStatusCodes.OK).send(created_post);
    }catch(error){
        return httpErrorHandler({ req, res, error })
    }
}

export {
    createPostHandler
};