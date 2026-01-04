import express from 'express';
import {
  listPostHandler,
  listPostByIdHandler,
  createPostHandler,
  updatePostHandler,
  deletePostHandler,
  patchPostHandler,
} from '#handlers/index.js';

const postRoutes = express.Router();

postRoutes.get('/', (req, res, next) => {
  if (req.query.user_id) {
    return listPostByIdHandler(req, res, next);
  }
  return listPostHandler(req, res, next);
});
postRoutes.post('/', (req, res, next) => createPostHandler(req, res, next));
postRoutes.put('/:id', (req, res, next) => updatePostHandler(req, res, next));
postRoutes.patch('/:id', (req, res, next) => patchPostHandler(req, res, next));
postRoutes.delete('/:id', (req, res, next) =>
  deletePostHandler(req, res, next)
);

export default postRoutes;
