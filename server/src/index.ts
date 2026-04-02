import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { authRouter } from './routes/authRoutes.js';
import { subjectRouter } from './routes/subjectRoutes.js';
import { roomRouter } from './routes/roomRoutes.js';
import { timeSlotRouter } from './routes/timeSlotRoutes.js';
import { classGroupRouter } from './routes/classGroupRoutes.js';
import { teacherRouter } from './routes/teacherRoutes.js';
import { timetableRouter } from './routes/timetableRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.use('/api/auth', authRouter);
app.use('/api/subjects', subjectRouter);
app.use('/api/rooms', roomRouter);
app.use('/api/timeslots', timeSlotRouter);
app.use('/api/class-groups', classGroupRouter);
app.use('/api/teachers', teacherRouter);
app.use('/api/timetables', timetableRouter);

app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    timestamp: new Date().toISOString()
  });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: isDevelopment ? err.message : 'Something went wrong',
    ...(isDevelopment && { stack: err.stack })
  });
});


app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║         AutoPlanner API Server                        ║
╠═══════════════════════════════════════════════════════╣
║  Status: Running                                      ║
║  Port: ${PORT}                                        ║
║  Environment: ${process.env.NODE_ENV || 'development'}║
║  Time: ${new Date().toLocaleString()}                 ║
╚═══════════════════════════════════════════════════════╝
  `);
});

export default app;
