import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { OnboardingStepper } from '../../components/OnboardingStepper';
import { useAuthStore } from '../../store/authStore';
import { profileApi } from '../../api/profile';

const personalDetailsSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  age: z.number().min(13, 'Must be at least 13 years old').max(100, 'Invalid age'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  currentWeight: z.number().min(30, 'Invalid weight').max(300, 'Invalid weight'),
  height: z.number().min(100, 'Invalid height').max(250, 'Invalid height'),
  targetWeight: z.number().min(30, 'Invalid target weight').max(300, 'Invalid target weight').optional(),
  goal: z.enum(['WEIGHT_LOSS', 'MUSCLE_GAIN', 'MAINTENANCE', 'ATHLETIC_PERFORMANCE']),
  activityLevel: z.enum(['SEDENTARY', 'LIGHTLY_ACTIVE', 'MODERATELY_ACTIVE', 'VERY_ACTIVE', 'EXTREMELY_ACTIVE']),
  dietaryRestrictions: z.array(z.string()).optional(),
  allergies: z.array(z.string()).optional(),
  foodDislikes: z.array(z.string()).optional(),
});

type PersonalDetailsFormData = z.infer<typeof personalDetailsSchema>;

const dietaryRestrictionsOptions = [
  { value: 'vegetarian', label: { uz: 'Vegetarian', ru: 'Вегетарианство', en: 'Vegetarian' } },
  { value: 'vegan', label: { uz: 'Vegan', ru: 'Веганство', en: 'Vegan' } },
  { value: 'gluten-free', label: { uz: 'Gluten-siz', ru: 'Без глютена', en: 'Gluten-Free' } },
  { value: 'dairy-free', label: { uz: 'Sut-siz', ru: 'Без молока', en: 'Dairy-Free' } },
  { value: 'halal', label: { uz: 'Halol', ru: 'Халяль', en: 'Halal' } },
  { value: 'keto', label: { uz: 'Keto', ru: 'Кето', en: 'Keto' } },
  { value: 'low-carb', label: { uz: 'Past karbohidrat', ru: 'Низкоуглеводный', en: 'Low-Carb' } },
];

const commonAllergies = [
  { value: 'nuts', label: { uz: 'Yong\'oq', ru: 'Орехи', en: 'Nuts' } },
  { value: 'peanuts', label: { uz: 'Yer yong\'og\'i', ru: 'Арахис', en: 'Peanuts' } },
  { value: 'shellfish', label: { uz: 'Qisqichbaqa', ru: 'Морепродукты', en: 'Shellfish' } },
  { value: 'eggs', label: { uz: 'Tuxum', ru: 'Яйца', en: 'Eggs' } },
  { value: 'milk', label: { uz: 'Sut', ru: 'Молоко', en: 'Milk' } },
  { value: 'soy', label: { uz: 'Soya', ru: 'Соя', en: 'Soy' } },
  { value: 'wheat', label: { uz: 'Bug\'doy', ru: 'Пшеница', en: 'Wheat' } },
];

export const PersonalDetails = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nutritionGoals, setNutritionGoals] = useState<{
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  } | null>(null);

  const currentLanguage = i18n.language as 'uz' | 'ru' | 'en';

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PersonalDetailsFormData>({
    resolver: zodResolver(personalDetailsSchema),
    defaultValues: {
      dietaryRestrictions: [],
      allergies: [],
      foodDislikes: [],
    },
  });

  const watchedFields = watch(['age', 'gender', 'currentWeight', 'height', 'targetWeight', 'goal', 'activityLevel']);

  // Calculate nutrition goals when form fields change
  useEffect(() => {
    const [age, gender, weight, height, , goal, activityLevel] = watchedFields; // targetWeight not used in calculation
    
    if (age && gender && weight && height && goal && activityLevel) {
      // BMR calculation (Mifflin-St Jeor Equation)
      let bmr: number;
      if (gender === 'MALE') {
        bmr = 10 * weight + 6.25 * height - 5 * age + 5;
      } else {
        bmr = 10 * weight + 6.25 * height - 5 * age - 161;
      }

      // Activity multiplier
      const activityMultipliers: Record<string, number> = {
        SEDENTARY: 1.2,
        LIGHTLY_ACTIVE: 1.375,
        MODERATELY_ACTIVE: 1.55,
        VERY_ACTIVE: 1.725,
        EXTREMELY_ACTIVE: 1.9,
      };

      const tdee = bmr * (activityMultipliers[activityLevel] || 1.2);

      // Goal adjustments
      let calories = tdee;
      if (goal === 'WEIGHT_LOSS') {
        calories = tdee * 0.85; // 15% deficit
      } else if (goal === 'MUSCLE_GAIN') {
        calories = tdee * 1.15; // 15% surplus
      } else if (goal === 'ATHLETIC_PERFORMANCE') {
        calories = tdee * 1.1; // 10% surplus
      }

      // Macronutrient distribution
      const protein = weight * 2.2; // 2.2g per kg of body weight
      const fats = (calories * 0.25) / 9; // 25% of calories from fats
      const carbs = (calories - (protein * 4) - (fats * 9)) / 4; // Remaining calories from carbs

      setNutritionGoals({
        calories: Math.round(calories),
        protein: Math.round(protein),
        carbs: Math.round(carbs),
        fats: Math.round(fats),
      });
    }
  }, [watchedFields]);

  const onSubmit = async (data: PersonalDetailsFormData) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Update user profile
      const updateData: any = {
        firstName: data.firstName,
        lastName: data.lastName,
        age: data.age,
        gender: data.gender,
        currentWeight: data.currentWeight,
        height: data.height,
        targetWeight: data.targetWeight,
        goal: data.goal,
        activityLevel: data.activityLevel,
        dietaryRestrictions: data.dietaryRestrictions || [],
        allergies: data.allergies || [],
        foodDislikes: data.foodDislikes || [],
        nutritionGoals: nutritionGoals || {},
      };

      await profileApi.updateCurrentProfile(updateData);

      // Save to sessionStorage
      const onboardingData = JSON.parse(sessionStorage.getItem('onboarding_data') || '{}');
      sessionStorage.setItem('onboarding_data', JSON.stringify({
        ...onboardingData,
        personalDetails: data,
        nutritionGoals,
        step: 2,
      }));

      navigate('/onboarding/meals');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to save personal details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/onboarding/plan');
  };

  const toggleArrayField = (field: 'dietaryRestrictions' | 'allergies' | 'foodDislikes', value: string) => {
    const current = watch(field) || [];
    const updated = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];
    setValue(field, updated);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <OnboardingStepper currentStep={2} />

        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 mt-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t('onboarding.step2.title')}
            </h1>
            <p className="text-lg text-gray-600">
              {t('onboarding.step2.subtitle')}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth.firstName')} *
                </label>
                <input
                  {...register('firstName')}
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth.lastName')} *
                </label>
                <input
                  {...register('lastName')}
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            {/* Physical Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('onboarding.details.age', 'Age')} *
                </label>
                <input
                  {...register('age', { valueAsNumber: true })}
                  type="number"
                  min="13"
                  max="100"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                {errors.age && (
                  <p className="mt-1 text-sm text-red-600">{errors.age.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('onboarding.details.gender', 'Gender')} *
                </label>
                <select
                  {...register('gender')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">{t('common.optional')}</option>
                  <option value="MALE">{t('onboarding.details.gender.male', 'Male')}</option>
                  <option value="FEMALE">{t('onboarding.details.gender.female', 'Female')}</option>
                  <option value="OTHER">{t('onboarding.details.gender.other', 'Other')}</option>
                </select>
                {errors.gender && (
                  <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('onboarding.details.height', 'Height (cm)')} *
                </label>
                <input
                  {...register('height', { valueAsNumber: true })}
                  type="number"
                  min="100"
                  max="250"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                {errors.height && (
                  <p className="mt-1 text-sm text-red-600">{errors.height.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('onboarding.details.currentWeight', 'Current Weight (kg)')} *
                </label>
                <input
                  {...register('currentWeight', { valueAsNumber: true })}
                  type="number"
                  step="0.1"
                  min="30"
                  max="300"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                {errors.currentWeight && (
                  <p className="mt-1 text-sm text-red-600">{errors.currentWeight.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('onboarding.details.targetWeight', 'Target Weight (kg)')}
                </label>
                <input
                  {...register('targetWeight', { valueAsNumber: true })}
                  type="number"
                  step="0.1"
                  min="30"
                  max="300"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                {errors.targetWeight && (
                  <p className="mt-1 text-sm text-red-600">{errors.targetWeight.message}</p>
                )}
              </div>
            </div>

            {/* Goals and Activity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('onboarding.details.goal', 'Goal')} *
                </label>
                <select
                  {...register('goal')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">{t('common.optional')}</option>
                  <option value="WEIGHT_LOSS">{t('onboarding.details.goal.weightLoss', 'Weight Loss')}</option>
                  <option value="MUSCLE_GAIN">{t('onboarding.details.goal.muscleGain', 'Muscle Gain')}</option>
                  <option value="MAINTENANCE">{t('onboarding.details.goal.maintenance', 'Maintenance')}</option>
                  <option value="ATHLETIC_PERFORMANCE">{t('onboarding.details.goal.athletic', 'Athletic Performance')}</option>
                </select>
                {errors.goal && (
                  <p className="mt-1 text-sm text-red-600">{errors.goal.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('onboarding.details.activityLevel', 'Activity Level')} *
                </label>
                <select
                  {...register('activityLevel')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">{t('common.optional')}</option>
                  <option value="SEDENTARY">{t('onboarding.details.activity.sedentary', 'Sedentary')}</option>
                  <option value="LIGHTLY_ACTIVE">{t('onboarding.details.activity.light', 'Lightly Active')}</option>
                  <option value="MODERATELY_ACTIVE">{t('onboarding.details.activity.moderate', 'Moderately Active')}</option>
                  <option value="VERY_ACTIVE">{t('onboarding.details.activity.very', 'Very Active')}</option>
                  <option value="EXTREMELY_ACTIVE">{t('onboarding.details.activity.extreme', 'Extremely Active')}</option>
                </select>
                {errors.activityLevel && (
                  <p className="mt-1 text-sm text-red-600">{errors.activityLevel.message}</p>
                )}
              </div>
            </div>

            {/* Nutrition Goals Preview */}
            {nutritionGoals && (
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-lg border border-emerald-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {t('onboarding.details.nutritionGoals', 'Your Nutrition Goals')}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600">{nutritionGoals.calories}</div>
                    <div className="text-sm text-gray-600">{t('onboarding.details.calories', 'Calories')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{nutritionGoals.protein}g</div>
                    <div className="text-sm text-gray-600">{t('onboarding.details.protein', 'Protein')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{nutritionGoals.carbs}g</div>
                    <div className="text-sm text-gray-600">{t('onboarding.details.carbs', 'Carbs')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{nutritionGoals.fats}g</div>
                    <div className="text-sm text-gray-600">{t('onboarding.details.fats', 'Fats')}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Dietary Restrictions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                {t('onboarding.details.dietaryRestrictions', 'Dietary Restrictions')}
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {dietaryRestrictionsOptions.map((option) => {
                  const label = option.label[currentLanguage] || option.label.en;
                  const isSelected = (watch('dietaryRestrictions') || []).includes(option.value);
                  return (
                    <label
                      key={option.value}
                      className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-gray-200 hover:border-emerald-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleArrayField('dietaryRestrictions', option.value)}
                        className="mr-2"
                      />
                      <span className="text-sm">{label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Allergies */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                {t('onboarding.details.allergies', 'Allergies')}
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {commonAllergies.map((allergy) => {
                  const label = allergy.label[currentLanguage] || allergy.label.en;
                  const isSelected = (watch('allergies') || []).includes(allergy.value);
                  return (
                    <label
                      key={allergy.value}
                      className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        isSelected
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200 hover:border-red-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleArrayField('allergies', allergy.value)}
                        className="mr-2"
                      />
                      <span className="text-sm">{label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-6 border-t">
              <button
                type="button"
                onClick={handleBack}
                className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                ← {t('onboarding.back', 'Back')}
              </button>

              <button
                type="submit"
                disabled={loading}
                className={`px-8 py-3 rounded-lg font-semibold text-white transition-all duration-300 ${
                  loading
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-gradient-to-r from-orange-500 to-coral-500 hover:from-orange-600 hover:to-coral-600 shadow-lg hover:shadow-xl transform hover:scale-105'
                }`}
              >
                {loading ? t('common.loading', 'Loading...') : `${t('onboarding.next', 'Next')} →`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
