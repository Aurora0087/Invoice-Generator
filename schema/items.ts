import { z } from 'zod';

export const InvoiceItemSchema = z.object({
    name: z.string()
        .min(2, 'Name must be at least 2 characters.'),
    quantity: z.preprocess(
        (val) => (val === '' ? undefined : Number(val)),
        z.number({ invalid_type_error: "Must be a number" })
            .min(1, 'Quantity must be at least 1.')
    ),
    price: z.preprocess(
        (val) => (val === '' ? undefined : Number(val)),
        z.number({ invalid_type_error: "Must be a number" })
            .min(0.01, 'Price must be at least 0.01.')
    ),
});

export type InvoiceItemProp = z.infer<typeof InvoiceItemSchema>;

export const ItemsSchema = z.object({
    items: z.array(InvoiceItemSchema).min(1, "At least one item is required"),
    discountAmount: z.preprocess(
        (val) => (val === '' ? undefined : Number(val)),
        z.number({ invalid_type_error: "Must be a number" })
            .min(0, 'Amount must be at least 0.')
    ),
    taxParsentage: z.preprocess(
        (val) => (val === '' ? undefined : Number(val)),
        z.number({ invalid_type_error: "Must be a number" })
            .min(0, 'Tax must be at least 0.')
    ),
    shipping: z.preprocess(
        (val) => (val === '' ? undefined : Number(val)),
        z.number({ invalid_type_error: "Must be a number" })
            .min(0, 'Amount must be at least 0.')
    ),
    payed: z.preprocess(
        (val) => (val === '' ? undefined : Number(val)),
        z.number({ invalid_type_error: "Must be a number" })
            .min(0, 'Amount must be at least 0.')
    ),
});

export type ItemsSchemaProp = z.infer<typeof ItemsSchema>;