import { useEffect, useState } from 'react';
import { StaffLayout } from '../../layout/stafflayouts';
import { getMyTransportRequests } from '../../api/transportrequests';
import { approveRequest, rejectRequest } from '../../api/supervisor';
import { Button } from '../../components/button';
import { Loader2, CheckCircle, XCircle, ShieldAlert } from 'lucide-react';

const statusColors: Record<string, string> = {
  pending:      'bg-yellow-100 text-yellow-700',
  under_review: 'bg-orange-100 text-orange-700',
  approved:     'bg-green-100 text-green-700',
  rejected:     'bg-red-100 text-red-700',
  assigned:     'bg-blue-100 text-blue-700',
  completed:    'bg-gray-100 text-gray-600',
  cancelled:    'bg-red-50 text-red-400',
};

const formatTime = (iso: string) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const SupervisorRequests = () => {
  const [requests, setRequests]               = useState<any[]>([]);
  const [loading, setLoading]                 = useState(true);
  const [confirmApprove, setConfirmApprove]   = useState<any | null>(null);
  const [confirmReject, setConfirmReject]     = useState<any | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing]           = useState(false);
  const [apiError, setApiError]               = useState('');

  const fetchRequests = async () => {
    setLoading(true);
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

  const handleApprove = async () => {
    if (!confirmApprove) return;
    setProcessing(true);
    setApiError('');
    try {
      await approveRequest(confirmApprove.id);
      setConfirmApprove(null);
      fetchRequests();
    } catch (err: any) {
      setApiError(err.response?.data?.error || 'Failed to approve.');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!confirmReject || !rejectionReason.trim()) return;
    setProcessing(true);
    setApiError('');
    try {
      await rejectRequest(confirmReject.id, rejectionReason);
      setConfirmReject(null);
      setRejectionReason('');
      fetchRequests();
    } catch (err: any) {
      setApiError(err.response?.data?.error || 'Failed to reject.');
    } finally {
      setProcessing(false);
    }
  };

  const reviewable = (status: string) => status === 'pending' || status === 'under_review';

  return (
    <StaffLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Transport Requests</h2>
          <p className="text-sm text-gray-500 mt-1">Review and approve requests from your department</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={28} className="animate-spin text-blue-500" />
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-20 text-gray-400 text-sm">
              No requests found for your department.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium">ID</th>
                    <th className="px-6 py-3 text-left font-medium">Requester</th>
                    <th className="px-6 py-3 text-left font-medium">Department</th>
                    <th className="px-6 py-3 text-left font-medium">Destination</th>
                    <th className="px-6 py-3 text-left font-medium">Purpose</th>
                    <th className="px-6 py-3 text-left font-medium">Date</th>
                    <th className="px-6 py-3 text-left font-medium">Time</th>
                    <th className="px-6 py-3 text-left font-medium">Status</th>
                    <th className="px-6 py-3 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {requests.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-gray-500">#{req.id}</td>
                      <td className="px-6 py-4 font-medium text-gray-800">
                        {req.requester ? `${req.requester.first_name} ${req.requester.last_name}` : '—'}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {req.department?.name ?? req.department?.code ?? '—'}
                      </td>
                      <td className="px-6 py-4 text-gray-800">{req.destination}</td>
                      <td className="px-6 py-4 text-gray-500 max-w-xs truncate">{req.purpose}</td>
                      <td className="px-6 py-4 text-gray-500">{req.required_date}</td>
                      <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                        {formatTime(req.required_from_time)} – {formatTime(req.required_to_time)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[req.status] ?? 'bg-gray-100 text-gray-500'}`}>
                          {req.status?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {reviewable(req.status) && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setConfirmApprove(req)}
                              className="flex items-center gap-1 text-xs text-green-600 hover:text-green-800 font-medium transition-colors"
                            >
                              <CheckCircle size={14} /> Approve
                            </button>
                            <span className="text-gray-300">|</span>
                            <button
                              onClick={() => { setConfirmReject(req); setRejectionReason(''); setApiError(''); }}
                              className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
                            >
                              <XCircle size={14} /> Reject
                            </button>
                          </div>
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

      {/* Approve Modal */}
      {confirmApprove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-xl">
                <CheckCircle size={20} className="text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Approve Request</h3>
                <p className="text-sm text-gray-500">This will approve the transport request.</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Approve request to <span className="font-semibold">{confirmApprove.destination}</span>?
            </p>
            {apiError && <p className="text-sm text-red-500 bg-red-50 p-2 rounded-lg">{apiError}</p>}
            <div className="flex gap-3">
              <Button variant="secondary" fullWidth onClick={() => setConfirmApprove(null)}>Cancel</Button>
              <Button fullWidth disabled={processing} onClick={handleApprove}>
                {processing ? <span className="flex items-center justify-center gap-2"><Loader2 size={16} className="animate-spin" /> Approving...</span> : 'Approve'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {confirmReject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-xl">
                <ShieldAlert size={20} className="text-red-500" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Reject Request</h3>
                <p className="text-sm text-gray-500">Please provide a reason.</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Rejecting request to <span className="font-semibold">{confirmReject.destination}</span>.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Rejection Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why this request is being rejected..."
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400 text-sm resize-none"
              />
              {!rejectionReason.trim() && (
                <p className="mt-1 text-xs text-red-500">Rejection reason is required.</p>
              )}
            </div>
            {apiError && <p className="text-sm text-red-500 bg-red-50 p-2 rounded-lg">{apiError}</p>}
            <div className="flex gap-3">
              <Button variant="secondary" fullWidth onClick={() => setConfirmReject(null)}>Cancel</Button>
              <Button variant="danger" fullWidth disabled={processing || !rejectionReason.trim()} onClick={handleReject}>
                {processing ? <span className="flex items-center justify-center gap-2"><Loader2 size={16} className="animate-spin" /> Rejecting...</span> : 'Reject'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </StaffLayout>
  );
};