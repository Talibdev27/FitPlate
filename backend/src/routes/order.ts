import { Router } from 'express';
import {
  getOrders,
  getOrderById,
  updateOrderStatus,
  assignDriver,
} from '../controllers/orderController';
import { authenticateStaff, requireAnyRole } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// All routes require staff authentication
router.use(authenticateStaff);

// Get all orders - accessible by all staff roles
router.get('/', asyncHandler(getOrders));

// Get order by ID
router.get('/:id', asyncHandler(getOrderById));

// Update order status - accessible by all staff roles
router.put('/:id/status', asyncHandler(updateOrderStatus));

// Assign driver - only LOCATION_MANAGER and SUPER_ADMIN
router.put('/:id/assign-driver', requireAnyRole(['SUPER_ADMIN', 'LOCATION_MANAGER']), asyncHandler(assignDriver));

export default router;
