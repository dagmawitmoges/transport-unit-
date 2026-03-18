import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StaffLayout } from '../../layout/stafflayouts';
import { getMyTransportRequests } from '../../api/transportrequests';
import { FileText, Clock, CheckCircle, XCircle, PlusCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../auth/authContext';

const statusColors: Record<string, string> = {
  pending:   'bg-yellow-100 text-yellow-700',
  approved:  'bg-green-100 text-green-700',
  rejected:  'bg-red-100 text-red-700',
  assigned:  'bg-blue-100 text-blue-700',
  completed: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-50 text-red-400',
};

export const StaffDashboard = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getMyTransportRequests();
        setRequests(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const pending   = requests.filter((r) => r.status === 'pending').length;
  const approved  = requests.filter((r) => r.status === 'approved').length;
  const rejected  = requests.filter((r) => r.status === 'rejected').length;
  const { user } = useAuth();

  const stats = [
    { label: 'Total Requests', value: requests.length, icon: <FileText size={22} className="text-blue-600" />,   color: 'bg-blue-50' },
    { label: 'Pending',        value: pending,          icon: <Clock size={22} className="text-yellow-600" />,    color: 'bg-yellow-50' },
    { label: 'Approved',       value: approved,         icon: <CheckCircle size={22} className="text-green-600" />, color: 'bg-green-50' },
    { label: 'Rejected',       value: rejected,         icon: <XCircle size={22} className="text-red-500" />,     color: 'bg-red-50' },
  ];

  return (
    <StaffLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
            <p className="text-sm text-gray-500 mt-1">Your transport request overview</p>
          </div>

          {user?.role === 'requester' && (
  <button
    onClick={() => navigate('/staff/request')}
    className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
  >
    <PlusCircle size={16} />
    New Request
  </button>
)}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-5">
              <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${stat.color}`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                {loading ? (
                  <Loader2 size={20} className="animate-spin text-gray-400 mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Recent Requests */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-700">Recent Requests</h3>
            <button
              onClick={() => navigate('/staff/requests')}
              className="text-sm text-blue-600 hover:underline"
            >
              View all
            </button>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={28} className="animate-spin text-blue-500" />
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <p className="text-gray-400 text-sm">No requests yet.</p>
              <button
                onClick={() => navigate('/staff/request')}
                className="text-sm text-blue-600 hover:underline"
              >
                Create your first request
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium">Destination</th>
                    <th className="px-6 py-3 text-left font-medium">Purpose</th>
                    <th className="px-6 py-3 text-left font-medium">Date</th>
                    <th className="px-6 py-3 text-left font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {requests.slice(0, 5).map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-800">{req.destination}</td>
                      <td className="px-6 py-4 text-gray-500 max-w-xs truncate">{req.purpose}</td>
                      <td className="px-6 py-4 text-gray-500">{req.required_date}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[req.status] ?? 'bg-gray-100 text-gray-500'}`}>
                          {req.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </StaffLayout>
  );
};