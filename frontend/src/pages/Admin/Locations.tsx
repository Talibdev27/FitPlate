import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { locationsApi, Location, GetLocationsParams, CreateLocationData } from '../../api/locations';
import { staffApi } from '../../api/staff';
import { useStaffAuthStore } from '../../store/staffAuthStore';

export const Locations = () => {
  const { t } = useTranslation();
  const { staff: currentStaff } = useStaffAuthStore();
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddMode, setIsAddMode] = useState(false);
  const [managers, setManagers] = useState<any[]>([]);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // Filters
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchLocations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: GetLocationsParams = {
        page,
        limit,
        search: search || undefined,
        sortBy,
        sortOrder,
      };
      
      const response = await locationsApi.getLocations(params);
      
      if (response.success && response.data) {
        setLocations(response.data.locations);
        setTotal(response.data.pagination.total);
        setTotalPages(response.data.pagination.totalPages);
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('Your session has expired. Please refresh the page or log in again.');
      } else {
        setError(err.response?.data?.error?.message || 'Failed to load locations');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchManagers = async () => {
    try {
      const response = await staffApi.getStaff({ role: 'LOCATION_MANAGER', limit: 100 });
      if (response.success && response.data) {
        setManagers(response.data.staff);
      }
    } catch (err) {
      console.error('Failed to fetch managers:', err);
    }
  };

  useEffect(() => {
    fetchLocations();
    if (isAddMode || isModalOpen) {
      fetchManagers();
    }
  }, [page, limit, search, sortBy, sortOrder, isAddMode, isModalOpen]);

  const handleDelete = async (locationId: string) => {
    if (!window.confirm(t('admin.locations.confirmDelete', 'Are you sure you want to delete this location?'))) {
      return;
    }

    try {
      await locationsApi.deleteLocation(locationId);
      await fetchLocations();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || t('admin.locations.deleteError', 'Failed to delete location'));
    }
  };

  const handleEdit = (location: Location) => {
    setSelectedLocation(location);
    setIsAddMode(false);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedLocation(null);
    setIsAddMode(true);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedLocation(null);
    setIsAddMode(false);
    fetchLocations();
  };

  const canManageLocations = currentStaff?.role === 'SUPER_ADMIN' || currentStaff?.role === 'LOCATION_MANAGER';

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('admin.locations.title', 'Locations')}</h1>
          <p className="mt-1 text-sm text-gray-500">{t('admin.locations.subtitle', 'Manage delivery locations')}</p>
        </div>
        {currentStaff?.role === 'SUPER_ADMIN' && (
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
          >
            + {t('admin.locations.addLocation', 'Add Location')}
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="mb-4 space-y-4 sm:flex sm:items-center sm:space-y-0 sm:space-x-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder={t('admin.locations.searchPlaceholder', 'Search locations...')}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
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
          <option value="createdAt-desc">{t('admin.locations.newestFirst', 'Newest First')}</option>
          <option value="createdAt-asc">{t('admin.locations.oldestFirst', 'Oldest First')}</option>
          <option value="name-asc">{t('admin.locations.nameAZ', 'Name A-Z')}</option>
          <option value="name-desc">{t('admin.locations.nameZA', 'Name Z-A')}</option>
        </select>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Locations Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          <p className="mt-2 text-gray-500">{t('admin.locations.loading', 'Loading locations...')}</p>
        </div>
      ) : locations.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500">{t('admin.locations.noLocations', 'No locations found')}</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.locations.name', 'Name')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.locations.city', 'City')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.locations.address', 'Address')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.locations.manager', 'Manager')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.locations.stats', 'Stats')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.locations.status', 'Status')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.locations.actions', 'Actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {locations.map((location) => (
                    <tr key={location.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{location.name}</div>
                        {location.district && (
                          <div className="text-sm text-gray-500">{location.district}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {location.city}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">{location.address}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {location.manager ? (
                          <div className="text-sm text-gray-900">
                            {location.manager.firstName} {location.manager.lastName}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">{t('admin.locations.noManager', 'No manager')}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>Orders: {location._count?.orders || 0}</div>
                        <div>Staff: {location._count?.staff || 0}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            location.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {location.isActive ? t('admin.locations.active', 'Active') : t('admin.locations.inactive', 'Inactive')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {canManageLocations ? (
                          <>
                            <button
                              onClick={() => handleEdit(location)}
                              className="text-emerald-600 hover:text-emerald-900 mr-4"
                            >
                              {t('admin.locations.edit', 'Edit')}
                            </button>
                            {currentStaff?.role === 'SUPER_ADMIN' && (
                              <button
                                onClick={() => handleDelete(location.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                {t('admin.locations.delete', 'Delete')}
                              </button>
                            )}
                          </>
                        ) : (
                          <span className="text-gray-400">{t('admin.locations.noPermission', 'No permission')}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              {t('admin.locations.showing', 'Showing {{start}} to {{end}} of {{total}} locations', {
                start: locations.length > 0 ? (page - 1) * limit + 1 : 0,
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
                {t('admin.locations.previous', 'Previous')}
              </button>
              <span className="px-4 py-2 text-sm text-gray-700">
                {t('admin.locations.page', 'Page {{current}} of {{total}}', { current: page, total: totalPages || 1 })}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                {t('admin.locations.next', 'Next')}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Location Modal */}
      {isModalOpen && (
        <LocationModal
          location={selectedLocation}
          isAddMode={isAddMode}
          managers={managers}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
};

// Location Modal Component
interface LocationModalProps {
  location: Location | null;
  isAddMode: boolean;
  managers: any[];
  onClose: () => void;
}

const LocationModal = ({ location, isAddMode, managers, onClose }: LocationModalProps) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<CreateLocationData>({
    name: location?.name || '',
    city: location?.city || '',
    district: location?.district || '',
    address: location?.address || '',
    coordinates: location?.coordinates || null,
    phone: location?.phone || '',
    email: location?.email || '',
    managerId: location?.managerId || '',
    isActive: location?.isActive ?? true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isAddMode) {
        await locationsApi.createLocation(formData);
      } else {
        await locationsApi.updateLocation(location!.id, formData);
      }
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || t('admin.locations.saveError', 'Failed to save location'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {isAddMode ? t('admin.locations.addLocation', 'Add Location') : t('admin.locations.editLocation', 'Edit Location')}
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.locations.name', 'Name')} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.locations.city', 'City')} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('admin.locations.district', 'District')} ({t('common.optional')})
              </label>
              <input
                type="text"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('admin.locations.address', 'Address')} *
              </label>
              <textarea
                required
                rows={2}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth.phone')} ({t('common.optional')})
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth.email')} ({t('common.optional')})
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('admin.locations.manager', 'Manager')} ({t('common.optional')})
              </label>
              <select
                value={formData.managerId || ''}
                onChange={(e) => setFormData({ ...formData, managerId: e.target.value || undefined })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">{t('admin.locations.selectManager', 'Select Manager')}</option>
                {managers.map((manager) => (
                  <option key={manager.id} value={manager.id}>
                    {manager.firstName} {manager.lastName} ({manager.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive ?? true}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">{t('admin.locations.active', 'Active')}</span>
              </label>
            </div>

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
