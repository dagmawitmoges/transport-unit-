import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { StaffLayout } from '../../layout/stafflayouts';
import { createTransportRequest } from '../../api/transportrequests';
import { getDepartments } from '../../api/users';
import { useAuth } from '../../auth/authContext';
import { Button } from '../../components/button';
import { Loader2 } from 'lucide-react';

const today = new Date().toISOString().split('T')[0];

const schema = z
  .object({
    telephone_extension: z.string().min(1, 'Phone number is required'),
    department_id:       z.string().min(1, 'Department is required'),
    required_date:       z.string().min(1, 'Required date is required').refine(
      (d) => d >= today,
      { message: 'Date cannot be in the past' }
    ),
    required_from_time:  z.string().min(1, 'From time is required'),
    required_to_time:    z.string().min(1, 'To time is required'),
    working_hours:       z.boolean(),
    pickup_location:     z.string().min(1, 'Pickup location is required'),
    destination:         z.string().min(1, 'Destination is required'),
    purpose:             z.string().min(3, 'Purpose is required'),
    service_type:        z.enum(['passenger', 'pickup']),
    passenger_count:     z.number().optional(),
  })
  .refine((d) => d.required_to_time > d.required_from_time, {
    message: 'End time must be after start time',
    path: ['required_to_time'],
  })
  .refine(
    (d) => d.service_type !== 'passenger' || (d.passenger_count !== undefined && d.passenger_count > 0),
    { message: 'No. of people must be greater than 0', path: ['passenger_count'] }
  );

type FormData = z.infer<typeof schema>;

export const CreateRequest = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [submitting, setSubmitting]   = useState(false);
  const [apiError, setApiError]       = useState('');
  const [departments, setDepartments] = useState<any[]>([]);

  useEffect(() => {
    getDepartments().then(setDepartments).catch(console.error);
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      working_hours: true,
      service_type: 'passenger',
      telephone_extension: '',
    },
  });

  const serviceType = watch('service_type');

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    setApiError('');
    try {
      const selectedDept = departments.find((d) => String(d.id) === String(data.department_id));
      const payload = {
        ...data,
        originator_office: selectedDept?.name ?? selectedDept?.code ?? data.department_id,
      };
      await createTransportRequest(payload);
      navigate('/staff/requests');
    } catch (err: any) {
      setApiError(
        err.response?.data?.errors?.join(', ') ||
        err.response?.data?.error ||
        'Failed to submit request.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <StaffLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">New Transport Request</h2>
          <p className="text-sm text-gray-500 mt-1">Fill in the details for your transport request</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            {/* Requested By — read only */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Requested By</label>
              <div className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600">
                {user ? `${user.first_name} ${user.last_name}` : '—'}
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. +251911234567"
                className={`w-full px-4 py-2.5 bg-white/70 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm ${errors.telephone_extension ? 'border-red-400' : 'border-gray-200'}`}
                {...register('telephone_extension')}
              />
              {errors.telephone_extension && (
                <p className="mt-1 text-sm text-red-500">{errors.telephone_extension.message}</p>
              )}
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Department <span className="text-red-500">*</span>
              </label>
              <select
                className={`w-full px-4 py-2.5 bg-white/70 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm ${errors.department_id ? 'border-red-400' : 'border-gray-200'}`}
                {...register('department_id')}
              >
                <option value="">Select your department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name ?? d.code}
                  </option>
                ))}
              </select>
              {errors.department_id && (
                <p className="mt-1 text-sm text-red-500">{errors.department_id.message}</p>
              )}
            </div>

            {/* Required Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Required Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                min={today}
                className={`w-full px-4 py-2.5 bg-white/70 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm ${errors.required_date ? 'border-red-400' : 'border-gray-200'}`}
                {...register('required_date')}
              />
              {errors.required_date && (
                <p className="mt-1 text-sm text-red-500">{errors.required_date.message}</p>
              )}
            </div>

            {/* Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  From Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  className={`w-full px-4 py-2.5 bg-white/70 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm ${errors.required_from_time ? 'border-red-400' : 'border-gray-200'}`}
                  {...register('required_from_time')}
                />
                {errors.required_from_time && (
                  <p className="mt-1 text-sm text-red-500">{errors.required_from_time.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  To Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  className={`w-full px-4 py-2.5 bg-white/70 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm ${errors.required_to_time ? 'border-red-400' : 'border-gray-200'}`}
                  {...register('required_to_time')}
                />
                {errors.required_to_time && (
                  <p className="mt-1 text-sm text-red-500">{errors.required_to_time.message}</p>
                )}
              </div>
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

            {/* Pickup Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Pickup Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. AU HQ Main Entrance"
                className={`w-full px-4 py-2.5 bg-white/70 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm ${errors.pickup_location ? 'border-red-400' : 'border-gray-200'}`}
                {...register('pickup_location')}
              />
              {errors.pickup_location && (
                <p className="mt-1 text-sm text-red-500">{errors.pickup_location.message}</p>
              )}
            </div>

            {/* Destination */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Destination <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Addis Ababa Airport"
                className={`w-full px-4 py-2.5 bg-white/70 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm ${errors.destination ? 'border-red-400' : 'border-gray-200'}`}
                {...register('destination')}
              />
              {errors.destination && (
                <p className="mt-1 text-sm text-red-500">{errors.destination.message}</p>
              )}
            </div>

            {/* Purpose */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Purpose <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="Describe the purpose of this trip..."
                className={`w-full px-4 py-2.5 bg-white/70 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm resize-none ${errors.purpose ? 'border-red-400' : 'border-gray-200'}`}
                {...register('purpose')}
              />
              {errors.purpose && (
                <p className="mt-1 text-sm text-red-500">{errors.purpose.message}</p>
              )}
            </div>

            {/* Service Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Service Type <span className="text-red-500">*</span>
              </label>
              <select
                className={`w-full px-4 py-2.5 bg-white/70 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm ${errors.service_type ? 'border-red-400' : 'border-gray-200'}`}
                {...register('service_type')}
              >
                <option value="passenger">Passenger</option>
                <option value="pickup">Pickup</option>
              </select>
            </div>

            {/* No. of People */}
            {serviceType === 'passenger' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  No. of People <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  placeholder="e.g. 3"
                  className={`w-full px-4 py-2.5 bg-white/70 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm ${errors.passenger_count ? 'border-red-400' : 'border-gray-200'}`}
                  {...register('passenger_count', { valueAsNumber: true })}
                />
                {errors.passenger_count && (
                  <p className="mt-1 text-sm text-red-500">{errors.passenger_count.message}</p>
                )}
              </div>
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
                ) : 'Submit Request'}
              </Button>
            </div>

          </form>
        </div>
      </div>
    </StaffLayout>
  );
};