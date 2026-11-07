import { useEffect, useState } from 'react';
import { StaffLayout } from '../../layout/stafflayouts';
import { getMyTransportRequests } from '../../api/transportrequests';
import { approveRequest, rejectRequest } from '../../api/supervisor';
import { Button } from '../../components/button';
import { Loader2, CheckCircle, XCircle, ShieldAlert, X, Eye } from 'lucide-react';
import { formatTime } from '../../utils/time';

const statusColors: Record<string, string> = {
  pending:      'bg-yellow-100 text-yellow-700',
  under_review: 'bg-orange-100 text-orange-700',
  approved:     'bg-green-100 text-green-700',
  rejected:     'bg-red-100 text-red-700',
  assigned:     'bg-blue-100 text-blue-700',
  completed:    'bg-gray-100 text-gray-600',
  cancelled:    'bg-red-50 text-red-400',
};

const DetailRow = ({ label, value }: { label: string; value: any }) => (
  <div className="flex flex-col gap-0.5">
    <p className="text-xs text-gray-400">{label}</p>
    <p className="text-sm font-medium text-gray-800">{value || '—'}</p>
  </div>
);

export const SupervisorRequests = () => {
  const [requests, setRequests]               = useState<any[]>([]);
  const [loading, setLoading]                 = useState(true);
  const [confirmApprove, setConfirmApprove]   = useState<any | null>(null);
  const [confirmReject, setConfirmReject]     = useState<any | null>(null);
  const [detailModal, setDetailModal]         = useState<any | null>(null);
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
                    <th className="px-6 py-3 text-left font-medium">Date</th>
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
                      <td className="px-6 py-4 text-gray-500">{req.required_date}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[req.status] ?? 'bg-gray-100 text-gray-500'}`}>
                          {req.status?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setDetailModal(req)}
                            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 font-medium transition-colors"
                          >
                            <Eye size={13} /> View
                          </button>
                          {reviewable(req.status) && (
                            <>
                              <button
                                onClick={() => setConfirmApprove(req)}
                                className="flex items-center gap-1 text-xs text-green-600 hover:text-green-800 font-medium transition-colors"
                              >
                                <CheckCircle size={13} /> Approve
                              </button>
                              <button
                                onClick={() => { setConfirmReject(req); setRejectionReason(''); setApiError(''); }}
                                className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
                              >
                                <XCircle size={13} /> Reject
                              </button>
                            </>
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

            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
              <DetailRow label="Pickup Location" value={detailModal.pickup_location} />
              <DetailRow label="Destination" value={detailModal.destination} />
              <DetailRow label="Date" value={detailModal.required_date} />
              <DetailRow label="Time" value={`${formatTime(detailModal.required_from_time)} – ${formatTime(detailModal.required_to_time)}`} />
              <DetailRow label="Working Hours" value={detailModal.working_hours ? 'Yes' : 'No'} />
              <DetailRow label="Service Type" value={detailModal.service_type} />
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
              <DetailRow label="Requested By" value={
                detailModal.requester
                  ? `${detailModal.requester.first_name} ${detailModal.requester.last_name}`
                  : '—'
              } />
              <DetailRow label="Department" value={detailModal.department?.name ?? detailModal.department?.code} />
              <DetailRow label="Phone" value={detailModal.telephone_extension} />
              {detailModal.passenger_count && (
                <DetailRow label="No. of People" value={detailModal.passenger_count} />
              )}
              <DetailRow label="Purpose" value={detailModal.purpose} />
            </div>

            {detailModal.reviewed_by && (
              <div className="p-4 bg-gray-50 rounded-xl space-y-3">
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

            <div className="flex gap-3">
              {reviewable(detailModal.status) && (
                <>
                  <Button fullWidth onClick={() => { setDetailModal(null); setConfirmApprove(detailModal); }}>
                    Approve
                  </Button>
                  <Button variant="danger" fullWidth onClick={() => { setDetailModal(null); setConfirmReject(detailModal); setRejectionReason(''); }}>
                    Reject
                  </Button>
                </>
              )}
              <Button variant="secondary" fullWidth onClick={() => setDetailModal(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Approve Modal ── */}
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

      {/* ── Reject Modal ── */}
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