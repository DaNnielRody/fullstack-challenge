const express = require('express');
const { listPostHandler, createPostHandler, updatePostHandler, deletePostHandler } = require('../../handlers');

const postRoutes = express.Router();

postRoutes.get('/', (req, res, next) => listPostHandler(req, res, next));
postRoutes.post('/', (req, res, next) => createPostHandler(req, res, next));
postRoutes.put('/', (req, res, next) => updatePostHandler(req, res, next));
postRoutes.delete('/', (req, res, next) => deletePostHandler(req, res, next));

module.exports = postRoutes;
