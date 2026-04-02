import { Router } from 'express';
import { subjectController } from '../controllers/subjectController.js';
import { authenticate } from '../middleware/auth.js';

export const subjectRouter = Router();

subjectRouter.use(authenticate);

subjectRouter.get('/', (req, res) => subjectController.getAll(req, res));
subjectRouter.get('/:id', (req, res) => subjectController.getById(req, res));
subjectRouter.post('/', (req, res) => subjectController.create(req, res));
subjectRouter.put('/:id', (req, res) => subjectController.update(req, res));
subjectRouter.delete('/:id', (req, res) => subjectController.delete(req, res));
