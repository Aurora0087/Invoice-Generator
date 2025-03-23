import { View, Text, Alert, TouchableOpacity, FlatList, RefreshControl, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { deleteInvoice, getAllInvoice } from '@/db/db';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import InvoicePreviewCard from '@/components/invoices/InvoicePreviewCard';

export default function index() {

    const [invoices, setInvoices] = useState<{ id: number, invoiceNumber: string, recipientName: string, date: string, amount: number, currency: string }[]>([]);
    const [refreshing, setRefreshing] = useState(false);


    async function getInvoices() {
        setRefreshing(true);
        try {
            const res = await getAllInvoice();
            setInvoices(res);
        } catch (error) {
            console.log(error);
            Alert.alert(String(error));
        }
        setRefreshing(false);
    }

    async function handleDelete(id: number) {
        await deleteInvoice(id);
        setInvoices((prev) => prev.filter((invoice) => invoice.id !== id));
    }

    useEffect(() => {
        getInvoices();
    }, [])

    const renderRightActions = (id: number) => (
        <TouchableOpacity
            className="bg-red-500 justify-center items-center px-6 rounded-2xl my-2"
            onPress={() => handleDelete(id)}
        >
            <Ionicons name="trash-bin" size={16} color='white' />
            <Text className="text-white font-bold text-center text-base">Delete</Text>
        </TouchableOpacity>
    );

    return (
        <View className=' flex-1 p-8 px-4 dark:bg-slate-900 dark:text-white'>
            <View className=' flex flex-row items-center justify-between mt-8 px-2'>
                <Text className='dark:text-white text-xl font-bold'>
                    Invoices
                </Text>
            </View>
            <GestureHandlerRootView>
                <FlatList
                    data={invoices}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={getInvoices} />}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <Swipeable
                            key={item.id}
                            rightThreshold={40}
                            enableTrackpadTwoFingerGesture
                            renderRightActions={() => renderRightActions(item.id)}
                        >
                            <InvoicePreviewCard
                                id={item.id}
                                invoiceNumber={item.invoiceNumber}
                                recipientName={item.recipientName}
                                date={item.date}
                                amount={item.amount}
                                currency={item.currency} />
                        </Swipeable>
                    )}
                />
            </GestureHandlerRootView>
        </View>
    )
}