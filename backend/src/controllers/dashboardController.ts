import { Response } from 'express';
import prisma from '../utils/db';
import { createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

// Get dashboard statistics
export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  if (!req.staffId) {
    throw createError('Staff authentication required', 401);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    todayOrders,
    activeSubscriptions,
    totalRevenue,
    pendingDeliveries,
  ] = await Promise.all([
    // Today's orders count
    prisma.order.count({
      where: {
        createdAt: {
          gte: today,
        },
      },
    }),

    // Active subscriptions count
    prisma.subscription.count({
      where: {
        status: 'ACTIVE',
      },
    }),

    // Total revenue (from completed payments)
    prisma.payment.aggregate({
      where: {
        status: 'COMPLETED',
        createdAt: {
          gte: today,
        },
      },
      _sum: {
        amount: true,
      },
    }),

    // Pending deliveries (orders with status PENDING or PREPARING)
    prisma.order.count({
      where: {
        status: {
          in: ['PENDING', 'PREPARING'],
        },
        deliveryDate: {
          gte: today,
        },
      },
    }),
  ]);

  res.json({
    success: true,
    data: {
      todayOrders,
      activeSubscriptions,
      totalRevenue: totalRevenue._sum.amount || 0,
      pendingDeliveries,
    },
  });
};

// Get recent orders
export const getRecentOrders = async (req: AuthRequest, res: Response) => {
  if (!req.staffId) {
    throw createError('Staff authentication required', 401);
  }

  const { limit = '10' } = req.query;
  const limitNum = parseInt(limit as string, 10);

  const orders = await prisma.order.findMany({
    take: limitNum,
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
      location: {
        select: {
          id: true,
          name: true,
          city: true,
        },
      },
      items: {
        take: 3,
        include: {
          meal: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  res.json({
    success: true,
    data: orders,
  });
};
