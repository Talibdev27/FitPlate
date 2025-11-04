import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware - configure helmet to work with CORS
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration - sanitize and validate FRONTEND_URL
const getFrontendOrigin = () => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  // Remove any trailing slashes and leading equals signs
  const sanitized = frontendUrl.replace(/^=+/, '').replace(/\/+$/, '');
  return sanitized;
};

app.use(cors({
  origin: getFrontendOrigin(),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use(rateLimiter);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.get('/api', (req: Request, res: Response) => {
  res.json({ message: 'Food Delivery API v1.0' });
});

// Import and use route handlers
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import profileRoutes from './routes/profile';
import subscriptionRoutes from './routes/subscription';
import dashboardRoutes from './routes/dashboard';
import staffRoutes from './routes/staff';
import mealRoutes from './routes/meal';
import orderRoutes from './routes/order';
import locationRoutes from './routes/location';
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/admin/dashboard', dashboardRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/locations', locationRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

