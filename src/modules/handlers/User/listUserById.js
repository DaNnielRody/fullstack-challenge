import httpStatusCodes from 'http-status-codes';
import { httpErrorHandler } from '#common/handlers/index.js';
import { getUsersByIdRepositories } from '#repositories/index.js';

const listUserByIdHandler = async (req, res, next) => {
    try{
        const { id } = req.params;
        const { users } = await getUsersByIdRepositories({ user_id: id });
        return res.status(httpStatusCodes.OK).send({ users });
    }catch(error){
        return httpErrorHandler({ req, res, error })
    }
}

export { listUserByIdHandler };