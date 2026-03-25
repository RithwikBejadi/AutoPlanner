import { Router } from 'express';
import { classGroupController } from '../controllers/classGroupController.js';

export const classGroupRouter = Router();

classGroupRouter.get('/', (req, res) => classGroupController.getAll(req, res));
classGroupRouter.get('/:id', (req, res) => classGroupController.getById(req, res));
classGroupRouter.post('/', (req, res) => classGroupController.create(req, res));
classGroupRouter.put('/:id', (req, res) => classGroupController.update(req, res));
classGroupRouter.delete('/:id', (req, res) => classGroupController.delete(req, res));
