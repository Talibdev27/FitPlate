import { Response } from 'express';
import prisma from '../utils/db';
import { createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

// Get current user profile
export const getCurrentProfile = async (req: AuthRequest, res: Response) => {
  if (!req.userId) {
    throw createError('User authentication required', 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    include: {
      location: {
        select: {
          id: true,
          name: true,
          city: true,
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

// Update current user profile
export const updateCurrentProfile = async (req: AuthRequest, res: Response) => {
  if (!req.userId) {
    throw createError('User authentication required', 401);
  }

  const {
    firstName,
    lastName,
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
  } = req.body;

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { id: req.userId },
  });

  if (!existingUser) {
    throw createError('User not found', 404);
  }

  // Build update data object
  const updateData: any = {};

  if (firstName !== undefined) updateData.firstName = firstName || null;
  if (lastName !== undefined) updateData.lastName = lastName || null;
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

  const updatedUser = await prisma.user.update({
    where: { id: req.userId },
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
    message: 'Profile updated successfully',
    data: updatedUser,
  });
};
