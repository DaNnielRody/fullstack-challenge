import express from 'express';
import {
  listUserHandler,
  createUserHandler,
  updateUserHandler,
  patchUserHandler,
  deleteUserHandler,
  listUserByIdHandler,
} from '#handlers/index.js';

const userRoutes = express.Router();

userRoutes.get('/', (req, res, next) => listUserHandler(req, res, next));
userRoutes.get('/:id', (req, res, next) => listUserByIdHandler(req, res, next));
userRoutes.post('/', (req, res, next) => createUserHandler(req, res, next));
userRoutes.put('/:id', (req, res, next) => updateUserHandler(req, res, next));
userRoutes.patch('/:id', (req, res, next) => patchUserHandler(req, res, next));
userRoutes.delete('/:id', (req, res, next) =>
  deleteUserHandler(req, res, next)
);

export default userRoutes;
