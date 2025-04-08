import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { CurrencyProp, useStore } from '@/store/store';
import SenderInfo from '@/components/invoices/edit/SenderInfo';
import RecipientInfo from '@/components/invoices/edit/RecipientInfo';
import InvoiceInfo from '@/components/invoices/edit/InvoiceInfo';
import ItemsInfo from '@/components/invoices/edit/ItemsInfo';
import ImagesPicker from '@/components/invoices/edit/ImagesPicker';
import { Ionicons } from '@expo/vector-icons';

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
        <ScrollView className="flex-1 bg-gray-100 dark:bg-gray-900">
            <View className=' w-fit px-6 pt-6'>
                <Link href={`/invoices/details/${invoiceId}`} asChild>
                    <TouchableOpacity
                        className=" bg-[#00B2E7] text-white py-4 px-8 rounded-2xl flex flex-row items-center gap-2 self-start"
                    >
                        <Ionicons name="arrow-back" size={16} color='white' />
                        <Text className="text-white font-bold text-center text-base w-fit">Back</Text>
                    </TouchableOpacity>
                </Link>
            </View>

            <SenderInfo invoice={newInvoice} id={invoiceId} addSenderInfo={addSenderInfo} />
            <RecipientInfo invoice={newInvoice} id={invoiceId} addRecipientInfo={addRecipientInfo} />
            <InvoiceInfo invoice={newInvoice} id={invoiceId} addInvoiceInfo={addInvoiceInfo} />
            <ItemsInfo invoice={newInvoice} id={invoiceId} addItemsInfo={addItemsInfo} />
            <ImagesPicker invoice={newInvoice} id={invoiceId} addCurrency={addCurrency} addLogo={addLogo} addSign={addSign} />
            <View className=' h-24' />
        </ScrollView>
    )
}