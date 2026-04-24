import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import sequelize from './config/database';
import authRoutes from './features/auth/authRoutes';
import usersRoutes from './features/users/usersRoutes';
import classesRoutes from './features/classes/classesRoutes';
import { globalLimiter } from './middlewares/rateLimitMiddleware';

const app = express();

app.set('trust proxy', 1);

app.use(cors({
  origin: process.env.CORS_ORIGIN ?? '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(globalLimiter);

app.use('/auth',    authRoutes);
app.use('/users',   usersRoutes);
app.use('/classes', classesRoutes);

const PORT = Number(process.env.PORT) || 3000;

sequelize
  .authenticate()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err: Error) => {
    console.error('Unable to connect to the database:', err);
  });