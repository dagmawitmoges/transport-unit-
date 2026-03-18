import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { StaffLayout } from '../../layout/stafflayouts';
import { createTransportRequest } from '../../api/transportrequests';
import { transportRequestSchema, type TransportRequestFormData } from '../../schemas/transportRequestSchema';
import { Input } from '../../components/input';
import { Button } from '../../components/button';
import { Loader2 } from 'lucide-react';

export const CreateRequest = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<TransportRequestFormData>({
    resolver: zodResolver(transportRequestSchema),
    defaultValues: {
      working_hours: true,
      service_type: 'passenger',
    },
  });

  const serviceType = watch('service_type');

  const onSubmit = async (data: TransportRequestFormData) => {
    setSubmitting(true);
    setApiError('');
    try {
      await createTransportRequest(data);
      navigate('/staff/requests');
    } catch (err: any) {
      const msg =
        err.response?.data?.errors?.join(', ') ||
        err.response?.data?.error ||
        'Failed to submit request.';
      setApiError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <StaffLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800">New Transport Request</h2>
          <p className="text-sm text-gray-500 mt-1">Fill in the details for your transport request</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            {/* Originator Office */}
            <Input
              label="Originator Office"
              placeholder="e.g. HR Department"
              error={errors.originator_office?.message}
              {...register('originator_office')}
            />

            {/* Telephone Extension */}
            <Input
              label="Telephone Extension"
              placeholder="e.g. 1234"
              error={errors.telephone_extension?.message}
              {...register('telephone_extension')}
            />

            {/* Date */}
            <Input
              label="Required Date"
              type="date"
              error={errors.required_date?.message}
              {...register('required_date')}
            />

            {/* Time */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="From Time"
                type="time"
                error={errors.required_from_time?.message}
                {...register('required_from_time')}
              />
              <Input
                label="To Time"
                type="time"
                error={errors.required_to_time?.message}
                {...register('required_to_time')}
              />
            </div>

            {/* Working Hours */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="working_hours"
                className="w-4 h-4 rounded accent-blue-600"
                {...register('working_hours')}
              />
              <label htmlFor="working_hours" className="text-sm font-medium text-gray-700">
                During working hours
              </label>
            </div>

            {/* Destination */}
            <Input
              label="Destination"
              placeholder="e.g. Addis Ababa Airport"
              error={errors.destination?.message}
              {...register('destination')}
            />

            {/* Purpose */}
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Purpose</label>
              <textarea
                rows={3}
                placeholder="Describe the purpose of this trip..."
                className={`w-full px-4 py-2.5 bg-white/70 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm resize-none ${errors.purpose ? 'border-red-400' : ''}`}
                {...register('purpose')}
              />
              {errors.purpose && <p className="mt-1 text-sm text-red-500">{errors.purpose.message}</p>}
            </div>

            {/* Service Type */}
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Service Type</label>
              <select
                className={`w-full px-4 py-2.5 bg-white/70 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm ${errors.service_type ? 'border-red-400' : ''}`}
                {...register('service_type')}
              >
                <option value="passenger">Passenger</option>
                <option value="pickup">Pickup</option>
              </select>
              {errors.service_type && <p className="mt-1 text-sm text-red-500">{errors.service_type.message}</p>}
            </div>

            {/* Passenger Count (conditional) */}
            {serviceType === 'passenger' && (
              <Input
                label="Passenger Count"
                type="number"
                min={1}
                placeholder="e.g. 3"
                error={errors.passenger_count?.message}
                {...register('passenger_count', { valueAsNumber: true })}
              />
            )}

            {apiError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
                {apiError}
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <Button type="button" variant="secondary" fullWidth onClick={() => navigate('/staff/dashboard')}>
                Cancel
              </Button>
              <Button type="submit" fullWidth disabled={submitting}>
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={16} className="animate-spin" /> Submitting...
                  </span>
                ) : (
                  'Submit Request'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </StaffLayout>
  );
};