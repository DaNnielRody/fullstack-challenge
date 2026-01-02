const express = require('express');
const { listUserHandler, createUserHandler, updateUserHandler, deleteUserHandler } = require('../../handlers');

const userRoutes = express.Router();

userRoutes.get('/', (req, res, next) => listUserHandler(req, res, next));
userRoutes.post('/', (req, res, next) => createUserHandler(req, res, next));
userRoutes.put('/', (req, res, next) => updateUserHandler(req, res, next));
userRoutes.delete('/', (req, res, next) => deleteUserHandler(req, res, next));

module.exports = userRoutes;
