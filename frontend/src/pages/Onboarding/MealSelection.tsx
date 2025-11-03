import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { OnboardingStepper } from '../../components/OnboardingStepper';

interface Meal {
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
  category?: string;
  dietaryTags: string[];
  cuisine?: string;
  imageUrls: string[];
  isActive: boolean;
}

export const MealSelection = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [selectedMeals, setSelectedMeals] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const currentLanguage = i18n.language as 'uz' | 'ru' | 'en';

  useEffect(() => {
    fetchMeals();
  }, []);

  const fetchMeals = async () => {
    try {
      setLoading(true);
      setError(null);
      // TODO: Replace with actual meals API endpoint
      // For now, using mock data
      const mockMeals: Meal[] = [
        {
          id: '1',
          name: { uz: 'Grill Tovuq', ru: 'Курица на гриле', en: 'Grilled Chicken' },
          description: { uz: 'Sog\'lom va mazali grill tovuq', ru: 'Здоровое и вкусное блюдо из курицы на гриле', en: 'Healthy and delicious grilled chicken' },
          calories: 350,
          protein: 40,
          carbs: 5,
          fats: 15,
          fiber: 2,
          price: 45000,
          category: 'lunch',
          dietaryTags: ['high-protein', 'gluten-free'],
          cuisine: 'european',
          imageUrls: ['https://via.placeholder.com/300x200?text=Grilled+Chicken'],
          isActive: true,
        },
        {
          id: '2',
          name: { uz: 'Salat', ru: 'Салат', en: 'Salad' },
          description: { uz: 'Yengil va taze salat', ru: 'Легкий и свежий салат', en: 'Light and fresh salad' },
          calories: 150,
          protein: 8,
          carbs: 20,
          fats: 5,
          fiber: 6,
          price: 35000,
          category: 'lunch',
          dietaryTags: ['vegetarian', 'low-carb'],
          cuisine: 'european',
          imageUrls: ['https://via.placeholder.com/300x200?text=Salad'],
          isActive: true,
        },
        {
          id: '3',
          name: { uz: 'Oqsho\'r', ru: 'Борщ', en: 'Borscht' },
          description: { uz: 'An\'anaviy oqsho\'r', ru: 'Традиционный борщ', en: 'Traditional borscht' },
          calories: 280,
          protein: 12,
          carbs: 35,
          fats: 8,
          fiber: 5,
          price: 40000,
          category: 'lunch',
          dietaryTags: ['vegetarian'],
          cuisine: 'european',
          imageUrls: ['https://via.placeholder.com/300x200?text=Borscht'],
          isActive: true,
        },
        {
          id: '4',
          name: { uz: 'Somon Baliq', ru: 'Лосось', en: 'Salmon' },
          description: { uz: 'Baliq va sabzavotlar', ru: 'Рыба и овощи', en: 'Fish and vegetables' },
          calories: 420,
          protein: 35,
          carbs: 10,
          fats: 25,
          fiber: 3,
          price: 55000,
          category: 'dinner',
          dietaryTags: ['high-protein', 'omega-3'],
          cuisine: 'european',
          imageUrls: ['https://via.placeholder.com/300x200?text=Salmon'],
          isActive: true,
        },
        {
          id: '5',
          name: { uz: 'Nonushta', ru: 'Завтрак', en: 'Breakfast Bowl' },
          description: { uz: 'Ovqatlanish uchun nonushta', ru: 'Завтрак для питания', en: 'Breakfast for nutrition' },
          calories: 380,
          protein: 20,
          carbs: 45,
          fats: 12,
          fiber: 8,
          price: 40000,
          category: 'breakfast',
          dietaryTags: ['vegetarian', 'high-fiber'],
          cuisine: 'european',
          imageUrls: ['https://via.placeholder.com/300x200?text=Breakfast'],
          isActive: true,
        },
      ];
      setMeals(mockMeals);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load meals. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMealSelection = (mealId: string) => {
    setSelectedMeals((prev) =>
      prev.includes(mealId)
        ? prev.filter((id) => id !== mealId)
        : [...prev, mealId]
    );
  };

  const handleContinue = () => {
    if (selectedMeals.length === 0) {
      setError(t('onboarding.meals.selectAtLeastOne', 'Please select at least one meal'));
      return;
    }

    // Save selected meals to sessionStorage
    const onboardingData = JSON.parse(sessionStorage.getItem('onboarding_data') || '{}');
    sessionStorage.setItem('onboarding_data', JSON.stringify({
      ...onboardingData,
      selectedMeals,
      step: 3,
    }));

    navigate('/onboarding/address');
  };

  const handleBack = () => {
    navigate('/onboarding/details');
  };

  const filteredMeals = meals.filter((meal) => {
    const matchesCategory = categoryFilter === 'all' || meal.category === categoryFilter;
    const matchesSearch = searchTerm === '' || 
      meal.name[currentLanguage]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meal.description[currentLanguage]?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch && meal.isActive;
  });

  const categories = ['all', 'breakfast', 'lunch', 'dinner'];
  const categoryLabels: Record<string, { uz: string; ru: string; en: string }> = {
    all: { uz: 'Barchasi', ru: 'Все', en: 'All' },
    breakfast: { uz: 'Nonushta', ru: 'Завтрак', en: 'Breakfast' },
    lunch: { uz: 'Tushlik', ru: 'Обед', en: 'Lunch' },
    dinner: { uz: 'Kechki ovqat', ru: 'Ужин', en: 'Dinner' },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <OnboardingStepper currentStep={3} />

        <div className="mt-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              {t('onboarding.step3.title')}
            </h1>
            <p className="text-lg text-gray-600">
              {t('onboarding.step3.subtitle')}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <input
                  type="text"
                  placeholder={t('onboarding.meals.search', 'Search meals...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              {/* Category Filter */}
              <div className="flex gap-2 flex-wrap">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      categoryFilter === cat
                        ? 'bg-emerald-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {categoryLabels[cat][currentLanguage] || categoryLabels[cat].en}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Meals Count */}
            <div className="mt-4 text-sm text-gray-600">
              {t('onboarding.meals.selected', '{{count}} meals selected', { count: selectedMeals.length })}
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
              <p className="mt-4 text-gray-600">{t('common.loading', 'Loading...')}</p>
            </div>
          )}

          {/* Meals Grid */}
          {!loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {filteredMeals.map((meal) => {
                const mealName = meal.name[currentLanguage] || meal.name.en;
                const mealDesc = meal.description[currentLanguage] || meal.description.en;
                const isSelected = selectedMeals.includes(meal.id);

                return (
                  <div
                    key={meal.id}
                    className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 cursor-pointer transform hover:scale-105 ${
                      isSelected ? 'ring-4 ring-orange-500 border-2 border-orange-500' : 'border-2 border-gray-200'
                    }`}
                    onClick={() => toggleMealSelection(meal.id)}
                  >
                    {/* Meal Image */}
                    <div className="relative h-48 bg-gray-200">
                      <img
                        src={meal.imageUrls[0] || 'https://via.placeholder.com/300x200?text=Meal'}
                        alt={mealName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=Meal';
                        }}
                      />
                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center">
                          ✓
                        </div>
                      )}
                    </div>

                    {/* Meal Info */}
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{mealName}</h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{mealDesc}</p>

                      {/* Nutrition Info */}
                      <div className="grid grid-cols-4 gap-2 mb-3 text-xs">
                        <div className="text-center">
                          <div className="font-semibold text-emerald-600">{meal.calories}</div>
                          <div className="text-gray-500">kcal</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-blue-600">{meal.protein}g</div>
                          <div className="text-gray-500">Protein</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-orange-600">{meal.carbs}g</div>
                          <div className="text-gray-500">Carbs</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-purple-600">{meal.fats}g</div>
                          <div className="text-gray-500">Fats</div>
                        </div>
                      </div>

                      {/* Dietary Tags */}
                      {meal.dietaryTags && meal.dietaryTags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {meal.dietaryTags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Price */}
                      <div className="text-lg font-bold text-emerald-600">
                        {new Intl.NumberFormat('uz-UZ', {
                          style: 'currency',
                          currency: 'UZS',
                          minimumFractionDigits: 0,
                        }).format(meal.price)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredMeals.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <p className="text-gray-600">{t('onboarding.meals.noMealsFound', 'No meals found')}</p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8">
            <button
              onClick={handleBack}
              className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              ← {t('onboarding.back', 'Back')}
            </button>

            <button
              onClick={handleContinue}
              disabled={selectedMeals.length === 0 || loading}
              className={`px-8 py-3 rounded-lg font-semibold text-white transition-all duration-300 ${
                selectedMeals.length > 0 && !loading
                  ? 'bg-gradient-to-r from-orange-500 to-coral-500 hover:from-orange-600 hover:to-coral-600 shadow-lg hover:shadow-xl transform hover:scale-105'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              {loading ? t('common.loading', 'Loading...') : `${t('onboarding.next', 'Next')} →`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
