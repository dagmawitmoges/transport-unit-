import { z } from 'zod';

export const transportRequestSchema = z
  .object({
    originator_office: z.string().min(1, 'Originator office is required'),
    telephone_extension: z.string().min(1, 'Telephone extension is required'),
    required_date: z.string().min(1, 'Required date is required'),
    required_from_time: z.string().min(1, 'From time is required'),
    required_to_time: z.string().min(1, 'To time is required'),
    working_hours: z.boolean(),
    destination: z.string().min(1, 'Destination is required'),
    purpose: z.string().min(1, 'Purpose is required'),
    service_type: z.enum(['passenger', 'pickup']),
    passenger_count: z.number().optional(),
  })
  .refine(
    (data) => data.required_to_time > data.required_from_time,
    {
      message: 'End time must be after start time',
      path: ['required_to_time'],
    }
  )
  .refine(
    (data) =>
      data.service_type !== 'passenger' ||
      (data.passenger_count !== undefined && data.passenger_count > 0),
    {
      message: 'Passenger count must be greater than 0',
      path: ['passenger_count'],
    }
  );

export type TransportRequestFormData = z.infer<typeof transportRequestSchema>;