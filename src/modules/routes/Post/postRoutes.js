import express from 'express';
import { listPostHandler, createPostHandler, updatePostHandler, deletePostHandler } from '../../handlers/index.js';

const postRoutes = express.Router();

postRoutes.get('/', (req, res, next) => listPostHandler(req, res, next));
postRoutes.post('/', (req, res, next) => createPostHandler(req, res, next));
postRoutes.put('/:id', (req, res, next) => updatePostHandler(req, res, next));
postRoutes.delete('/', (req, res, next) => deletePostHandler(req, res, next));

export default postRoutes;
