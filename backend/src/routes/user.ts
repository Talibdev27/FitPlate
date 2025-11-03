import { Router } from 'express';
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserOrders,
  getUserSubscriptions,
} from '../controllers/userController';
import { authenticateStaff, requireAnyRole } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// All routes require staff authentication and specific roles
router.use(authenticateStaff);
router.use(requireAnyRole(['SUPER_ADMIN', 'CUSTOMER_SUPPORT', 'NUTRITIONIST']));

// Get all users
router.get('/', asyncHandler(getUsers));

// Get user by ID
router.get('/:id', asyncHandler(getUserById));

// Update user
router.put('/:id', asyncHandler(updateUser));

// Delete user
router.delete('/:id', asyncHandler(deleteUser));

// Get user orders
router.get('/:id/orders', asyncHandler(getUserOrders));

// Get user subscriptions
router.get('/:id/subscriptions', asyncHandler(getUserSubscriptions));

export default router;

