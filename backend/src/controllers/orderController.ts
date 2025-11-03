import { Response } from 'express';
import prisma from '../utils/db';
import { createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

// Get all orders with pagination, search, and filters
export const getOrders = async (req: AuthRequest, res: Response) => {
  const {
    page = '1',
    limit = '20',
    search = '',
    status,
    locationId,
    dateFrom,
    dateTo,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query;

  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const skip = (pageNum - 1) * limitNum;

  // Build where clause
  const where: any = {};

  // Search filter (user email, order ID)
  if (search) {
    const searchTerm = search as string;
    where.OR = [
      { id: { contains: searchTerm, mode: 'insensitive' } },
      { user: { email: { contains: searchTerm, mode: 'insensitive' } } },
      { deliveryAddress: { contains: searchTerm, mode: 'insensitive' } },
    ];
  }

  // Status filter
  if (status) {
    where.status = status as string;
  }

  // Location filter
  if (locationId) {
    where.locationId = locationId as string;
  }

  // Date range filter
  if (dateFrom || dateTo) {
    where.deliveryDate = {};
    if (dateFrom) {
      where.deliveryDate.gte = new Date(dateFrom as string);
    }
    if (dateTo) {
      const endDate = new Date(dateTo as string);
      endDate.setHours(23, 59, 59, 999);
      where.deliveryDate.lte = endDate;
    }
  }

  // Get orders with related data
  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: {
        [sortBy as string]: sortOrder as 'asc' | 'desc',
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        location: {
          select: {
            id: true,
            name: true,
            city: true,
          },
        },
        driver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
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
      },
    }),
    prisma.order.count({ where }),
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

// Get order by ID
export const getOrderById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
        },
      },
      location: {
        select: {
          id: true,
          name: true,
          city: true,
          address: true,
        },
      },
      driver: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      },
      items: {
        include: {
          meal: {
            select: {
              id: true,
              name: true,
              description: true,
              imageUrls: true,
              price: true,
            },
          },
        },
      },
      subscription: {
        select: {
          id: true,
          planType: true,
        },
      },
    },
  });

  if (!order) {
    throw createError('Order not found', 404);
  }

  res.json({
    success: true,
    data: order,
  });
};

// Update order status
export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    throw createError('Status is required', 400);
  }

  const validStatuses = ['PENDING', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
  if (!validStatuses.includes(status)) {
    throw createError('Invalid status', 400);
  }

  const order = await prisma.order.findUnique({
    where: { id },
  });

  if (!order) {
    throw createError('Order not found', 404);
  }

  const updatedOrder = await prisma.order.update({
    where: { id },
    data: { status },
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
    message: 'Order status updated successfully',
    data: updatedOrder,
  });
};

// Assign order to driver
export const assignDriver = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { driverId } = req.body;

  if (!driverId) {
    throw createError('Driver ID is required', 400);
  }

  // Check if driver exists and is a DELIVERY_DRIVER
  const driver = await prisma.staff.findUnique({
    where: { id: driverId },
  });

  if (!driver) {
    throw createError('Driver not found', 404);
  }

  if (driver.role !== 'DELIVERY_DRIVER') {
    throw createError('Staff member is not a delivery driver', 400);
  }

  const order = await prisma.order.findUnique({
    where: { id },
  });

  if (!order) {
    throw createError('Order not found', 404);
  }

  const updatedOrder = await prisma.order.update({
    where: { id },
    data: { driverId },
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
      driver: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      items: {
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
    message: 'Driver assigned successfully',
    data: updatedOrder,
  });
};
