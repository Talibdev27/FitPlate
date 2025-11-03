import { Router } from 'express';
import {
  getStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
} from '../controllers/staffController';
import { authenticateStaff, requireAnyRole } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// All routes require staff authentication
router.use(authenticateStaff);

// Get all staff - only SUPER_ADMIN and LOCATION_MANAGER can view all staff
router.get('/', requireAnyRole(['SUPER_ADMIN', 'LOCATION_MANAGER']), asyncHandler(getStaff));

// Get staff by ID
router.get('/:id', requireAnyRole(['SUPER_ADMIN', 'LOCATION_MANAGER']), asyncHandler(getStaffById));

// Create staff - only SUPER_ADMIN
router.post('/', requireAnyRole(['SUPER_ADMIN']), asyncHandler(createStaff));

// Update staff - only SUPER_ADMIN and LOCATION_MANAGER
router.put('/:id', requireAnyRole(['SUPER_ADMIN', 'LOCATION_MANAGER']), asyncHandler(updateStaff));

// Delete staff - only SUPER_ADMIN
router.delete('/:id', requireAnyRole(['SUPER_ADMIN']), asyncHandler(deleteStaff));

export default router;
