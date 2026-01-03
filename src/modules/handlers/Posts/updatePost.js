import httpStatusCodes from 'http-status-codes';
import { httpErrorHandler } from "#common/handlers/index.js";
import { updatePostService } from '#services/index.js';

const updatePostHandler = async (req, res, next) => {
    try{
        const { id } = req.params;
        const {
            author_id,
            post_text
        } = req.body

        const updated_post = await updatePostService({
            id,
            author_id,
            post_text
        })

        return res.status(httpStatusCodes.OK).send(updated_post);
    }catch(error){
        return httpErrorHandler({ req, res, error })
    }
}

export {
    updatePostHandler
};