import { Router } from 'express';
import {
  getMeals,
  getMealById,
  createMeal,
  updateMeal,
  deleteMeal,
} from '../controllers/mealController';
import { authenticateStaff, requireAnyRole } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// Get meals - can be accessed by all staff, but for admin panel we'll require authentication
router.get('/', authenticateStaff, asyncHandler(getMeals));

// Get meal by ID
router.get('/:id', authenticateStaff, asyncHandler(getMealById));

// Create meal - only SUPER_ADMIN, LOCATION_MANAGER, CHEF, NUTRITIONIST
router.post('/', authenticateStaff, requireAnyRole(['SUPER_ADMIN', 'LOCATION_MANAGER', 'CHEF', 'NUTRITIONIST']), asyncHandler(createMeal));

// Update meal - only SUPER_ADMIN, LOCATION_MANAGER, CHEF, NUTRITIONIST
router.put('/:id', authenticateStaff, requireAnyRole(['SUPER_ADMIN', 'LOCATION_MANAGER', 'CHEF', 'NUTRITIONIST']), asyncHandler(updateMeal));

// Delete meal - only SUPER_ADMIN, LOCATION_MANAGER
router.delete('/:id', authenticateStaff, requireAnyRole(['SUPER_ADMIN', 'LOCATION_MANAGER']), asyncHandler(deleteMeal));

export default router;
