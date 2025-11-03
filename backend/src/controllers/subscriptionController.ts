import { Response } from 'express';
import prisma from '../utils/db';
import { createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

// Get current user's active subscription
export const getCurrentSubscription = async (req: AuthRequest, res: Response) => {
  if (!req.userId) {
    throw createError('User authentication required', 401);
  }

  const subscription = await prisma.subscription.findFirst({
    where: {
      userId: req.userId,
      status: 'ACTIVE',
    },
    orderBy: { createdAt: 'desc' },
    include: {
      orders: {
        take: 5,
        orderBy: { deliveryDate: 'asc' },
        where: {
          deliveryDate: {
            gte: new Date(),
          },
        },
        select: {
          id: true,
          deliveryDate: true,
          status: true,
          totalPrice: true,
        },
      },
    },
  });

  res.json({
    success: true,
    data: subscription,
  });
};

// Get current user's subscriptions (all)
export const getCurrentUserSubscriptions = async (req: AuthRequest, res: Response) => {
  if (!req.userId) {
    throw createError('User authentication required', 401);
  }

  const subscriptions = await prisma.subscription.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: 'desc' },
    include: {
      orders: {
        take: 5,
        orderBy: { createdAt: 'desc' },
      },
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

// Pause subscription
export const pauseSubscription = async (req: AuthRequest, res: Response) => {
  if (!req.userId) {
    throw createError('User authentication required', 401);
  }

  const subscription = await prisma.subscription.findFirst({
    where: {
      userId: req.userId,
      status: 'ACTIVE',
    },
  });

  if (!subscription) {
    throw createError('No active subscription found', 404);
  }

  const updated = await prisma.subscription.update({
    where: { id: subscription.id },
    data: { status: 'PAUSED' },
  });

  res.json({
    success: true,
    message: 'Subscription paused successfully',
    data: updated,
  });
};

// Resume subscription
export const resumeSubscription = async (req: AuthRequest, res: Response) => {
  if (!req.userId) {
    throw createError('User authentication required', 401);
  }

  const subscription = await prisma.subscription.findFirst({
    where: {
      userId: req.userId,
      status: 'PAUSED',
    },
  });

  if (!subscription) {
    throw createError('No paused subscription found', 404);
  }

  const updated = await prisma.subscription.update({
    where: { id: subscription.id },
    data: { status: 'ACTIVE' },
  });

  res.json({
    success: true,
    message: 'Subscription resumed successfully',
    data: updated,
  });
};

// Cancel subscription
export const cancelSubscription = async (req: AuthRequest, res: Response) => {
  if (!req.userId) {
    throw createError('User authentication required', 401);
  }

  const subscription = await prisma.subscription.findFirst({
    where: {
      userId: req.userId,
      status: { in: ['ACTIVE', 'PAUSED'] },
    },
  });

  if (!subscription) {
    throw createError('No active or paused subscription found', 404);
  }

  const updated = await prisma.subscription.update({
    where: { id: subscription.id },
    data: { status: 'CANCELLED' },
  });

  res.json({
    success: true,
    message: 'Subscription cancelled successfully',
    data: updated,
  });
};
