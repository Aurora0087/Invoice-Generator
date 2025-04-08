import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { Tabs, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router'
import { getInvoiceById } from '@/db/db';
import { NewInvoiceProp, useStore } from '@/store/store';
import { Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import { generateHtml, getImageAsBase64 } from '@/utils';
import { shareAsync } from 'expo-sharing';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function InvoiceDetailsScreen() {

    const { id } = useLocalSearchParams();

    const [invoice, setInvoice] = useState<NewInvoiceProp | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [subtotal, setSubtotal] = useState(0);
    const [tax, setTax] = useState(0);
    const [grandTotal, setGrandTotal] = useState(0);

    const router = useRouter();
    const { addAllData } = useStore();

    async function getInvoice(id: number) {
        setIsLoading(true);
        if (isNaN(id)) {
            return null;
        }

        const res = await getInvoiceById(id);

        setInvoice(res);
        setIsLoading(false)
    }

    useFocusEffect(
        useCallback(() => {
            getInvoice(Number(id))
        }, [id])
    )

    useEffect(() => {
        if (invoice) {

            const subTotalValue = invoice.ItemsInfo.items.reduce((total, item) =>
                total + (item.quantity * item.price), 0);

            setSubtotal(subTotalValue);

            let grandTotalValue = subTotalValue - invoice.ItemsInfo.discountAmount;

            const taxRate = Number(invoice.ItemsInfo.taxParsentage) / 100 || 0;
            const taxValue = grandTotalValue * taxRate;

            setTax(taxValue);

            grandTotalValue += taxValue;

            const shippingValue = Number(invoice.ItemsInfo.shipping) || 0;

            grandTotalValue += shippingValue;

            setGrandTotal(grandTotalValue);

        }
    }, [invoice, id])


    async function generatePdf() {
        try {

            if (!invoice) {
                return
            }
            // Get the logo image as base64
            const logoPath = invoice.logoImg;

            let logoBase64 = "";
            let signBase64 = "";

            try {
                logoBase64 = await getImageAsBase64(logoPath);
            } catch (error) {
                Alert.alert("Cant get Logo image from cache.", String(error));
                return
            }

            // Get the signature image as base64 (if you have one)
            const signPath = invoice.signImg;

            try {
                signBase64 = await getImageAsBase64(signPath);
            } catch (error) {
                Alert.alert("Cant get sign image from cache.", String(error));
                return
            }

            // Replace the file paths in your invoice data
            const updatedInvoice = {
                ...invoice,
                logoImg: logoBase64,
                signImg: signBase64
            };

            // Generate your HTML with the base64 images
            // Make sure to use the updated invoice data with base64 images
            const html = generateHtml(updatedInvoice);

            // Generate PDF
            const file = await Print.printToFileAsync({
                html,
                width: 720,
                base64: false,
            });

            // Share the PDF
            await shareAsync(file.uri);
        } catch (error) {
            console.error("Error generating PDF:", error);
            Alert.alert("Fail to genaret Pdf.", String(error));
        }
    }

    function previewInvoice() {
        if (!invoice) {
            return
        }
        addAllData(invoice);
        router.push({ pathname: '/(tabs)/preview', params: { invoiceId: `${id}` } });
    }

    function editInvoice() {
        if (!invoice) {
            return
        }
        addAllData(invoice)
        router.push({ pathname: '/invoices/edit', params: { invoiceId: `${id}` } });
    }

    return (
        <ScrollView className="flex-1 dark:bg-gray-900">
            {
                invoice !== null ? (
                    <Animated.View
                        entering={FadeInDown.duration(500)}
                        className=''>
                        <View className="gap-4 p-6">
                            {/* sender info */}
                            <View className="bg-gray-200 dark:bg-gray-700 gap-1 border-b border-r dark:border-white p-4 rounded-2xl">
                                <Text className="dark:text-white text-2xl font-bold mb-4">From</Text>
                                <View className="flex gap-1">
                                    <Text className="text-base font-medium dark:text-white">Sender Name :</Text>
                                    <Text className="text-base font-medium mb-1 text-gray-700 dark:text-slate-400">
                                        {invoice.senderInfo.name}</Text>
                                </View>
                                <View className="flex gap-1">
                                    <Text className="text-base font-medium dark:text-white">Sender Address :</Text>
                                    <Text className="text-base font-medium text-pretty mb-1 text-gray-700 dark:text-slate-400 flex-shrink">
                                        {invoice.senderInfo.address}
                                    </Text>
                                </View>
                                <View className="flex gap-1">
                                    <Text className="text-base font-medium dark:text-white">Sender Tex Id :</Text>
                                    <Text className="text-base font-medium mb-1 text-gray-700 dark:text-slate-400">
                                        {invoice.senderInfo.taxId}
                                    </Text>
                                </View>
                                <View className="flex gap-1">
                                    <Text className="text-base font-medium dark:text-white">Sender Mail Id :</Text>
                                    <Text className="text-base font-medium mb-1 text-gray-700 dark:text-slate-400">
                                        {invoice.senderInfo.email}
                                    </Text>
                                </View>
                                <View className="flex gap-1">
                                    <Text className="text-base font-medium dark:text-white">Sender Phone Number :</Text>
                                    <Text className="text-base font-medium mb-1 text-gray-700 dark:text-slate-400">
                                        {invoice.senderInfo.phone}
                                    </Text>
                                </View>
                            </View>

                            {/* Client info */}
                            <View className="bg-gray-200 dark:bg-gray-700 gap-1 border-b border-r dark:border-white p-4 rounded-2xl">
                                <Text className="dark:text-white text-2xl font-bold mb-4">To</Text>
                                <View className="flex gap-1">
                                    <Text className="text-base font-medium dark:text-white">Client Name :</Text>
                                    <Text className="text-base font-medium mb-1 text-gray-700 dark:text-slate-400">
                                        {invoice.recipientInfo.name}
                                    </Text>
                                </View>
                                <View className="flex gap-1">
                                    <Text className="text-base font-medium dark:text-white">Client Address :</Text>
                                    <Text className="text-base font-medium text-pretty mb-1 text-gray-700 dark:text-slate-400 flex-shrink">
                                        {invoice.recipientInfo.address}
                                    </Text>
                                </View>
                                <View className="flex gap-1">
                                    <Text className="text-base font-medium dark:text-white">Client Mail Id :</Text>
                                    <Text className="text-base font-medium mb-1 text-gray-700 dark:text-slate-400">
                                        {invoice.recipientInfo.email}
                                    </Text>
                                </View>
                                {invoice.recipientInfo.phone && <View className="flex gap-1">
                                    <Text className="text-base font-medium dark:text-white">Client Phone Number :</Text>
                                    <Text className="text-base font-medium mb-1 text-gray-700 dark:text-slate-400">
                                        {invoice.recipientInfo.phone}
                                    </Text>
                                </View>}

                            </View>

                            {/* invoice info */}
                            <View className="bg-gray-200 dark:bg-gray-700 gap-1 border-b border-r dark:border-white p-4 rounded-2xl">
                                <Text className="dark:text-white text-2xl font-bold mb-4">Invoice Details</Text>
                                <View className="flex gap-1">
                                    <Text className="text-base font-medium dark:text-white">Invoice ID :</Text>
                                    <Text className="text-base font-medium mb-1 text-gray-700 dark:text-slate-400">
                                        {invoice.invoiceInfo.invoiceNumber}
                                    </Text>
                                </View>
                                <View className="flex gap-1">
                                    <Text className="text-base font-medium dark:text-white">Order ID :</Text>
                                    <Text className="text-base font-medium mb-1 text-gray-700 dark:text-slate-400">
                                        {invoice.invoiceInfo.orderId}
                                    </Text>
                                </View>
                                <View className="flex gap-1">
                                    <Text className="text-base font-medium dark:text-white">Date(dd-mm-yyyy) :</Text>
                                    <Text className="text-base font-medium text-pretty mb-1 text-gray-700 dark:text-slate-400 flex-shrink">
                                        {invoice.invoiceInfo.date}
                                    </Text>
                                </View>
                                <View className="flex gap-1">
                                    <Text className="text-base font-medium dark:text-white">Due Date(dd-mm-yyyy) :</Text>
                                    <Text className="text-base font-medium mb-1 text-gray-700 dark:text-slate-400">
                                        {invoice.invoiceInfo.dueDate}
                                    </Text>
                                </View>
                            </View>

                            {/* Items info */}
                            <View className="bg-gray-200 dark:bg-gray-700 gap-1 border-b border-r dark:border-white p-4 rounded-2xl">
                                <Text className="dark:text-white text-2xl font-bold mb-4">Items</Text>
                                <View className="flex-row justify-between mb-2">
                                    <Text className="text-base flex-shrink font-bold dark:text-white w-1/3">Item</Text>
                                    <Text className="text-base flex-shrink font-bold dark:text-white w-1/4 text-right">Qty</Text>
                                    <Text className="text-base flex-shrink font-bold dark:text-white w-1/4 text-right">Price</Text>
                                    <Text className="text-base flex-shrink font-bold dark:text-white w-1/4 text-right">Line total</Text>
                                </View>
                                {invoice.ItemsInfo.items.map((item, index) => (
                                    <View
                                        key={index}
                                        className="flex-row justify-between py-2 border-b border-gray-400"
                                    >
                                        <Text className="text-base flex-shrink dark:text-white w-1/3">{item.name}</Text>
                                        <Text className="text-base flex-shrink dark:text-white w-1/4 text-right">{item.quantity}</Text>
                                        <Text className="text-base flex-shrink dark:text-white w-1/4 text-right">{invoice.currency}{item.price.toFixed(2)}</Text>
                                        <Text className="text-base flex-shrink dark:text-white w-1/4 text-right">{invoice.currency}{(item.quantity * item.price).toFixed(2)}</Text>
                                    </View>
                                ))}
                            </View>

                            {/* Total */}
                            <View className="bg-gray-200 dark:bg-gray-700 gap-1 border-b border-r dark:border-white p-4 rounded-2xl">
                                <Text className="dark:text-white text-2xl font-bold mb-4">Totals</Text>
                                <View className="flex-row justify-between mb-2">
                                    <Text className="text-base font-medium dark:text-white">Subtotal</Text>
                                    <Text className="text-base font-medium dark:text-white">{invoice.currency}{subtotal.toFixed(2)}</Text>
                                </View>
                                <View className="flex-row justify-between mb-2">
                                    <Text className="text-base font-medium dark:text-white">Discount</Text>
                                    <Text className="text-base font-medium dark:text-white">-{invoice.currency}{invoice.ItemsInfo.discountAmount}</Text>
                                </View>
                                <View className="flex-row justify-between mb-2">
                                    <Text className="text-base font-medium dark:text-white">Tax ({invoice.ItemsInfo.taxParsentage}%)</Text>
                                    <Text className="text-base font-medium dark:text-white">{invoice.currency}{tax.toFixed(2)}</Text>
                                </View>
                                <View className="flex-row justify-between mb-2">
                                    <Text className="text-base font-medium dark:text-white">Shipping</Text>
                                    <Text className="text-base font-medium dark:text-white">{invoice.currency}{invoice.ItemsInfo.shipping}</Text>
                                </View>
                                <View className="flex-row justify-between mt-2 pt-2 border-t border-gray-400">
                                    <Text className="text-base font-bold dark:text-white">Grand Total</Text>
                                    <Text className="text-base text-green-600 dark:text-green-400 font-bold">{invoice.currency}{grandTotal}</Text>
                                </View>
                            </View>

                            <View className="bg-gray-200 dark:bg-gray-700 gap-1 border-b border-r dark:border-white p-4 rounded-2xl">
                                <View className="flex-row justify-between mb-2">
                                    <Text className="text-base font-medium dark:text-white">Payed Amount</Text>
                                    <Text className="text-base font-medium dark:text-white">{invoice.currency}{invoice.ItemsInfo.payed}</Text>
                                </View>
                                <View className="flex-row justify-between mb-2">
                                    <Text className="text-base font-medium dark:text-white">Amount due</Text>
                                    <Text className="text-base font-medium text-green-600 dark:text-green-400">{invoice.currency}{(grandTotal - invoice.ItemsInfo.payed).toFixed(2)}</Text>
                                </View>
                            </View>

                            {
                                invoice.logoImg.length > 1 &&
                                <Image source={{ uri: invoice.logoImg }} className='w-48 h-48 border rounded-2xl self-center' />
                            }

                            {
                                invoice.signImg.length > 1 &&
                                <Image source={{ uri: invoice.signImg }} className=' w-full aspect-video border rounded-2xl' />
                            }
                        </View>
                        <View className=' p-4'>
                            <TouchableOpacity
                                className=" bg-[#00B2E7] text-white py-4 px-6 rounded-2xl mt-8 flex flex-row items-center justify-center gap-2"
                                onPress={generatePdf}
                            >
                                <Ionicons name="print" size={16} color='white' />
                                <Text className="text-white font-bold text-center text-base">Genaret Invoice Pdf</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                className=" bg-[#E064F7] text-white py-4 px-6 rounded-2xl mt-4 flex flex-row items-center justify-center gap-2"
                                onPress={previewInvoice}
                            >
                                <Ionicons name="document" size={16} color='white' />
                                <Text className="text-white font-bold text-center text-base">Preview Invoice Pdf</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                className=" bg-[#FF8D6C] text-white py-4 px-6 rounded-2xl mt-4 flex flex-row items-center justify-center gap-2"
                                onPress={editInvoice}
                            >
                                <Ionicons name="pencil" size={16} color='white' />
                                <Text className="text-white font-bold text-center text-base">Edit Invoice</Text>
                            </TouchableOpacity>
                        </View>

                    </Animated.View>
                ) : (
                    isLoading ?
                        <View className=' flex-1 items-center justify-center'>
                            <Text className="text-base font-medium dark:text-white">Loading...</Text>
                        </View> :
                        <View className=' flex-1 items-center justify-center'>
                            <Text className="text-base font-medium dark:text-white">No Invoice</Text>
                        </View>
                )
            }
            <View className=' h-24' />
        </ScrollView>
    )
}