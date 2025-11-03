import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { staffApi, Staff as StaffMember, GetStaffParams, CreateStaffData, UpdateStaffData } from '../../api/staff';
import { StaffRole, useStaffAuthStore } from '../../store/staffAuthStore';

export const Staff = () => {
  const { t } = useTranslation();
  const { staff: currentStaff } = useStaffAuthStore();
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddMode, setIsAddMode] = useState(false);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isActiveFilter, setIsActiveFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchStaff = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const staffToken = localStorage.getItem('staffAccessToken');
      if (!staffToken) {
        setError('Authentication required. Please log in again.');
        return;
      }
      
      const params: GetStaffParams = {
        page,
        limit,
        search: search || undefined,
        role: roleFilter === 'all' ? undefined : roleFilter as StaffRole,
        isActive: isActiveFilter === 'all' ? undefined : isActiveFilter === 'active',
        sortBy,
        sortOrder,
      };
      
      const response = await staffApi.getStaff(params);
      
      if (response.success && response.data) {
        setStaffList(response.data.staff);
        setTotal(response.data.pagination.total);
        setTotalPages(response.data.pagination.totalPages);
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        const errorMessage = err.response?.data?.error?.message || 'Authentication failed';
        if (errorMessage.includes('expired') || errorMessage.includes('Invalid')) {
          setError('Your session has expired. Please refresh the page or log in again.');
        } else {
          setError(errorMessage);
        }
      } else {
        setError(err.response?.data?.error?.message || 'Failed to load staff');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [page, limit, search, roleFilter, isActiveFilter, sortBy, sortOrder]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleDelete = async (staffId: string) => {
    if (!window.confirm(t('admin.staff.confirmDelete', 'Are you sure you want to deactivate this staff member?'))) {
      return;
    }

    try {
      await staffApi.deleteStaff(staffId);
      await fetchStaff();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || t('admin.staff.deleteError', 'Failed to deactivate staff member'));
    }
  };

  const handleEdit = (staff: StaffMember) => {
    setSelectedStaff(staff);
    setIsAddMode(false);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedStaff(null);
    setIsAddMode(true);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedStaff(null);
    setIsAddMode(false);
    fetchStaff();
  };

  const getFullName = (staff: StaffMember) => {
    return `${staff.firstName} ${staff.lastName}`.trim();
  };

  const roleOptions: StaffRole[] = ['SUPER_ADMIN', 'LOCATION_MANAGER', 'CHEF', 'DELIVERY_DRIVER', 'CUSTOMER_SUPPORT', 'NUTRITIONIST'];

  // Check if current user can add staff (only SUPER_ADMIN)
  const canAddStaff = currentStaff?.role === 'SUPER_ADMIN';

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('admin.staff.title', 'Staff')}</h1>
          <p className="mt-1 text-sm text-gray-500">{t('admin.staff.subtitle', 'Manage staff members and their roles')}</p>
        </div>
        {canAddStaff && (
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
          >
            + {t('admin.staff.addStaff', 'Add Staff')}
          </button>
        )}
      </div>

      {/* Filters and Search */}
      <div className="mb-4 space-y-4 sm:flex sm:items-center sm:space-y-0 sm:space-x-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder={t('admin.staff.searchPlaceholder', 'Search by email, name, or phone...')}
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        >
          <option value="all">{t('admin.staff.allRoles', 'All Roles')}</option>
          {roleOptions.map((role) => (
            <option key={role} value={role}>{role}</option>
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
          <option value="all">{t('admin.staff.allStatus', 'All Status')}</option>
          <option value="active">{t('admin.staff.active', 'Active')}</option>
          <option value="inactive">{t('admin.staff.inactive', 'Inactive')}</option>
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
          <option value="createdAt-desc">{t('admin.staff.newestFirst', 'Newest First')}</option>
          <option value="createdAt-asc">{t('admin.staff.oldestFirst', 'Oldest First')}</option>
          <option value="email-asc">{t('admin.staff.emailAZ', 'Email A-Z')}</option>
          <option value="email-desc">{t('admin.staff.emailZA', 'Email Z-A')}</option>
        </select>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Staff Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          <p className="mt-2 text-gray-500">{t('admin.staff.loading', 'Loading staff...')}</p>
        </div>
      ) : staffList.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500">{t('admin.staff.noStaff', 'No staff members found')}</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.staff.staffMember', 'Staff Member')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.staff.contact', 'Contact')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.staff.role', 'Role')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.staff.status', 'Status')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.staff.location', 'Location')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.staff.actions', 'Actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {staffList.map((staffMember) => (
                    <tr key={staffMember.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                            <span className="text-emerald-600 font-medium">
                              {getFullName(staffMember)[0]?.toUpperCase() || staffMember.email[0].toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {getFullName(staffMember)}
                            </div>
                            <div className="text-sm text-gray-500">{staffMember.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{staffMember.phone || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {staffMember.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            staffMember.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {staffMember.isActive ? t('admin.staff.active', 'Active') : t('admin.staff.inactive', 'Inactive')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {staffMember.location?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {currentStaff?.role === 'SUPER_ADMIN' || currentStaff?.role === 'LOCATION_MANAGER' ? (
                          <>
                            <button
                              onClick={() => handleEdit(staffMember)}
                              className="text-emerald-600 hover:text-emerald-900 mr-4"
                            >
                              {t('admin.staff.edit', 'Edit')}
                            </button>
                            {currentStaff?.role === 'SUPER_ADMIN' && staffMember.id !== currentStaff?.id && (
                              <button
                                onClick={() => handleDelete(staffMember.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                {t('admin.staff.delete', 'Deactivate')}
                              </button>
                            )}
                          </>
                        ) : (
                          <span className="text-gray-400">{t('admin.staff.noPermission', 'No permission')}</span>
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
              {t('admin.staff.showing', 'Showing {{start}} to {{end}} of {{total}} staff', {
                start: staffList.length > 0 ? (page - 1) * limit + 1 : 0,
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
                {t('admin.staff.previous', 'Previous')}
              </button>
              <span className="px-4 py-2 text-sm text-gray-700">
                {t('admin.staff.page', 'Page {{current}} of {{total}}', { current: page, total: totalPages || 1 })}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                {t('admin.staff.next', 'Next')}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Staff Modal */}
      {isModalOpen && (
        <StaffModal
          staff={selectedStaff}
          isAddMode={isAddMode}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
};

// Staff Modal Component
interface StaffModalProps {
  staff: StaffMember | null;
  isAddMode: boolean;
  onClose: () => void;
}

const StaffModal = ({ staff, isAddMode, onClose }: StaffModalProps) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<CreateStaffData | UpdateStaffData>({
    email: staff?.email || '',
    password: '',
    phone: staff?.phone || '',
    firstName: staff?.firstName || '',
    lastName: staff?.lastName || '',
    role: staff?.role || 'CUSTOMER_SUPPORT',
    locationId: staff?.locationId || '',
    isActive: staff?.isActive ?? true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roleOptions: StaffRole[] = ['SUPER_ADMIN', 'LOCATION_MANAGER', 'CHEF', 'DELIVERY_DRIVER', 'CUSTOMER_SUPPORT', 'NUTRITIONIST'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isAddMode) {
        if (!formData.password) {
          setError(t('admin.staff.passwordRequired', 'Password is required'));
          setLoading(false);
          return;
        }
        await staffApi.createStaff(formData as CreateStaffData);
      } else {
        const updateData: UpdateStaffData = { ...formData };
        if (!updateData.password) {
          delete updateData.password; // Don't update password if not provided
        }
        await staffApi.updateStaff(staff!.id, updateData);
      }
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || t('admin.staff.saveError', 'Failed to save staff member'));
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
              {isAddMode ? t('admin.staff.addStaff', 'Add Staff') : t('admin.staff.editStaff', 'Edit Staff')}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth.firstName')} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth.lastName')} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.email')} *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.password')} {isAddMode ? '*' : `(${t('admin.staff.optional', 'Optional')})`}
              </label>
              <input
                type="password"
                required={isAddMode}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder={isAddMode ? '' : t('admin.staff.leaveBlank', 'Leave blank to keep current password')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.phone')} ({t('common.optional')})
              </label>
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('admin.staff.role', 'Role')} *
              </label>
              <select
                required
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as StaffRole })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                {roleOptions.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('admin.staff.location', 'Location')} ({t('common.optional')})
              </label>
              <input
                type="text"
                value={formData.locationId || ''}
                onChange={(e) => setFormData({ ...formData, locationId: e.target.value || undefined })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder={t('admin.staff.locationPlaceholder', 'Location ID')}
              />
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive ?? true}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">{t('admin.staff.active', 'Active')}</span>
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
