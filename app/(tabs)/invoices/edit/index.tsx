import { ScrollView, View } from 'react-native'
import React from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useStore } from '@/store/store';
import SenderInfo from '@/components/invoices/edit/SenderInfo';
import RecipientInfo from '@/components/invoices/edit/RecipientInfo';
import InvoiceInfo from '@/components/invoices/edit/InvoiceInfo';
import ItemsInfo from '@/components/invoices/edit/ItemsInfo';

export default function index() {

    const param = useLocalSearchParams();


    const invoiceId = Number(param.invoiceId);


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
            <SenderInfo invoice={newInvoice} id={invoiceId} addSenderInfo={addSenderInfo} />
            <RecipientInfo invoice={newInvoice} id={invoiceId} addRecipientInfo={addRecipientInfo} />
            <InvoiceInfo invoice={newInvoice} id={invoiceId} addInvoiceInfo={addInvoiceInfo} />
            <ItemsInfo invoice={newInvoice} id={invoiceId} addItemsInfo={addItemsInfo} />
            <View className=' h-24' />
        </ScrollView>
    )
}