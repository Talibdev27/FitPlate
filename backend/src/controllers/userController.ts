import { Response } from 'express';
import prisma from '../utils/db';
import { createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

// Get all users with pagination, search, and filters
export const getUsers = async (req: AuthRequest, res: Response) => {
  const {
    page = '1',
    limit = '20',
    search = '',
    verified,
    locationId,
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

  // Verified filter
  if (verified !== undefined) {
    where.isPhoneVerified = verified === 'true';
  }

  // Location filter
  if (locationId) {
    where.locationId = locationId as string;
  }

  // Get users with related data counts
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: {
        [sortBy as string]: sortOrder as 'asc' | 'desc',
      },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        isPhoneVerified: true,
        age: true,
        gender: true,
        currentWeight: true,
        height: true,
        goal: true,
        locationId: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            subscriptions: true,
            orders: true,
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  res.json({
    success: true,
    data: {
      users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    },
  });
};

// Get user by ID with full details
export const getUserById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      location: {
        select: {
          id: true,
          name: true,
          city: true,
        },
      },
      subscriptions: {
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          planType: true,
          status: true,
          startDate: true,
          endDate: true,
          price: true,
          paymentStatus: true,
        },
      },
      orders: {
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          status: true,
          deliveryDate: true,
          totalPrice: true,
          createdAt: true,
        },
      },
      _count: {
        select: {
          subscriptions: true,
          orders: true,
        },
      },
    },
  });

  if (!user) {
    throw createError('User not found', 404);
  }

  // Remove password hash from response
  const { passwordHash, ...userWithoutPassword } = user;

  res.json({
    success: true,
    data: userWithoutPassword,
  });
};

// Update user
export const updateUser = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const {
    firstName,
    lastName,
    email,
    phone,
    age,
    gender,
    currentWeight,
    height,
    targetWeight,
    goal,
    activityLevel,
    dietaryRestrictions,
    allergies,
    foodDislikes,
    preferredCuisines,
    mealPreferences,
    nutritionGoals,
    locationId,
    isPhoneVerified,
  } = req.body;

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!existingUser) {
    throw createError('User not found', 404);
  }

  // If email is being changed, check if new email is already taken
  if (email && email !== existingUser.email) {
    const emailExists = await prisma.user.findUnique({
      where: { email },
    });
    if (emailExists) {
      throw createError('Email already in use', 409);
    }
  }

  // If phone is being changed, check if new phone is already taken
  if (phone && phone !== existingUser.phone) {
    const phoneExists = await prisma.user.findUnique({
      where: { phone },
    });
    if (phoneExists) {
      throw createError('Phone number already in use', 409);
    }
  }

  // Build update data object
  const updateData: any = {};

  if (firstName !== undefined) updateData.firstName = firstName || null;
  if (lastName !== undefined) updateData.lastName = lastName || null;
  if (email !== undefined) updateData.email = email;
  if (phone !== undefined) updateData.phone = phone || null;
  if (age !== undefined) updateData.age = age || null;
  if (gender !== undefined) updateData.gender = gender || null;
  if (currentWeight !== undefined) updateData.currentWeight = currentWeight || null;
  if (height !== undefined) updateData.height = height || null;
  if (targetWeight !== undefined) updateData.targetWeight = targetWeight || null;
  if (goal !== undefined) updateData.goal = goal || null;
  if (activityLevel !== undefined) updateData.activityLevel = activityLevel || null;
  if (dietaryRestrictions !== undefined) updateData.dietaryRestrictions = dietaryRestrictions || null;
  if (allergies !== undefined) updateData.allergies = allergies || null;
  if (foodDislikes !== undefined) updateData.foodDislikes = foodDislikes || null;
  if (preferredCuisines !== undefined) updateData.preferredCuisines = preferredCuisines || null;
  if (mealPreferences !== undefined) updateData.mealPreferences = mealPreferences || null;
  if (nutritionGoals !== undefined) updateData.nutritionGoals = nutritionGoals || null;
  if (locationId !== undefined) updateData.locationId = locationId || null;
  if (isPhoneVerified !== undefined) updateData.isPhoneVerified = isPhoneVerified;

  const updatedUser = await prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      email: true,
      phone: true,
      firstName: true,
      lastName: true,
      age: true,
      gender: true,
      currentWeight: true,
      height: true,
      targetWeight: true,
      goal: true,
      activityLevel: true,
      dietaryRestrictions: true,
      allergies: true,
      foodDislikes: true,
      preferredCuisines: true,
      mealPreferences: true,
      nutritionGoals: true,
      locationId: true,
      isPhoneVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  res.json({
    success: true,
    message: 'User updated successfully',
    data: updatedUser,
  });
};

// Delete user (soft delete - we'll mark as inactive or actually delete)
export const deleteUser = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw createError('User not found', 404);
  }

  // Check if user has active subscriptions
  const activeSubscriptions = await prisma.subscription.findFirst({
    where: {
      userId: id,
      status: 'ACTIVE',
    },
  });

  if (activeSubscriptions) {
    throw createError('Cannot delete user with active subscriptions', 400);
  }

  // Delete user (cascade will handle related records)
  await prisma.user.delete({
    where: { id },
  });

  res.json({
    success: true,
    message: 'User deleted successfully',
  });
};

// Get user orders
export const getUserOrders = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { page = '1', limit = '20' } = req.query;

  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const skip = (pageNum - 1) * limitNum;

  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw createError('User not found', 404);
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: { userId: id },
      skip,
      take: limitNum,
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            meal: {
              select: {
                id: true,
                name: true,
                imageUrls: true,
              },
            },
          },
        },
        location: {
          select: {
            id: true,
            name: true,
            city: true,
          },
        },
      },
    }),
    prisma.order.count({ where: { userId: id } }),
  ]);

  res.json({
    success: true,
    data: {
      orders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    },
  });
};

// Get user subscriptions
export const getUserSubscriptions = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw createError('User not found', 404);
  }

  const subscriptions = await prisma.subscription.findMany({
    where: { userId: id },
    orderBy: { createdAt: 'desc' },
    include: {
      payments: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  });

  res.json({
    success: true,
    data: subscriptions,
  });
};

