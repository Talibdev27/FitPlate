import { Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../utils/db';
import { createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { StaffRole } from '../utils/jwt';

// Get all staff with pagination, search, and filters
export const getStaff = async (req: AuthRequest, res: Response) => {
  const {
    page = '1',
    limit = '20',
    search = '',
    role,
    locationId,
    isActive,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query;

  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const skip = (pageNum - 1) * limitNum;

  // Build where clause
  const where: any = {};

  // Search filter (email, name, phone)
  if (search) {
    const searchTerm = search as string;
    where.OR = [
      { email: { contains: searchTerm, mode: 'insensitive' } },
      { firstName: { contains: searchTerm, mode: 'insensitive' } },
      { lastName: { contains: searchTerm, mode: 'insensitive' } },
      { phone: { contains: searchTerm, mode: 'insensitive' } },
    ];
  }

  // Role filter
  if (role) {
    where.role = role as StaffRole;
  }

  // Location filter
  if (locationId) {
    where.locationId = locationId as string;
  }

  // Active filter
  if (isActive !== undefined) {
    where.isActive = isActive === 'true';
  }

  // Get staff with related data
  const [staff, total] = await Promise.all([
    prisma.staff.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: {
        [sortBy as string]: sortOrder as 'asc' | 'desc',
      },
      include: {
        location: {
          select: {
            id: true,
            name: true,
            city: true,
          },
        },
        _count: {
          select: {
            deliveries: true,
          },
        },
      },
    }),
    prisma.staff.count({ where }),
  ]);

  res.json({
    success: true,
    data: {
      staff,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    },
  });
};

// Get staff by ID
export const getStaffById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const staffMember = await prisma.staff.findUnique({
    where: { id },
    include: {
      location: {
        select: {
          id: true,
          name: true,
          city: true,
        },
      },
      managedLocation: {
        select: {
          id: true,
          name: true,
          city: true,
        },
      },
      deliveries: {
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          status: true,
          deliveryDate: true,
          totalPrice: true,
        },
      },
      _count: {
        select: {
          deliveries: true,
        },
      },
    },
  });

  if (!staffMember) {
    throw createError('Staff member not found', 404);
  }

  // Remove password hash from response
  const { passwordHash, ...staffWithoutPassword } = staffMember;

  res.json({
    success: true,
    data: staffWithoutPassword,
  });
};

// Create staff member
export const createStaff = async (req: AuthRequest, res: Response) => {
  const {
    email,
    password,
    phone,
    firstName,
    lastName,
    role,
    locationId,
    isActive = true,
  } = req.body;

  // Validation
  if (!email || !password || !firstName || !lastName || !role) {
    throw createError('Email, password, first name, last name, and role are required', 400);
  }

  // Check if staff exists by email
  const existingStaff = await prisma.staff.findUnique({
    where: { email },
  });

  if (existingStaff) {
    throw createError('Staff member with this email already exists', 409);
  }

  // Check if phone is provided and unique
  if (phone) {
    const existingPhoneStaff = await prisma.staff.findUnique({
      where: { phone },
    });
    if (existingPhoneStaff) {
      throw createError('Staff member with this phone number already exists', 409);
    }
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // Create staff member
  const staff = await prisma.staff.create({
    data: {
      email,
      passwordHash,
      phone: phone || null,
      firstName,
      lastName,
      role: role as StaffRole,
      locationId: locationId || null,
      isActive,
    },
    select: {
      id: true,
      email: true,
      phone: true,
      firstName: true,
      lastName: true,
      role: true,
      locationId: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  res.json({
    success: true,
    message: 'Staff member created successfully',
    data: staff,
  });
};

// Update staff member
export const updateStaff = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const {
    email,
    password,
    phone,
    firstName,
    lastName,
    role,
    locationId,
    isActive,
  } = req.body;

  // Check if staff exists
  const existingStaff = await prisma.staff.findUnique({
    where: { id },
  });

  if (!existingStaff) {
    throw createError('Staff member not found', 404);
  }

  // If email is being changed, check if new email is already taken
  if (email && email !== existingStaff.email) {
    const emailExists = await prisma.staff.findUnique({
      where: { email },
    });
    if (emailExists) {
      throw createError('Email already in use', 409);
    }
  }

  // If phone is being changed, check if new phone is already taken
  if (phone && phone !== existingStaff.phone) {
    const phoneExists = await prisma.staff.findUnique({
      where: { phone },
    });
    if (phoneExists) {
      throw createError('Phone number already in use', 409);
    }
  }

  // Build update data object
  const updateData: any = {};

  if (email !== undefined) updateData.email = email;
  if (phone !== undefined) updateData.phone = phone || null;
  if (firstName !== undefined) updateData.firstName = firstName;
  if (lastName !== undefined) updateData.lastName = lastName;
  if (role !== undefined) updateData.role = role as StaffRole;
  if (locationId !== undefined) updateData.locationId = locationId || null;
  if (isActive !== undefined) updateData.isActive = isActive;

  // Hash password if provided
  if (password) {
    updateData.passwordHash = await bcrypt.hash(password, 10);
  }

  const updatedStaff = await prisma.staff.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      email: true,
      phone: true,
      firstName: true,
      lastName: true,
      role: true,
      locationId: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  res.json({
    success: true,
    message: 'Staff member updated successfully',
    data: updatedStaff,
  });
};

// Delete staff member (soft delete - set isActive to false)
export const deleteStaff = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  // Check if staff exists
  const existingStaff = await prisma.staff.findUnique({
    where: { id },
  });

  if (!existingStaff) {
    throw createError('Staff member not found', 404);
  }

  // Prevent deleting yourself
  if (req.staffId === id) {
    throw createError('You cannot delete your own account', 400);
  }

  // Soft delete - set isActive to false
  await prisma.staff.update({
    where: { id },
    data: { isActive: false },
  });

  res.json({
    success: true,
    message: 'Staff member deactivated successfully',
  });
};
