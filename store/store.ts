import { ItemsSchemaProp } from '@/schema/items';
import { RecipientInfoSchemaProp } from '@/schema/recipient';
import { SenderInfoSchemaProp } from '@/schema/sender';

import { create } from 'zustand';

export type CurrencyProp = '' | '₹' | '$' | '€';

export const AVALABLECURRENCYES = ['', '₹', '$', '€'];

export type NewInvoiceProp = {
    senderInfo: SenderInfoSchemaProp,
    recipientInfo: RecipientInfoSchemaProp,
    invoiceInfo: {
        invoiceNumber: string,
        orderId: string,
        date: string,
        dueDate: string
    },
    ItemsInfo: ItemsSchemaProp,
    logoImg: string,
    signImg: string,
    currency: CurrencyProp,
}

export type InvoiceState = {
    newInvoice: NewInvoiceProp;
    addSenderInfo: (senderInfo: SenderInfoSchemaProp) => void;
    addRecipientInfo: (recipientInfo: RecipientInfoSchemaProp) => void;
    addInvoiceInfo: (invoiceInfo: {
        invoiceNumber: string,
        orderId: string,
        date: string,
        dueDate: string
    }) => void;
    addItemsInfo: (ItemsInfo: ItemsSchemaProp) => void;
    addLogo: (imgUrl: string) => void;
    addSign: (imgUrl: string) => void;
    addCurrency: (currency: '' | '₹' | '$' | '€') => void;

    addAllData: (data: NewInvoiceProp) => void;
    resetInvoice: () => void;
}

export const useStore = create<InvoiceState>((set) => ({
    newInvoice: {
        senderInfo: {
            name: '',
            address: '',
            taxId: '',
            email: '',
            phone: '',
        },
        recipientInfo: {
            name: '',
            address: '',
            email: '',
            phone: '',
        },
        invoiceInfo: {
            invoiceNumber: '',
            orderId: '',
            date: '',
            dueDate: '',
        },
        ItemsInfo: {
            items: [],
            discountAmount: 0,
            taxParsentage: 0,
            shipping: 0,
            payed: 0,
        },
        logoImg: '',
        signImg: '',
        currency: '',
    },
    addSenderInfo: (senderInfo: SenderInfoSchemaProp) =>
        set((state) => ({ newInvoice: { ...state.newInvoice, senderInfo } })),
    addRecipientInfo: (recipientInfo: RecipientInfoSchemaProp) =>
        set((state) => ({ newInvoice: { ...state.newInvoice, recipientInfo } })),
    addInvoiceInfo: (invoiceInfo: {
        invoiceNumber: string,
        orderId: string,
        date: string,
        dueDate: string
    }) =>
        set((state) => ({
            newInvoice: {
                ...state.newInvoice, invoiceInfo: {
                    invoiceNumber: invoiceInfo.invoiceNumber,
                    orderId: invoiceInfo.orderId,
                    date: String(invoiceInfo.date),
                    dueDate: String(invoiceInfo.dueDate)
                }
            }
        })),
    addItemsInfo: (ItemsInfo: ItemsSchemaProp) =>
        set((state) => ({ newInvoice: { ...state.newInvoice, ItemsInfo } })),
    addLogo: (imgUrl: string) =>
        set((state) => ({ newInvoice: { ...state.newInvoice, logoImg: imgUrl } })),
    addSign: (imgUrl: string) =>
        set((state) => ({ newInvoice: { ...state.newInvoice, signImg: imgUrl } })),
    addCurrency: (currency: CurrencyProp) =>
        set((state) => ({ newInvoice: { ...state.newInvoice, currency: currency } })),

    addAllData: (data: NewInvoiceProp) => set(() => ({ newInvoice: data })),
    resetInvoice() {
        set(() => ({
            newInvoice: {
                senderInfo: {
                    name: '',
                    address: '',
                    taxId: '',
                    email: '',
                    phone: '',
                },
                recipientInfo: {
                    name: '',
                    address: '',
                    email: '',
                    phone: '',
                },
                invoiceInfo: {
                    invoiceNumber: '',
                    orderId: '',
                    date: '',
                    dueDate: '',
                },
                ItemsInfo: {
                    items: [],
                    discountAmount: 0,
                    taxParsentage: 0,
                    shipping: 0,
                    payed: 0,
                },
                logoImg: '',
                signImg: '',
                currency: '',
            }
        }
        )
        )
    }
}))
