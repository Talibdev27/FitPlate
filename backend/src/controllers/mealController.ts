import { Response } from 'express';
import prisma from '../utils/db';
import { createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

// Get all meals with pagination, search, and filters
export const getMeals = async (req: AuthRequest, res: Response) => {
  const {
    page = '1',
    limit = '20',
    search = '',
    category,
    cuisine,
    isActive,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query;

  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const skip = (pageNum - 1) * limitNum;

  // Build where clause
  const where: any = {};

  // Search filter (name, description)
  if (search) {
    const searchTerm = search as string;
    // Note: Since name and description are JSON, we'll search in a simpler way
    // For production, you might want to use full-text search or a different approach
    where.OR = [
      { category: { contains: searchTerm, mode: 'insensitive' } },
      { cuisine: { contains: searchTerm, mode: 'insensitive' } },
    ];
  }

  // Category filter
  if (category) {
    where.category = category as string;
  }

  // Cuisine filter
  if (cuisine) {
    where.cuisine = cuisine as string;
  }

  // Active filter
  if (isActive !== undefined) {
    where.isActive = isActive === 'true';
  }

  // Get meals
  const [meals, total] = await Promise.all([
    prisma.meal.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: {
        [sortBy as string]: sortOrder as 'asc' | 'desc',
      },
      include: {
        _count: {
          select: {
            orderItems: true,
          },
        },
      },
    }),
    prisma.meal.count({ where }),
  ]);

  res.json({
    success: true,
    data: {
      meals,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    },
  });
};

// Get meal by ID
export const getMealById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const meal = await prisma.meal.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          orderItems: true,
        },
      },
    },
  });

  if (!meal) {
    throw createError('Meal not found', 404);
  }

  res.json({
    success: true,
    data: meal,
  });
};

// Create meal
export const createMeal = async (req: AuthRequest, res: Response) => {
  const {
    name,
    description,
    calories,
    protein,
    carbs,
    fats,
    fiber,
    ingredients,
    recipe,
    prepTime,
    cookTime,
    price,
    cost,
    category,
    dietaryTags,
    cuisine,
    imageUrls,
    isActive = true,
  } = req.body;

  // Validation
  if (!name || !description || !calories || !protein || !carbs || !fats || !price) {
    throw createError('Name, description, nutrition info, and price are required', 400);
  }

  // Validate name and description are JSON objects with uz, ru, en
  if (typeof name !== 'object' || !name.uz || !name.ru || !name.en) {
    throw createError('Name must be an object with uz, ru, and en properties', 400);
  }

  if (typeof description !== 'object' || !description.uz || !description.ru || !description.en) {
    throw createError('Description must be an object with uz, ru, and en properties', 400);
  }

  // Create meal
  const meal = await prisma.meal.create({
    data: {
      name,
      description,
      calories: parseInt(calories),
      protein: parseFloat(protein),
      carbs: parseFloat(carbs),
      fats: parseFloat(fats),
      fiber: fiber ? parseFloat(fiber) : null,
      ingredients: ingredients || [],
      recipe: recipe || null,
      prepTime: prepTime ? parseInt(prepTime) : null,
      cookTime: cookTime ? parseInt(cookTime) : null,
      price: parseFloat(price),
      cost: cost ? parseFloat(cost) : null,
      category: category || null,
      dietaryTags: dietaryTags || [],
      cuisine: cuisine || null,
      imageUrls: imageUrls || [],
      isActive,
    },
  });

  res.json({
    success: true,
    message: 'Meal created successfully',
    data: meal,
  });
};

// Update meal
export const updateMeal = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const {
    name,
    description,
    calories,
    protein,
    carbs,
    fats,
    fiber,
    ingredients,
    recipe,
    prepTime,
    cookTime,
    price,
    cost,
    category,
    dietaryTags,
    cuisine,
    imageUrls,
    isActive,
  } = req.body;

  // Check if meal exists
  const existingMeal = await prisma.meal.findUnique({
    where: { id },
  });

  if (!existingMeal) {
    throw createError('Meal not found', 404);
  }

  // Build update data object
  const updateData: any = {};

  if (name !== undefined) updateData.name = name;
  if (description !== undefined) updateData.description = description;
  if (calories !== undefined) updateData.calories = parseInt(calories);
  if (protein !== undefined) updateData.protein = parseFloat(protein);
  if (carbs !== undefined) updateData.carbs = parseFloat(carbs);
  if (fats !== undefined) updateData.fats = parseFloat(fats);
  if (fiber !== undefined) updateData.fiber = fiber ? parseFloat(fiber) : null;
  if (ingredients !== undefined) updateData.ingredients = ingredients;
  if (recipe !== undefined) updateData.recipe = recipe;
  if (prepTime !== undefined) updateData.prepTime = prepTime ? parseInt(prepTime) : null;
  if (cookTime !== undefined) updateData.cookTime = cookTime ? parseInt(cookTime) : null;
  if (price !== undefined) updateData.price = parseFloat(price);
  if (cost !== undefined) updateData.cost = cost ? parseFloat(cost) : null;
  if (category !== undefined) updateData.category = category || null;
  if (dietaryTags !== undefined) updateData.dietaryTags = dietaryTags;
  if (cuisine !== undefined) updateData.cuisine = cuisine || null;
  if (imageUrls !== undefined) updateData.imageUrls = imageUrls;
  if (isActive !== undefined) updateData.isActive = isActive;

  const updatedMeal = await prisma.meal.update({
    where: { id },
    data: updateData,
  });

  res.json({
    success: true,
    message: 'Meal updated successfully',
    data: updatedMeal,
  });
};

// Delete meal
export const deleteMeal = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  // Check if meal exists
  const existingMeal = await prisma.meal.findUnique({
    where: { id },
  });

  if (!existingMeal) {
    throw createError('Meal not found', 404);
  }

  // Check if meal is used in any orders
  const orderItemsCount = await prisma.orderItem.count({
    where: { mealId: id },
  });

  if (orderItemsCount > 0) {
    // Soft delete - set isActive to false instead of deleting
    await prisma.meal.update({
      where: { id },
      data: { isActive: false },
    });

    res.json({
      success: true,
      message: 'Meal deactivated (cannot delete meal that has been ordered)',
    });
  } else {
    // Hard delete if no orders
    await prisma.meal.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Meal deleted successfully',
    });
  }
};
