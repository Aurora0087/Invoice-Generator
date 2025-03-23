import { z } from 'zod';

export const InvoiceInfoSchema = z.object({
    invoiceNumber: z.string()
        .min(1, 'Invoice number is required'),
    date: z.date({
        required_error: "Date is required",
        invalid_type_error: "Date is required",
    }),
    dueDate: z.date({
        required_error: "Due date is required",
        invalid_type_error: "Due date is required",
    }),
    orderId: z.string(),
});

export type InvoiceInfoSchemaProp = z.infer<typeof InvoiceInfoSchema>;