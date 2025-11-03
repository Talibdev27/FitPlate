import { Router } from 'express';
import { getDashboardStats, getRecentOrders } from '../controllers/dashboardController';
import { authenticateStaff } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// All routes require staff authentication
router.use(authenticateStaff);

// Get dashboard statistics
router.get('/stats', asyncHandler(getDashboardStats));

// Get recent orders
router.get('/recent-orders', asyncHandler(getRecentOrders));

export default router;
