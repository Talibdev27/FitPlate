import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ordersApi, Order, GetOrdersParams } from '../../api/orders';

export const Orders = () => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('today');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const staffToken = localStorage.getItem('staffAccessToken');
      if (!staffToken) {
        setError('Authentication required. Please log in again.');
        return;
      }

      // Calculate date range based on filter
      let dateFrom: string | undefined;
      let dateTo: string | undefined;
      const today = new Date();
      
      if (dateFilter === 'today') {
        dateFrom = today.toISOString().split('T')[0];
        dateTo = today.toISOString().split('T')[0];
      } else if (dateFilter === 'week') {
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        dateFrom = weekStart.toISOString().split('T')[0];
        dateTo = today.toISOString().split('T')[0];
      } else if (dateFilter === 'month') {
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        dateFrom = monthStart.toISOString().split('T')[0];
        dateTo = today.toISOString().split('T')[0];
      }
      
      const params: GetOrdersParams = {
        page,
        limit,
        search: search || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
        dateFrom,
        dateTo,
        sortBy,
        sortOrder,
      };
      
      const response = await ordersApi.getOrders(params);
      
      if (response.success && response.data) {
        setOrders(response.data.orders);
        setTotal(response.data.pagination.total);
        setTotalPages(response.data.pagination.totalPages);
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('Your session has expired. Please refresh the page or log in again.');
      } else {
        setError(err.response?.data?.error?.message || 'Failed to load orders');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, limit, search, statusFilter, dateFilter, sortBy, sortOrder]);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await ordersApi.updateOrderStatus(orderId, newStatus);
      await fetchOrders();
      if (selectedOrder?.id === orderId) {
        const updatedOrder = await ordersApi.getOrderById(orderId);
        setSelectedOrder(updatedOrder.data || null);
      }
    } catch (err: any) {
      alert(err.response?.data?.error?.message || t('admin.orders.updateError', 'Failed to update order status'));
    }
  };

  const handleView = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const getStatusBadge = (status: string) => {
    const statusClasses: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      PREPARING: 'bg-blue-100 text-blue-800',
      READY: 'bg-purple-100 text-purple-800',
      OUT_FOR_DELIVERY: 'bg-indigo-100 text-indigo-800',
      DELIVERED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };

    return (
      <span
        className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
          statusClasses[status] || statusClasses.PENDING
        }`}
      >
        {status}
      </span>
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ', {
      style: 'currency',
      currency: 'UZS',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const statusOptions = ['PENDING', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('admin.orders.title', 'Orders')}</h1>
        <p className="mt-1 text-sm text-gray-500">{t('admin.orders.subtitle', 'Manage and track all orders')}</p>
      </div>

      {/* Filters */}
      <div className="mb-4 space-y-4 sm:flex sm:items-center sm:space-y-0 sm:space-x-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder={t('admin.orders.searchPlaceholder', 'Search by order ID, customer email...')}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        >
          <option value="all">{t('admin.orders.allStatus', 'All Status')}</option>
          {statusOptions.map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
        <select
          value={dateFilter}
          onChange={(e) => {
            setDateFilter(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        >
          <option value="all">{t('admin.orders.allDates', 'All Dates')}</option>
          <option value="today">{t('admin.orders.today', 'Today')}</option>
          <option value="week">{t('admin.orders.thisWeek', 'This Week')}</option>
          <option value="month">{t('admin.orders.thisMonth', 'This Month')}</option>
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
          <option value="createdAt-desc">{t('admin.orders.newestFirst', 'Newest First')}</option>
          <option value="createdAt-asc">{t('admin.orders.oldestFirst', 'Oldest First')}</option>
          <option value="deliveryDate-asc">{t('admin.orders.deliveryDateAsc', 'Delivery Date: Earliest')}</option>
          <option value="deliveryDate-desc">{t('admin.orders.deliveryDateDesc', 'Delivery Date: Latest')}</option>
        </select>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Orders Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          <p className="mt-2 text-gray-500">{t('admin.orders.loading', 'Loading orders...')}</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500">{t('admin.orders.noOrders', 'No orders found')}</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.orders.orderId', 'Order ID')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.orders.customer', 'Customer')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.orders.deliveryDate', 'Delivery Date')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.orders.status', 'Status')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.orders.total', 'Total')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.orders.actions', 'Actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => {
                    const customerName = order.user.firstName && order.user.lastName
                      ? `${order.user.firstName} ${order.user.lastName}`
                      : order.user.email;

                    return (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-mono text-gray-900">
                            {order.id.substring(0, 8)}...
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{customerName}</div>
                          <div className="text-sm text-gray-500">{order.user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(order.deliveryDate).toLocaleDateString()} {new Date(order.deliveryDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(order.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          {formatPrice(order.totalPrice)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex flex-col space-y-1">
                            <button
                              onClick={() => handleView(order)}
                              className="text-emerald-600 hover:text-emerald-900"
                            >
                              {t('admin.orders.view', 'View')}
                            </button>
                            {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                              <select
                                value={order.status}
                                onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                                className="text-xs border border-gray-300 rounded px-2 py-1"
                              >
                                {statusOptions.map((status) => (
                                  <option key={status} value={status}>{status}</option>
                                ))}
                              </select>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              {t('admin.orders.showing', 'Showing {{start}} to {{end}} of {{total}} orders', {
                start: orders.length > 0 ? (page - 1) * limit + 1 : 0,
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
                {t('admin.orders.previous', 'Previous')}
              </button>
              <span className="px-4 py-2 text-sm text-gray-700">
                {t('admin.orders.page', 'Page {{current}} of {{total}}', { current: page, total: totalPages || 1 })}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                {t('admin.orders.next', 'Next')}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Order Detail Modal */}
      {isModalOpen && selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={handleModalClose}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
};

// Order Detail Modal
interface OrderDetailModalProps {
  order: Order;
  onClose: () => void;
  onStatusUpdate: (orderId: string, status: string) => void;
}

const OrderDetailModal = ({ order, onClose, onStatusUpdate }: OrderDetailModalProps) => {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language as 'uz' | 'ru' | 'en';

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ', {
      style: 'currency',
      currency: 'UZS',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getMealName = (name: any) => {
    if (typeof name === 'object') {
      return name[currentLanguage] || name.en || 'Unknown Meal';
    }
    return name || 'Unknown Meal';
  };

  const statusOptions = ['PENDING', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {t('admin.orders.orderDetails', 'Order Details')}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="space-y-6">
            {/* Order Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">{t('admin.orders.orderId', 'Order ID')}</p>
                <p className="font-mono text-sm">{order.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('admin.orders.status', 'Status')}</p>
                <select
                  value={order.status}
                  onChange={(e) => onStatusUpdate(order.id, e.target.value)}
                  className="mt-1 px-3 py-1 border border-gray-300 rounded-lg text-sm"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('admin.orders.deliveryDate', 'Delivery Date')}</p>
                <p className="text-sm">{new Date(order.deliveryDate).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('admin.orders.total', 'Total')}</p>
                <p className="text-lg font-bold text-emerald-600">{formatPrice(order.totalPrice)}</p>
              </div>
            </div>

            {/* Customer Info */}
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-900 mb-3">{t('admin.orders.customerInfo', 'Customer Information')}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">{t('admin.orders.name', 'Name')}</p>
                  <p className="text-sm">
                    {order.user.firstName && order.user.lastName
                      ? `${order.user.firstName} ${order.user.lastName}`
                      : t('admin.orders.notProvided', 'Not provided')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('auth.email')}</p>
                  <p className="text-sm">{order.user.email}</p>
                </div>
                {order.user.phone && (
                  <div>
                    <p className="text-sm text-gray-600">{t('auth.phone')}</p>
                    <p className="text-sm">{order.user.phone}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Delivery Info */}
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-900 mb-3">{t('admin.orders.deliveryInfo', 'Delivery Information')}</h3>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-600">{t('admin.orders.address', 'Address')}</p>
                  <p className="text-sm">{order.deliveryAddress}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('admin.orders.location', 'Location')}</p>
                  <p className="text-sm">{order.location.name} - {order.location.city}</p>
                </div>
                {order.driver && (
                  <div>
                    <p className="text-sm text-gray-600">{t('admin.orders.driver', 'Driver')}</p>
                    <p className="text-sm">{order.driver.firstName} {order.driver.lastName}</p>
                  </div>
                )}
                {order.deliveryNotes && (
                  <div>
                    <p className="text-sm text-gray-600">{t('admin.orders.notes', 'Notes')}</p>
                    <p className="text-sm">{order.deliveryNotes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-900 mb-3">{t('admin.orders.items', 'Order Items')}</h3>
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{getMealName(item.meal.name)}</p>
                      <p className="text-sm text-gray-600">
                        {t('admin.orders.quantity', 'Quantity')}: {item.quantity} × {formatPrice(item.price)}
                      </p>
                    </div>
                    <p className="font-semibold text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {t('common.close', 'Close')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
