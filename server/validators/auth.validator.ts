import { z } from 'zod';

export const RegisterSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Invalid email address format')
    .toLowerCase()
    .trim(),
  password: z
    .string({ required_error: 'Password is required' })
    .min(10, 'Password must be at least 10 characters long')
    .max(128, 'Password cannot exceed 128 characters'),
  displayName: z
    .string({ required_error: 'Display name is required' })
    .min(2, 'Display name must be at least 2 characters')
    .max(100, 'Display name cannot exceed 100 characters')
    .trim(),
  campusId: z
    .string({ required_error: 'Campus/Student ID is required' })
    .min(3, 'Campus ID must be at least 3 characters')
    .max(50, 'Campus ID cannot exceed 50 characters')
    .trim(),
  role: z.enum(['Student', 'Staff', 'Administrator'], {
    required_error: 'Role selection is required',
  }).default('Student'),
  department: z.string().optional(),
  phoneNumber: z.string().optional(),
});

export const LoginSchema = z.object({
  identifier: z
    .string({ required_error: 'Email or Student ID is required' })
    .min(3, 'Identifier must be at least 3 characters')
    .trim(),
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password cannot be empty'),
});

export const UpdatePasswordSchema = z
  .object({
    currentPassword: z
      .string({ required_error: 'Current password is required' })
      .min(1, 'Current password is required'),
    newPassword: z
      .string({ required_error: 'New password is required' })
      .min(10, 'New password must be at least 10 characters long')
      .max(128, 'New password cannot exceed 128 characters'),
    confirmPassword: z
      .string({ required_error: 'Confirm password is required' })
      .min(1, 'Confirm password is required'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'New password and confirm password do not match',
    path: ['confirmPassword'],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  });

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type UpdatePasswordInput = z.infer<typeof UpdatePasswordSchema>;
