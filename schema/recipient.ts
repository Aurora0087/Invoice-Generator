import { z } from 'zod';

export const RecipientInfoSchema = z.object({
    name: z.string()
        .min(2, 'Name must be at least 2 characters')
        .max(50, 'Name must be less than 50 characters'),
    address: z.string()
        .min(5, 'Address must be at least 5 characters')
        .max(100, 'Address must be less than 100 characters'),
    email: z.string()
        .email()
        .optional(),
    phone: z.string()
        .optional(),
});

export type RecipientInfoSchemaProp = z.infer<typeof RecipientInfoSchema>;