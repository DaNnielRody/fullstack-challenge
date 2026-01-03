import express from 'express';
import { listUserHandler, createUserHandler, updateUserHandler, deleteUserHandler } from '#handlers/index.js';

const userRoutes = express.Router();

userRoutes.get('/', (req, res, next) => listUserHandler(req, res, next));
userRoutes.post('/', (req, res, next) => createUserHandler(req, res, next));
userRoutes.put('/:id', (req, res, next) => updateUserHandler(req, res, next));
userRoutes.delete('/', (req, res, next) => deleteUserHandler(req, res, next));

export default userRoutes;
