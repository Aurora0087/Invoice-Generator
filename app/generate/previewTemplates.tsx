import { NewInvoiceProp, useStore } from "@/store/store";
import React from "react";
import { Alert, Platform, ScrollView, Text, ToastAndroid, TouchableOpacity, View } from "react-native";

import { useRouter } from 'expo-router';

import { WebView } from 'react-native-webview';

import * as Print from 'expo-print';
import { shareAsync } from 'expo-sharing';
import Ionicons from "@expo/vector-icons/build/Ionicons";
import { createInvoice } from "@/db/db";
import { generateHtml, getImageAsBase64 } from "@/utils";

export default function InvoiceSummary() {

    const { newInvoice, resetInvoice } = useStore();
    const router = useRouter();

    const html = generateHtml(newInvoice);

    // Main function to generate and share PDF
    async function generatePdf() {
        try {
            // Get the logo image as base64
            const logoPath = newInvoice.logoImg;

            let logoBase64 = "";
            let signBase64 = "";

            try {
                logoBase64 = await getImageAsBase64(logoPath);
            } catch (error) {
                Alert.alert("Cant get Logo image from cache.", String(error));
                return
            }

            // Get the signature image as base64 (if you have one)
            const signPath = newInvoice.signImg;

            try {
                signBase64 = await getImageAsBase64(signPath);
            } catch (error) {
                Alert.alert("Cant get sign image from cache.", String(error));
                return
            }
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

    async function saveNewInvoiceData() {
        try {
            await createInvoice(newInvoice);
            if (Platform.OS === 'android') {
                ToastAndroid.show('New Invoice details saved.', ToastAndroid.SHORT);
            }
        } catch (error) {
            Alert.alert('Unable to Save.', String(error));
        }
    }

    function createNewInvoice() {
        resetInvoice();
        router.push('/generate')
    }


    return (
        <View className="flex-1 bg-gray-100 dark:bg-gray-900 p-6">
            <View>
                <Text className=" dark:text-white text-center text-2xl font-bold">
                    Preview Templetes
                </Text>
                <Text className="text-base font-medium text-blue-400 text-center mb-4">
                    Drag UpDown(Use 2 finger) & SideBySide to preview the PDF.
                </Text>
                <ScrollView horizontal={true} style={{ marginTop: 10 }}>
                    <View style={{ width: 720, height: 600 }}>
                        <WebView
                            style={{ flex: 1 }}
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
                    className=" bg-[#E064F7] text-white py-4 px-6 rounded-2xl mt-4 flex flex-row items-center justify-center gap-2"
                    onPress={generatePdf}
                >
                    <Ionicons name="print" size={16} color='white' />
                    <Text className="text-white font-bold text-center text-base">Genaret Invoice Pdf</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    className=" bg-[#FF8D6c] text-white py-4 px-6 rounded-2xl mt-4 flex flex-row items-center justify-center gap-2"
                    onPress={saveNewInvoiceData}
                >
                    <Ionicons name="save" size={16} color='white' />
                    <Text className="text-white font-bold text-center text-base">Save Invoice Data</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    className=" bg-[#00B2E7] text-white py-4 px-6 rounded-2xl mt-4 flex flex-row items-center justify-center gap-2"
                    onPress={createNewInvoice}
                >
                    <Ionicons name="add" size={16} color='white' />
                    <Text className="text-white font-bold text-center text-base">Create a New Invoice</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}