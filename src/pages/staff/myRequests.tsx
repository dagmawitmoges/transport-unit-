import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StaffLayout } from '../../layout/stafflayouts';
import { getMyTransportRequests, cancelTransportRequest } from '../../api/transportrequests';
import { Button } from '../../components/button';
import { Loader2, PlusCircle, ShieldAlert, X } from 'lucide-react';

const statusColors: Record<string, string> = {
  pending:   'bg-yellow-100 text-yellow-700',
  approved:  'bg-green-100 text-green-700',
  rejected:  'bg-red-100 text-red-700',
  assigned:  'bg-blue-100 text-blue-700',
  completed: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-50 text-red-400',
};

export const MyRequests = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmCancel, setConfirmCancel] = useState<any | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const navigate = useNavigate();

  const fetchRequests = async () => {
    try {
      const data = await getMyTransportRequests();
      setRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleCancel = async () => {
    if (!confirmCancel) return;
    setCancelling(true);
    try {
      await cancelTransportRequest(confirmCancel.id);
      setConfirmCancel(null);
      fetchRequests();
    } catch (err) {
      console.error(err);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <StaffLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">My Requests</h2>
            <p className="text-sm text-gray-500 mt-1">Track all your transport requests</p>
          </div>
          
          <button
            onClick={() => navigate('/staff/request')}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
          >
            <PlusCircle size={16} />
            New Request
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={28} className="animate-spin text-blue-500" />
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-20 space-y-3">
              <p className="text-gray-400 text-sm">No requests found.</p>
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
                    <th className="px-6 py-3 text-left font-medium">Service</th>
                    <th className="px-6 py-3 text-left font-medium">Status</th>
                    <th className="px-6 py-3 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {requests.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-800">{req.destination}</td>
                      <td className="px-6 py-4 text-gray-500 max-w-xs truncate">{req.purpose}</td>
                      <td className="px-6 py-4 text-gray-500">{req.required_date}</td>
                      <td className="px-6 py-4 text-gray-500 capitalize">{req.service_type}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[req.status] ?? 'bg-gray-100 text-gray-500'}`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {req.status === 'pending' && (
                          <button
                            onClick={() => setConfirmCancel(req)}
                            className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Confirm Cancel Modal */}
      {confirmCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-xl">
                <ShieldAlert size={20} className="text-red-500" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Cancel Request</h3>
                <p className="text-sm text-gray-500">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Are you sure you want to cancel the request to{' '}
              <span className="font-semibold">{confirmCancel.destination}</span>?
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" fullWidth onClick={() => setConfirmCancel(null)}>
                Keep it
              </Button>
              <Button variant="danger" fullWidth disabled={cancelling} onClick={handleCancel}>
                {cancelling ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={16} className="animate-spin" /> Cancelling...
                  </span>
                ) : (
                  'Yes, Cancel'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </StaffLayout>
  );
};