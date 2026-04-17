import { z } from 'zod';
import { UI_TEXT } from '../config/ui-text';

export const loginSchema = z.object({
    email: z.string()
        .min(1, 'Email is required')
        .email('Invalid email address'),
    password: z.string()
        .min(1, 'Password is required')
        .min(8, 'Password must be at least 8 characters'),
});

export const registerSchema = z.object({
    email: z.string()
        .min(1, 'Email is required')
        .email('Invalid email address'),
    password: z.string()
        .min(1, 'Password is required')
        .min(8, 'Password must be at least 8 characters'),
    firstName: z.string()
        .min(1, 'First name is required'),
    lastName: z.string()
        .min(1, 'Last name is required'),
    phone: z.string()
        .min(1, 'Phone number is required')
        .min(10, 'Phone number must be at least 10 digits'),
    businessName: z.string().optional(),
    hmcCertNumber: z.string().optional(),
    address: z.string().optional(), // Deprecated
    addressLine1: z.string().optional(),
    addressLine2: z.string().optional(),
    city: z.string().optional(),
    area: z.string().optional(),
    postcode: z.string().optional(),
});
