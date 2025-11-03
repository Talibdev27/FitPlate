import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use(rateLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.get('/api', (req, res) => {
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

