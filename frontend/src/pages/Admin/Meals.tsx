import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { mealsApi, Meal, GetMealsParams, CreateMealData } from '../../api/meals';
import { useStaffAuthStore } from '../../store/staffAuthStore';

export const Meals = () => {
  const { t, i18n } = useTranslation();
  const { staff: currentStaff } = useStaffAuthStore();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddMode, setIsAddMode] = useState(false);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isActiveFilter, setIsActiveFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const currentLanguage = i18n.language as 'uz' | 'ru' | 'en';

  const fetchMeals = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const staffToken = localStorage.getItem('staffAccessToken');
      if (!staffToken) {
        setError('Authentication required. Please log in again.');
        return;
      }
      
      const params: GetMealsParams = {
        page,
        limit,
        search: search || undefined,
        category: categoryFilter === 'all' ? undefined : categoryFilter,
        isActive: isActiveFilter === 'all' ? undefined : isActiveFilter === 'active',
        sortBy,
        sortOrder,
      };
      
      const response = await mealsApi.getMeals(params);
      
      if (response.success && response.data) {
        setMeals(response.data.meals);
        setTotal(response.data.pagination.total);
        setTotalPages(response.data.pagination.totalPages);
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('Your session has expired. Please refresh the page or log in again.');
      } else {
        setError(err.response?.data?.error?.message || 'Failed to load meals');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeals();
  }, [page, limit, search, categoryFilter, isActiveFilter, sortBy, sortOrder]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleDelete = async (mealId: string) => {
    if (!window.confirm(t('admin.meals.confirmDelete', 'Are you sure you want to delete this meal?'))) {
      return;
    }

    try {
      await mealsApi.deleteMeal(mealId);
      await fetchMeals();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || t('admin.meals.deleteError', 'Failed to delete meal'));
    }
  };

  const handleEdit = (meal: Meal) => {
    setSelectedMeal(meal);
    setIsAddMode(false);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedMeal(null);
    setIsAddMode(true);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedMeal(null);
    setIsAddMode(false);
    fetchMeals();
  };

  const getMealName = (meal: Meal) => {
    return meal.name[currentLanguage] || meal.name.en || 'Untitled Meal';
  };

  const canManageMeals = currentStaff?.role === 'SUPER_ADMIN' || 
                         currentStaff?.role === 'LOCATION_MANAGER' || 
                         currentStaff?.role === 'CHEF' || 
                         currentStaff?.role === 'NUTRITIONIST';

  const categoryOptions = ['breakfast', 'lunch', 'dinner', 'snack'];

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('admin.meals.title', 'Meals')}</h1>
          <p className="mt-1 text-sm text-gray-500">{t('admin.meals.subtitle', 'Manage meal menu and nutrition information')}</p>
        </div>
        {canManageMeals && (
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
          >
            + {t('admin.meals.addMeal', 'Add Meal')}
          </button>
        )}
      </div>

      {/* Filters and Search */}
      <div className="mb-4 space-y-4 sm:flex sm:items-center sm:space-y-0 sm:space-x-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder={t('admin.meals.searchPlaceholder', 'Search meals...')}
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        >
          <option value="all">{t('admin.meals.allCategories', 'All Categories')}</option>
          {categoryOptions.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select
          value={isActiveFilter}
          onChange={(e) => {
            setIsActiveFilter(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        >
          <option value="all">{t('admin.meals.allStatus', 'All Status')}</option>
          <option value="active">{t('admin.meals.active', 'Active')}</option>
          <option value="inactive">{t('admin.meals.inactive', 'Inactive')}</option>
        </select>
        <select
          value={`${sortBy}-${sortOrder}`}
          onChange={(e) => {
            const [field, order] = e.target.value.split('-');
            setSortBy(field);
            setSortOrder(order as 'asc' | 'desc');
            setPage(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        >
          <option value="createdAt-desc">{t('admin.meals.newestFirst', 'Newest First')}</option>
          <option value="createdAt-asc">{t('admin.meals.oldestFirst', 'Oldest First')}</option>
          <option value="price-asc">{t('admin.meals.priceLowHigh', 'Price: Low to High')}</option>
          <option value="price-desc">{t('admin.meals.priceHighLow', 'Price: High to Low')}</option>
        </select>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Meals Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          <p className="mt-2 text-gray-500">{t('admin.meals.loading', 'Loading meals...')}</p>
        </div>
      ) : meals.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500">{t('admin.meals.noMeals', 'No meals found')}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
            {meals.map((meal) => {
              const mealName = getMealName(meal);
              const firstImage = Array.isArray(meal.imageUrls) && meal.imageUrls.length > 0 
                ? meal.imageUrls[0] 
                : 'https://via.placeholder.com/300x200?text=Meal';

              return (
                <div
                  key={meal.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-gray-200 hover:border-emerald-300 transition-all"
                >
                  {/* Meal Image */}
                  <div className="relative h-48 bg-gray-200">
                    <img
                      src={firstImage}
                      alt={mealName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=Meal';
                      }}
                    />
                    {!meal.isActive && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                        {t('admin.meals.inactive', 'Inactive')}
                      </div>
                    )}
                  </div>

                  {/* Meal Info */}
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{mealName}</h3>
                    
                    {/* Nutrition Info */}
                    <div className="grid grid-cols-4 gap-2 mb-3 text-xs">
                      <div className="text-center">
                        <div className="font-semibold text-emerald-600">{meal.calories}</div>
                        <div className="text-gray-500">kcal</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-blue-600">{meal.protein}g</div>
                        <div className="text-gray-500">P</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-orange-600">{meal.carbs}g</div>
                        <div className="text-gray-500">C</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-purple-600">{meal.fats}g</div>
                        <div className="text-gray-500">F</div>
                      </div>
                    </div>

                    {/* Price and Category */}
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-lg font-bold text-emerald-600">
                        {new Intl.NumberFormat('uz-UZ', {
                          style: 'currency',
                          currency: 'UZS',
                          minimumFractionDigits: 0,
                        }).format(meal.price)}
                      </span>
                      {meal.category && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          {meal.category}
                        </span>
                      )}
                    </div>

                    {/* Orders Count */}
                    {meal._count && (
                      <div className="text-xs text-gray-500 mb-3">
                        {t('admin.meals.ordered', 'Ordered {{count}} times', { count: meal._count.orderItems })}
                      </div>
                    )}

                    {/* Actions */}
                    {canManageMeals && (
                      <div className="flex space-x-2 pt-2 border-t">
                        <button
                          onClick={() => handleEdit(meal)}
                          className="flex-1 px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
                        >
                          {t('admin.meals.edit', 'Edit')}
                        </button>
                        {(currentStaff?.role === 'SUPER_ADMIN' || currentStaff?.role === 'LOCATION_MANAGER') && (
                          <button
                            onClick={() => handleDelete(meal.id)}
                            className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                          >
                            {t('admin.meals.delete', 'Delete')}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              {t('admin.meals.showing', 'Showing {{start}} to {{end}} of {{total}} meals', {
                start: meals.length > 0 ? (page - 1) * limit + 1 : 0,
                end: Math.min(page * limit, total),
                total,
              })}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                {t('admin.meals.previous', 'Previous')}
              </button>
              <span className="px-4 py-2 text-sm text-gray-700">
                {t('admin.meals.page', 'Page {{current}} of {{total}}', { current: page, total: totalPages || 1 })}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                {t('admin.meals.next', 'Next')}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Meal Modal */}
      {isModalOpen && (
        <MealModal
          meal={selectedMeal}
          isAddMode={isAddMode}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
};

// Meal Modal Component
interface MealModalProps {
  meal: Meal | null;
  isAddMode: boolean;
  onClose: () => void;
}

const MealModal = ({ meal, isAddMode, onClose }: MealModalProps) => {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language as 'uz' | 'ru' | 'en';
  
  const [formData, setFormData] = useState<CreateMealData>({
    name: {
      uz: meal?.name?.uz || '',
      ru: meal?.name?.ru || '',
      en: meal?.name?.en || '',
    },
    description: {
      uz: meal?.description?.uz || '',
      ru: meal?.description?.ru || '',
      en: meal?.description?.en || '',
    },
    calories: meal?.calories || 0,
    protein: meal?.protein || 0,
    carbs: meal?.carbs || 0,
    fats: meal?.fats || 0,
    fiber: meal?.fiber,
    ingredients: meal?.ingredients || [],
    recipe: meal?.recipe,
    prepTime: meal?.prepTime,
    cookTime: meal?.cookTime,
    price: meal?.price || 0,
    cost: meal?.cost,
    category: meal?.category || '',
    dietaryTags: meal?.dietaryTags || [],
    cuisine: meal?.cuisine || '',
    imageUrls: meal?.imageUrls || [],
    isActive: meal?.isActive ?? true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'uz' | 'ru' | 'en'>('uz');

  const categoryOptions = ['breakfast', 'lunch', 'dinner', 'snack'];
  const cuisineOptions = ['uzbek', 'european', 'asian', 'middle-eastern', 'american'];
  const dietaryTagsOptions = ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'halal', 'keto', 'low-carb', 'high-protein'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isAddMode) {
        await mealsApi.createMeal(formData);
      } else {
        await mealsApi.updateMeal(meal!.id, formData);
      }
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || t('admin.meals.saveError', 'Failed to save meal'));
    } finally {
      setLoading(false);
    }
  };

  const updateName = (lang: 'uz' | 'ru' | 'en', value: string) => {
    setFormData({
      ...formData,
      name: { ...formData.name, [lang]: value },
    });
  };

  const updateDescription = (lang: 'uz' | 'ru' | 'en', value: string) => {
    setFormData({
      ...formData,
      description: { ...formData.description, [lang]: value },
    });
  };

  const toggleDietaryTag = (tag: string) => {
    const tags = formData.dietaryTags || [];
    const updated = tags.includes(tag)
      ? tags.filter((t) => t !== tag)
      : [...tags, tag];
    setFormData({ ...formData, dietaryTags: updated });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {isAddMode ? t('admin.meals.addMeal', 'Add Meal') : t('admin.meals.editMeal', 'Edit Meal')}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Language Tabs for Name/Description */}
            <div className="border-b border-gray-200">
              <div className="flex space-x-4">
                {(['uz', 'ru', 'en'] as const).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setActiveTab(lang)}
                    className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                      activeTab === lang
                        ? 'border-emerald-600 text-emerald-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Name and Description (Multi-language) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('admin.meals.name', 'Name')} ({activeTab.toUpperCase()}) *
              </label>
              <input
                type="text"
                required
                value={formData.name[activeTab]}
                onChange={(e) => updateName(activeTab, e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('admin.meals.description', 'Description')} ({activeTab.toUpperCase()}) *
              </label>
              <textarea
                required
                rows={3}
                value={formData.description[activeTab]}
                onChange={(e) => updateDescription(activeTab, e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            {/* Nutrition Info */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.meals.calories', 'Calories')} *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.calories}
                  onChange={(e) => setFormData({ ...formData, calories: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.meals.protein', 'Protein (g)')} *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.1"
                  value={formData.protein}
                  onChange={(e) => setFormData({ ...formData, protein: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.meals.carbs', 'Carbs (g)')} *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.1"
                  value={formData.carbs}
                  onChange={(e) => setFormData({ ...formData, carbs: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.meals.fats', 'Fats (g)')} *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.1"
                  value={formData.fats}
                  onChange={(e) => setFormData({ ...formData, fats: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.meals.fiber', 'Fiber (g)')}
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.fiber || ''}
                  onChange={(e) => setFormData({ ...formData, fiber: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.meals.price', 'Price (UZS)')} *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="1000"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.meals.cost', 'Cost (UZS)')} ({t('common.optional')})
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.cost || ''}
                  onChange={(e) => setFormData({ ...formData, cost: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Category and Cuisine */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.meals.category', 'Category')}
                </label>
                <select
                  value={formData.category || ''}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value || undefined })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">{t('common.optional')}</option>
                  {categoryOptions.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.meals.cuisine', 'Cuisine')}
                </label>
                <select
                  value={formData.cuisine || ''}
                  onChange={(e) => setFormData({ ...formData, cuisine: e.target.value || undefined })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">{t('common.optional')}</option>
                  {cuisineOptions.map((cui) => (
                    <option key={cui} value={cui}>{cui}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Dietary Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('admin.meals.dietaryTags', 'Dietary Tags')}
              </label>
              <div className="flex flex-wrap gap-2">
                {dietaryTagsOptions.map((tag) => {
                  const isSelected = (formData.dietaryTags || []).includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleDietaryTag(tag)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        isSelected
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Image URLs */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('admin.meals.imageUrls', 'Image URLs')} ({t('common.optional')})
              </label>
              <textarea
                rows={3}
                placeholder={t('admin.meals.imageUrlsPlaceholder', 'Enter image URLs, one per line')}
                value={Array.isArray(formData.imageUrls) ? formData.imageUrls.join('\n') : ''}
                onChange={(e) => {
                  const urls = e.target.value.split('\n').filter((url) => url.trim());
                  setFormData({ ...formData, imageUrls: urls });
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                {t('admin.meals.imageUrlsHint', 'Enter one URL per line. For now, use placeholder URLs or Cloudinary URLs.')}
              </p>
            </div>

            {/* Active Status */}
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive ?? true}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">{t('admin.meals.active', 'Active')}</span>
              </label>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {t('common.cancel', 'Cancel')}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? t('common.loading', 'Loading...') : t('common.save', 'Save')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
