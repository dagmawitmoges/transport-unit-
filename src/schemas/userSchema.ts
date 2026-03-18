import { z } from 'zod';

export const createUserSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  role: z.string().min(1, 'Role is required'),
  department_id: z.string().min(1, 'Department is required'),
  telephone_extension: z.string().optional(),
});

export type CreateUserFormData = z.infer<typeof createUserSchema>;