import { Router } from 'express';
import { roomController } from '../controllers/roomController.js';
import { authenticate } from '../middleware/auth.js';

export const roomRouter = Router();

roomRouter.use(authenticate);

roomRouter.get('/', (req, res) => roomController.getAll(req, res));
roomRouter.get('/:id', (req, res) => roomController.getById(req, res));
roomRouter.post('/', (req, res) => roomController.create(req, res));
roomRouter.put('/:id', (req, res) => roomController.update(req, res));
roomRouter.delete('/:id', (req, res) => roomController.delete(req, res));
