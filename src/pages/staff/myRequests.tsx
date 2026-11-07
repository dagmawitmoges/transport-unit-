import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StaffLayout } from '../../layout/stafflayouts';
import { getMyTransportRequests, cancelTransportRequest } from '../../api/transportrequests';
import { Button } from '../../components/button';
import { Loader2, PlusCircle, ShieldAlert, X } from 'lucide-react';

const statusColors: Record<string, string> = {
  pending:     'bg-yellow-100 text-yellow-700',
  approved:    'bg-green-100 text-green-700',
  rejected:    'bg-red-100 text-red-700',
  assigned:    'bg-blue-100 text-blue-700',
  in_progress: 'bg-orange-100 text-orange-700',
  completed:   'bg-gray-100 text-gray-600',
  cancelled:   'bg-red-50 text-red-400',
};

const DetailRow = ({ label, value }: { label: string; value: any }) => (
  <div className="flex flex-col gap-0.5">
    <p className="text-xs text-gray-400">{label}</p>
    <p className="text-sm font-medium text-gray-800">{value || '—'}</p>
  </div>
);

export const MyRequests = () => {
  const [requests, setRequests]           = useState<any[]>([]);
  const [loading, setLoading]             = useState(true);
  const [confirmCancel, setConfirmCancel] = useState<any | null>(null);
  const [detailModal, setDetailModal]     = useState<any | null>(null);
  const [cancelling, setCancelling]       = useState(false);
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

  useEffect(() => { fetchRequests(); }, []);

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
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">My Requests</h2>
            <p className="text-sm text-gray-500 mt-1">Track all your transport requests</p>
          </div>
          <button
            onClick={() => navigate('/staff/request')}
            className="flex items-center gap-2 px-4 py-2.5 bg-green-700 hover:bg-green-800 text-white text-sm font-medium rounded-xl transition-colors"
          >
            <PlusCircle size={16} />
            New Request
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={28} className="animate-spin text-green-600" />
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-20 space-y-3">
              <p className="text-gray-400 text-sm">No requests found.</p>
              <button onClick={() => navigate('/staff/request')} className="text-sm text-green-600 hover:underline">
                Create your first request
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium">Destination</th>
                    <th className="px-6 py-3 text-left font-medium">Department</th>
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
                      <td className="px-6 py-4 text-gray-500">{req.department?.name ?? req.department?.code ?? '—'}</td>
                      <td className="px-6 py-4 text-gray-500">{req.required_date}</td>
                      <td className="px-6 py-4 text-gray-500 capitalize">{req.service_type}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[req.status] ?? 'bg-gray-100 text-gray-500'}`}>
                          {req.status?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setDetailModal(req)}
                            className="text-xs text-green-600 hover:text-green-800 font-medium transition-colors"
                          >
                            View
                          </button>
                          {req.status === 'pending' && (
                            <button
                              onClick={() => setConfirmCancel(req)}
                              className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Detail Modal ── */}
      {detailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-5 max-h-[90vh] overflow-y-auto">

            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Request Detail</h3>
                <p className="text-sm text-gray-500">#{detailModal.id} · {detailModal.required_date}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[detailModal.status] ?? 'bg-gray-100 text-gray-500'}`}>
                  {detailModal.status?.replace(/_/g, ' ')}
                </span>
                <button onClick={() => setDetailModal(null)} className="p-1.5 rounded-lg hover:bg-gray-100">
                  <X size={18} className="text-gray-500" />
                </button>
              </div>
            </div>

            {/* Trip info */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
              <DetailRow label="Pickup Location" value={detailModal.pickup_location} />
              <DetailRow label="Destination" value={detailModal.destination} />
              <DetailRow
                label="Time"
                value={`${detailModal.required_from_time ?? '—'} – ${detailModal.required_to_time ?? '—'}`}
              />
              <DetailRow label="Working Hours" value={detailModal.working_hours ? 'Yes' : 'No'} />
            </div>

            {/* Request info */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
              <DetailRow label="Requested By" value={
                detailModal.requester
                  ? `${detailModal.requester.first_name} ${detailModal.requester.last_name}`
                  : '—'
              } />
              <DetailRow label="Department" value={detailModal.department?.name ?? detailModal.department?.code} />
              <DetailRow label="Phone" value={detailModal.telephone_extension} />
              <DetailRow label="Service Type" value={detailModal.service_type} />
              {detailModal.passenger_count && (
                <DetailRow label="No. of People" value={detailModal.passenger_count} />
              )}
              <DetailRow label="Purpose" value={detailModal.purpose} />
            </div>

            {/* Approval info */}
            {detailModal.reviewed_by && (
              <div className="p-4 bg-gray-50 rounded-xl space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase">Approval Info</p>
                <DetailRow
                  label="Approved / Rejected By"
                  value={`${detailModal.reviewed_by.first_name} ${detailModal.reviewed_by.last_name}`}
                />
                <DetailRow label="Reviewed At" value={
                  detailModal.reviewed_at
                    ? new Date(detailModal.reviewed_at).toLocaleString()
                    : '—'
                } />
                {detailModal.rejection_reason && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-xs text-red-500 font-medium">Rejection Reason</p>
                    <p className="text-sm text-red-700 mt-0.5">{detailModal.rejection_reason}</p>
                  </div>
                )}
              </div>
            )}

            <Button variant="secondary" fullWidth onClick={() => setDetailModal(null)}>Close</Button>
          </div>
        </div>
      )}

      {/* ── Cancel Confirm Modal ── */}
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
              Cancel request to <span className="font-semibold">{confirmCancel.destination}</span>?
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" fullWidth onClick={() => setConfirmCancel(null)}>Keep it</Button>
              <Button variant="danger" fullWidth disabled={cancelling} onClick={handleCancel}>
                {cancelling ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={16} className="animate-spin" /> Cancelling...
                  </span>
                ) : 'Yes, Cancel'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </StaffLayout>
  );
};