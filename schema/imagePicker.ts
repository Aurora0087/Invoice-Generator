import { z } from 'zod';

export const ImagePickerSchema = z.object({
    logoImg: z.string()
        .min(2, 'Name must be at least 2 characters'),
    signImg: z.string()
        .min(2, 'Name must be at least 2 characters'),
});

export type RecipientInfoSchemaProp = z.infer<typeof ImagePickerSchema>;