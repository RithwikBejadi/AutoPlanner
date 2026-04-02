import { Router } from 'express';
import { timeSlotController } from '../controllers/timeSlotController.js';
import { authenticate } from '../middleware/auth.js';

export const timeSlotRouter = Router();

timeSlotRouter.use(authenticate);

timeSlotRouter.get('/', (req, res) => timeSlotController.getAll(req, res));
timeSlotRouter.get('/day/:day', (req, res) => timeSlotController.getByDay(req, res));
timeSlotRouter.get('/:id', (req, res) => timeSlotController.getById(req, res));
timeSlotRouter.post('/', (req, res) => timeSlotController.create(req, res));
timeSlotRouter.put('/:id', (req, res) => timeSlotController.update(req, res));
timeSlotRouter.delete('/:id', (req, res) => timeSlotController.delete(req, res));
