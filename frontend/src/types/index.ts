// User types
export interface User {
  id: string;
  email: string;
  phone: string;
  firstName?: string;
  lastName?: string;
  age?: number;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  currentWeight?: number;
  height?: number;
  targetWeight?: number;
  goal?: 'WEIGHT_LOSS' | 'MUSCLE_GAIN' | 'MAINTENANCE' | 'ATHLETIC_PERFORMANCE';
  activityLevel?: 'SEDENTARY' | 'LIGHTLY_ACTIVE' | 'MODERATELY_ACTIVE' | 'VERY_ACTIVE' | 'EXTREMELY_ACTIVE';
  dietaryRestrictions?: string[];
  allergies?: string[];
  preferredLanguage: 'uz' | 'ru' | 'en';
}

// Meal types
export interface Meal {
  id: string;
  name: {
    uz: string;
    ru: string;
    en: string;
  };
  description: {
    uz: string;
    ru: string;
    en: string;
  };
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber?: number;
  price: number;
  imageUrls: string[];
  dietaryTags: string[];
  isActive: boolean;
}

// Order types
export interface Order {
  id: string;
  userId: string;
  deliveryDate: string;
  status: 'PENDING' | 'PREPARING' | 'READY' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
  totalPrice: number;
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  mealId: string;
  meal: Meal;
  quantity: number;
  portionSize: string;
  price: number;
}

// Subscription types
export interface Subscription {
  id: string;
  userId: string;
  planType: string;
  mealsPerDay: number;
  startDate: string;
  endDate?: string;
  status: 'ACTIVE' | 'PAUSED' | 'CANCELLED' | 'EXPIRED';
  deliveryDays: number[];
  deliveryTimeSlot?: string;
  selectedMeals: string[];
  price: number;
  paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
}

// Nutrition goals
export interface NutritionGoals {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
  };
}

