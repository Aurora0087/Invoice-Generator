import { View, Text, Alert, TouchableOpacity, FlatList, RefreshControl, ScrollView, TextInput, Pressable, StyleSheet } from 'react-native'
import React, { useCallback, useState } from 'react'
import { deleteInvoice, getAllInvoice, searchInvoices } from '@/db/db';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Swipeable } from 'react-native-gesture-handler';
import InvoicePreviewCard from '@/components/invoices/InvoicePreviewCard';
import { useFocusEffect } from 'expo-router';
import SearchInvoices from '@/components/invoices/SearchInvoices';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';


export default function index() {

    const [invoices, setInvoices] = useState<{
        id: number,
        invoiceNumber: string,
        recipientName: string,
        date: string,
        amount: number,
        currency: string
    }[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const [isSeetOpen, setIsSeetOpen] = useState(false);
    const [searchParam, setSearchParam] = useState({
        invoiceNumber: "",
        recipientName: "",
        fromDate: "",
        toDate: ""
    });

    function toggleSheet() {
        setIsSeetOpen(!isSeetOpen);
    }

    async function searchInvoicesBy(params: {
        invoiceNumber?: string,
        recipientName?: string,
        fromDate?: string,
        toDate?: string
    }) {
        try {
            setSearchParam({
                invoiceNumber: params.invoiceNumber || "",
                recipientName: params.recipientName || "",
                fromDate: params.fromDate || "",
                toDate: params.toDate || ""
            })
            const res = await searchInvoices(params);

            setInvoices(res)
        } catch (error) {
            console.log(error);
            Alert.alert("Search faild", String(error));
        }
        toggleSheet()
    }


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

    useFocusEffect(
        useCallback(() => {
            setSearchParam({
                invoiceNumber: "",
                recipientName: "",
                fromDate: "",
                toDate: ""
            })
            getInvoices();
        }, [])
    )

    function onRefresh() {
        setSearchParam({
            invoiceNumber: "",
            recipientName: "",
            fromDate: "",
            toDate: ""
        })
        getInvoices();
    }

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
        <View className=' flex-1 p-8 px-4 dark:bg-slate-900 dark:text-white relative'>
            {
                isSeetOpen &&
                <>
                    <Pressable onPress={toggleSheet}
                        className=' bg-black/50 z-10'
                        style={{
                            ...StyleSheet.absoluteFillObject,
                        }} />
                    <Animated.View
                        className=" absolute bottom-0 w-screen h-fit z-20 overflow-hidden rounded-t-2xl"
                        entering={FadeInDown.springify()
                            .damping(15)}
                        exiting={
                            FadeOutDown.springify()
                                .damping(15)}
                    >
                        <LinearGradient
                            colors={['#00B2E7', '#E064F7', '#FF8D6C']}
                            className=''
                            style={{ borderRadius: 16 }}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <SearchInvoices searchInvoicesBy={searchInvoicesBy} />
                        </LinearGradient>

                    </Animated.View>
                </>
            }
            <View className=' flex flex-row gap-1 w-full overflow-hidden'>
                {(
                    searchParam.invoiceNumber.trim().length > 0 ||
                    searchParam.recipientName.trim().length > 0 ||
                    searchParam.fromDate.trim().length > 0 ||
                    searchParam.toDate.trim().length > 0
                ) && <Pressable onPress={toggleSheet}>
                        <View className="flex-row flex-wrap w-fit rounded-xl p-4 border border-black/30 dark:border-white/30 items-center gap-2">
                            {searchParam.invoiceNumber.trim().length > 0 && (
                                <Text className="text-base text-black dark:text-white text-center p-1 px-2 bg-[#00B2E7] rounded-full">
                                    Invoice: {searchParam.invoiceNumber}
                                </Text>
                            )}
                            {searchParam.recipientName.trim().length > 0 && (
                                <Text className="text-base text-black dark:text-white text-center p-1 px-2 bg-[#00B2E7] rounded-full">
                                    RecipientName: {searchParam.recipientName}
                                </Text>
                            )}
                            {searchParam.fromDate.trim().length > 0 && (
                                <Text className="text-base text-black dark:text-white text-center p-1 px-2 bg-[#00B2E7] rounded-full">
                                    FromDate: {searchParam.fromDate}
                                </Text>
                            )}
                            {searchParam.toDate.trim().length > 0 && (
                                <Text className="text-base text-black dark:text-white text-center p-1 px-2 bg-[#00B2E7] rounded-full">
                                    ToDate: {searchParam.toDate}
                                </Text>
                            )}
                        </View>
                    </Pressable>}

                <Pressable onPress={toggleSheet} className=' p-4 bg-[#00B2E7] rounded-xl flex-1 flex flex-row justify-center items-center'>
                    <Ionicons name='search' size={16} />
                </Pressable>
            </View>
            <View className=' flex flex-row items-center justify-between mt-8 px-2'>
                <Text className='dark:text-white text-xl font-bold'>
                    Invoices
                </Text>
            </View>
            <GestureHandlerRootView>
                <FlatList
                    data={invoices}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <Swipeable
                            renderRightActions={() => renderRightActions(item.id)}
                            friction={2}
                            overshootRight={false}
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
            <View className=' h-24' />
        </View>
    )
}