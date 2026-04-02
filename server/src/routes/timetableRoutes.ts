import { Router } from 'express';
import { timetableController } from '../controllers/timetableController.js';
import { authenticate } from '../middleware/auth.js';

export const timetableRouter = Router();

timetableRouter.use(authenticate);

timetableRouter.get('/', (req, res) => timetableController.getAll(req, res));
timetableRouter.post('/generate', (req, res) => timetableController.generate(req, res));
timetableRouter.get('/latest', (req, res) => timetableController.getLatest(req, res));
timetableRouter.get('/entries', (req, res) => timetableController.getEntriesByFilter(req, res));
timetableRouter.get('/:id', (req, res) => timetableController.getById(req, res));
timetableRouter.delete('/:id', (req, res) => timetableController.delete(req, res));
