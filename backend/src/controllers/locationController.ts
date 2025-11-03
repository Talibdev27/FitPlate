import { Response } from 'express';
import prisma from '../utils/db';
import { createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

// Get all locations
export const getLocations = async (req: AuthRequest, res: Response) => {
  const {
    page = '1',
    limit = '20',
    search = '',
    city,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query;

  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const skip = (pageNum - 1) * limitNum;

  // Build where clause
  const where: any = {};

  // Search filter
  if (search) {
    const searchTerm = search as string;
    where.OR = [
      { name: { contains: searchTerm, mode: 'insensitive' } },
      { city: { contains: searchTerm, mode: 'insensitive' } },
      { address: { contains: searchTerm, mode: 'insensitive' } },
    ];
  }

  // City filter
  if (city) {
    where.city = city as string;
  }

  // Get locations with related data
  const [locations, total] = await Promise.all([
    prisma.location.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: {
        [sortBy as string]: sortOrder as 'asc' | 'desc',
      },
      include: {
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: {
            orders: true,
            staff: true,
          },
        },
      },
    }),
    prisma.location.count({ where }),
  ]);

  res.json({
    success: true,
    data: {
      locations,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    },
  });
};

// Get location by ID
export const getLocationById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const location = await prisma.location.findUnique({
    where: { id },
    include: {
      manager: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      staff: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      },
      _count: {
        select: {
          orders: true,
          staff: true,
        },
      },
    },
  });

  if (!location) {
    throw createError('Location not found', 404);
  }

  res.json({
    success: true,
    data: location,
  });
};

// Create location
export const createLocation = async (req: AuthRequest, res: Response) => {
  const {
    name,
    city,
    district,
    address,
    managerId,
    isActive = true,
  } = req.body;

  // Validation
  if (!name || !city || !address) {
    throw createError('Name, city, and address are required', 400);
  }

  // If managerId is provided, check if it exists and is a LOCATION_MANAGER
  if (managerId) {
    const manager = await prisma.staff.findUnique({
      where: { id: managerId },
    });

    if (!manager) {
      throw createError('Manager not found', 404);
    }

    if (manager.role !== 'LOCATION_MANAGER') {
      throw createError('Staff member must be a LOCATION_MANAGER', 400);
    }

    // Check if manager is already managing another location
    const existingLocation = await prisma.location.findUnique({
      where: { managerId },
    });

    if (existingLocation) {
      throw createError('This manager is already managing another location', 400);
    }
  }

  // Create location
  const location = await prisma.location.create({
    data: {
      name,
      city,
      district: district || null,
      address,
      managerId: managerId || null,
      isActive,
    },
  });

  res.json({
    success: true,
    message: 'Location created successfully',
    data: location,
  });
};

// Update location
export const updateLocation = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const {
    name,
    city,
    district,
    address,
    managerId,
    isActive,
  } = req.body;

  // Check if location exists
  const existingLocation = await prisma.location.findUnique({
    where: { id },
  });

  if (!existingLocation) {
    throw createError('Location not found', 404);
  }

  // If managerId is being changed, validate it
  if (managerId !== undefined && managerId !== existingLocation.managerId) {
    if (managerId) {
      const manager = await prisma.staff.findUnique({
        where: { id: managerId },
      });

      if (!manager) {
        throw createError('Manager not found', 404);
      }

      if (manager.role !== 'LOCATION_MANAGER') {
        throw createError('Staff member must be a LOCATION_MANAGER', 400);
      }

      // Check if manager is already managing another location
      const otherLocation = await prisma.location.findUnique({
        where: { managerId },
      });

      if (otherLocation && otherLocation.id !== id) {
        throw createError('This manager is already managing another location', 400);
      }
    }
  }

  // Build update data object
  const updateData: any = {};

  if (name !== undefined) updateData.name = name;
  if (city !== undefined) updateData.city = city;
  if (district !== undefined) updateData.district = district || null;
  if (address !== undefined) updateData.address = address;
  if (managerId !== undefined) updateData.managerId = managerId || null;
  if (isActive !== undefined) updateData.isActive = isActive;

  const updatedLocation = await prisma.location.update({
    where: { id },
    data: updateData,
    include: {
      manager: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  res.json({
    success: true,
    message: 'Location updated successfully',
    data: updatedLocation,
  });
};

// Delete location
export const deleteLocation = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  // Check if location exists
  const existingLocation = await prisma.location.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          orders: true,
          staff: true,
        },
      },
    },
  });

  if (!existingLocation) {
    throw createError('Location not found', 404);
  }

  // Check if location has orders or staff
  if (existingLocation._count.orders > 0 || existingLocation._count.staff > 0) {
    // Soft delete - set isActive to false
    await prisma.location.update({
      where: { id },
      data: { isActive: false },
    });

    res.json({
      success: true,
      message: 'Location deactivated (cannot delete location with orders or staff)',
    });
  } else {
    // Hard delete
    await prisma.location.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Location deleted successfully',
    });
  }
};
