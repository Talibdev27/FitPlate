import { Router } from 'express';
import {
  getLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation,
} from '../controllers/locationController';
import { authenticateStaff, requireAnyRole } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// All routes require staff authentication
router.use(authenticateStaff);

// Get all locations - accessible by all staff
router.get('/', asyncHandler(getLocations));

// Get location by ID
router.get('/:id', asyncHandler(getLocationById));

// Create location - only SUPER_ADMIN
router.post('/', requireAnyRole(['SUPER_ADMIN']), asyncHandler(createLocation));

// Update location - only SUPER_ADMIN and LOCATION_MANAGER
router.put('/:id', requireAnyRole(['SUPER_ADMIN', 'LOCATION_MANAGER']), asyncHandler(updateLocation));

// Delete location - only SUPER_ADMIN
router.delete('/:id', requireAnyRole(['SUPER_ADMIN']), asyncHandler(deleteLocation));

export default router;
