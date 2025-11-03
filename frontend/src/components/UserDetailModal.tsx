import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { User, usersApi, UpdateUserData } from '../api/users';
import { useStaffAuthStore } from '../store/staffAuthStore';

interface UserDetailModalProps {
  user: User;
  onClose: () => void;
}

export const UserDetailModal = ({ user, onClose }: UserDetailModalProps) => {
  const { staff } = useStaffAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateUserData>({
    defaultValues: user,
  });

  useEffect(() => {
    fetchUserDetails();
  }, [user.id]);

  const fetchUserDetails = async () => {
    try {
      const response = await usersApi.getUserById(user.id);
      if (response.success && response.data) {
        setUserDetails(response.data);
        reset(response.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load user details');
    }
  };

  const onSubmit = async (data: UpdateUserData) => {
    try {
      setLoading(true);
      setError(null);
      await usersApi.updateUser(user.id, data);
      setIsEditing(false);
      await fetchUserDetails(); // Refresh data
      alert('User updated successfully!');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  const currentUser = userDetails || user;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">User Details</h3>
              <div className="flex space-x-2">
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700"
                  >
                    Edit
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-500"
                >
                  ✕
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Basic Info */}
                <div className="col-span-2">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Basic Information</h4>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">First Name</label>
                  <input
                    {...register('firstName')}
                    disabled={!isEditing}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  <input
                    {...register('lastName')}
                    disabled={!isEditing}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    {...register('email', { required: 'Email is required' })}
                    type="email"
                    disabled={!isEditing}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-100"
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    {...register('phone')}
                    disabled={!isEditing}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Verified Status</label>
                  <select
                    {...register('isPhoneVerified')}
                    disabled={!isEditing}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-100"
                  >
                    <option value="true">Verified</option>
                    <option value="false">Unverified</option>
                  </select>
                </div>

                {/* Physical Stats */}
                <div className="col-span-2 mt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Physical Statistics</h4>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Age</label>
                  <input
                    {...register('age', { valueAsNumber: true })}
                    type="number"
                    disabled={!isEditing}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Gender</label>
                  <select
                    {...register('gender')}
                    disabled={!isEditing}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-100"
                  >
                    <option value="">Select...</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Current Weight (kg)</label>
                  <input
                    {...register('currentWeight', { valueAsNumber: true })}
                    type="number"
                    step="0.1"
                    disabled={!isEditing}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Height (cm)</label>
                  <input
                    {...register('height', { valueAsNumber: true })}
                    type="number"
                    disabled={!isEditing}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Target Weight (kg)</label>
                  <input
                    {...register('targetWeight', { valueAsNumber: true })}
                    type="number"
                    step="0.1"
                    disabled={!isEditing}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Goal</label>
                  <select
                    {...register('goal')}
                    disabled={!isEditing}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-100"
                  >
                    <option value="">Select...</option>
                    <option value="WEIGHT_LOSS">Weight Loss</option>
                    <option value="MUSCLE_GAIN">Muscle Gain</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="ATHLETIC_PERFORMANCE">Athletic Performance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Activity Level</label>
                  <select
                    {...register('activityLevel')}
                    disabled={!isEditing}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-100"
                  >
                    <option value="">Select...</option>
                    <option value="SEDENTARY">Sedentary</option>
                    <option value="LIGHTLY_ACTIVE">Lightly Active</option>
                    <option value="MODERATELY_ACTIVE">Moderately Active</option>
                    <option value="VERY_ACTIVE">Very Active</option>
                    <option value="EXTREMELY_ACTIVE">Extremely Active</option>
                  </select>
                </div>

                {/* Stats Display */}
                {!isEditing && (
                  <>
                    <div className="col-span-2 mt-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Activity</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="text-sm text-gray-500">Total Orders</div>
                          <div className="text-lg font-semibold">{currentUser._count?.orders || 0}</div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="text-sm text-gray-500">Total Subscriptions</div>
                          <div className="text-lg font-semibold">{currentUser._count?.subscriptions || 0}</div>
                        </div>
                      </div>
                    </div>

                    <div className="col-span-2">
                      <div className="text-sm text-gray-500">
                        Created: {new Date(currentUser.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        Updated: {new Date(currentUser.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {isEditing && (
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      reset(currentUser);
                      setError(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

