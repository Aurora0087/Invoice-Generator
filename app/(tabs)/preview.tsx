import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useStore } from '@/store/store';
import { Link, Tabs, useLocalSearchParams, useRouter } from 'expo-router';
import * as Print from 'expo-print';
import { generateHtml, getImageAsBase64 } from '@/utils';
import { shareAsync } from 'expo-sharing';
import WebView from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';

export default function preview() {

    const param = useLocalSearchParams();


    const invoiceId = Number(param.invoiceId);

    const [subtotal, setSubtotal] = useState(0);
    const [tax, setTax] = useState(0);
    const [grandTotal, setGrandTotal] = useState(0);

    const [html, setHtml] = useState('');

    const router = useRouter();
    const { newInvoice } = useStore();

    useEffect(() => {

        const subTotalValue = newInvoice.ItemsInfo.items.reduce((total, item) =>
            total + (item.quantity * item.price), 0);

        setSubtotal(subTotalValue);

        let grandTotalValue = subTotalValue - newInvoice.ItemsInfo.discountAmount;

        const taxRate = Number(newInvoice.ItemsInfo.taxParsentage) / 100 || 0;
        const taxValue = grandTotalValue * taxRate;

        setTax(taxValue);

        grandTotalValue += taxValue;

        const shippingValue = Number(newInvoice.ItemsInfo.shipping) || 0;

        grandTotalValue += shippingValue;

        setGrandTotal(grandTotalValue);

        setHtml(generateHtml(newInvoice));
    }, [])

    async function generatePdf() {
        try {
            // Get the logo image as base64
            const logoPath = newInvoice.logoImg;
            const logoBase64 = await getImageAsBase64(logoPath);

            // Get the signature image as base64 (if you have one)
            const signPath = newInvoice.signImg;
            const signBase64 = await getImageAsBase64(signPath);

            // Replace the file paths in your invoice data
            const updatedInvoice = {
                ...newInvoice,
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
        }
    }

    return (
        <View className='p-4 dark:bg-gray-900 flex-1'>
            <Tabs.Screen options={{
                headerShown: true, headerTitle: 'Pdf Preview', headerStyle: {
                    backgroundColor: '#00B2E7',
                },
                headerTitleStyle: {
                    fontWeight: '600',
                    color: 'white',
                },
            }} />
            <View className=' w-fit'>
                <Link href={`/invoices/details/${newInvoice}`} asChild>
                    <TouchableOpacity
                        className=" bg-[#00B2E7] text-white py-4 px-8 rounded-2xl flex flex-row items-center gap-2 self-start"
                    >
                        <Ionicons name="arrow-back" size={16} color='white' />
                        <Text className="text-white font-bold text-center text-base w-fit">Back</Text>
                    </TouchableOpacity>
                </Link>
            </View>
            <ScrollView horizontal={true} scrollEnabled style={{ marginTop: 10 }}>
                <View style={{ width: 720, minHeight: 600, height: '100%', flex: 1 }}>
                    <WebView
                        style={{ flex: 1, }}
                        originWhitelist={['*', 'file://*']}
                        source={{ html }}
                        allowFileAccess
                        allowFileAccessFromFileURLs
                        allowUniversalAccessFromFileURLs
                        scrollEnabled
                        showsHorizontalScrollIndicator
                        showsVerticalScrollIndicator
                    />
                </View>
            </ScrollView>
            <TouchableOpacity
                className=" bg-[#00B2E7] text-white py-4 px-6 rounded-2xl mt-8 flex flex-row items-center justify-center gap-2"
                onPress={generatePdf}
            >
                <Ionicons name="print" size={16} color='white' />
                <Text className="text-white font-bold text-center text-base">Genaret Invoice Pdf</Text>
            </TouchableOpacity>
            <View className=' h-24' />
        </View>
    )
}