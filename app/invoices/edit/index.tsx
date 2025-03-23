import { View, Text, ScrollView } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router';
import { useStore } from '@/store/store';
import SenderInfo from '@/components/invoices/edit/SenderInfo';
import RecipientInfo from '@/components/invoices/edit/RecipientInfo';
import InvoiceInfo from '@/components/invoices/edit/InvoiceInfo';
import ItemsInfo from '@/components/invoices/edit/ItemsInfo';

export default function index() {

    const router = useRouter();

    const {
        newInvoice,
        addSenderInfo,
        addCurrency,
        addInvoiceInfo,
        addItemsInfo,
        addLogo,
        addRecipientInfo,
        addSign
    } = useStore();

    return (
        <ScrollView className="flex-1 bg-white dark:bg-gray-900">
            <SenderInfo invoice={newInvoice} addSenderInfo={addSenderInfo} />
            <RecipientInfo invoice={newInvoice} addRecipientInfo={addRecipientInfo} />
            <InvoiceInfo invoice={newInvoice} addInvoiceInfo={addInvoiceInfo} />
            <ItemsInfo invoice={newInvoice} addItemsInfo={addItemsInfo} />
        </ScrollView>
    )
}