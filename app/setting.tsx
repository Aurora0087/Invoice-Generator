import { Alert, Platform, ScrollView, Text, ToastAndroid, TouchableOpacity, View, BackHandler } from 'react-native'
import React, { useState } from 'react'
import { Stack } from 'expo-router';
import SettingHeader from '@/components/setting/SettingHeader';
import ChangeSenderInfo from '@/components/setting/ChangeSenderInfo';
import ChangeDefaultImages from '@/components/setting/ChangeImages';

import { shareAsync } from 'expo-sharing';

import * as FileSystem from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons';
import { exportAllTablesToCsv } from '@/utils';
import { deleteAllDbData } from '@/db/db';


export default function setting() {

    const [csvUrls, setCsvUrls] = useState<string[]>([]);

    const appImagesDir = `${FileSystem.documentDirectory}app-images/`;
    const csvExportDir = `${FileSystem.documentDirectory}csv-exports/`;

    async function deleteAppImages() {
        try {
            const dirInfo = await FileSystem.getInfoAsync(appImagesDir);

            if (dirInfo.exists && dirInfo.isDirectory) {
                await FileSystem.deleteAsync(appImagesDir, { idempotent: true });
                console.log(`Successfully deleted image directory: ${appImagesDir}`);
                if (Platform.OS === 'android') {
                    ToastAndroid.show('Successfully deleted images.', ToastAndroid.SHORT);
                }
            } else if (!dirInfo.exists) {
                console.log(`Image directory not found, nothing to delete: ${appImagesDir}`);
                if (Platform.OS === 'android') {
                    ToastAndroid.show('Image directory not found, nothing to delete.', ToastAndroid.SHORT);
                }
            } else {
                if (Platform.OS === 'android') {
                    ToastAndroid.show(`Path exists but is not a directory, cannot delete as expected: ${appImagesDir}`, ToastAndroid.LONG);
                }
            }
        } catch (error) {
            console.error(`Failed to delete image directory ${appImagesDir}:`, error);
            Alert.alert("Failed to delete image directory", String(error))
        }
    }

    async function makeCsv() {
        try {
            const res = await exportAllTablesToCsv(csvExportDir);

            setCsvUrls(res);

            if (Platform.OS === 'android') {
                ToastAndroid.show('Successfully Created CSV files. Press those files to download.', ToastAndroid.LONG);
            }
        } catch (error) {
            console.log(error);
            Alert.alert("Failed to Create CSV File", String(error))
        }
    }

    function confirmAndDeleteAllData() {
        Alert.alert(
            "Confirm Deletion",
            "This will permanently delete all your data (invoices, settings, images, etc.). This action cannot be undone.\n\nIf you want to save your data for later use, please cancel and use the 'Export All Data as CSV' option first.\n\nAre you sure you want to delete everything?", // Message
            [
                {
                    text: "Cancel",
                    onPress: () => console.log("Deletion cancelled by user."),
                    style: "cancel"
                },
                // Button 2: Confirm Delete
                {
                    text: "Yes, Delete All",
                    onPress: async () => { // Make the onPress async to await deletion
                        console.log("Deletion confirmed. Proceeding...");
                        try {
                            // Call the actual deletion function (which handles DB and potentially images)
                            await deleteAllDbData(); // Use the combined function
                            console.log("All app data deleted successfully. Exiting app.");
                            // Exit the app AFTER successful deletion
                            BackHandler.exitApp();
                        } catch (error: any) {
                            console.error("Failed to delete all app data:", error);
                            // Show an error alert if deletion fails
                            Alert.alert("Deletion Failed", `An error occurred: ${error.message || String(error)}`);
                        }
                    },
                    style: "destructive" // iOS style suggestion (makes text red)
                }
            ],
            { cancelable: true } // Allow dismissing the alert by tapping outside (Android primarily)
        );
    }

    return (
        <ScrollView className=' flex-1 p-4 py-8 bg-slate-100 dark:bg-slate-900 dark:text-white'>
            <Stack.Screen options={{ header: (props) => <SettingHeader {...props} /> }} />

            <TouchableOpacity
                className=" bg-[#00B2E7] text-black rounded-2xl p-4 flex flex-row items-center justify-center gap-2"
                onPress={makeCsv}>
                <Ionicons name="document" size={16} color='white' />
                <Text className='text-white font-bold'>Export All Data as CSV</Text>
            </TouchableOpacity>
            {csvUrls.length > 0 &&
                <View>
                    <Text className=' text-black dark:text-white'>
                        {`Generated ${csvUrls.length} CSV file(s) in app cache. Ready to share/save.`}
                    </Text>
                    <View className=' flex flex-row gap-4 gap-y-2 flex-wrap bg-black dark:bg-white my-2 p-2 rounded-lg'>
                        {
                            csvUrls.map((url, i) =>
                                <TouchableOpacity
                                    className=" bg-[#00B2E7] text-black rounded-2xl p-4 py-1 flex flex-row items-center justify-center gap-2"
                                    onPress={async () => {
                                        await shareAsync(url, {
                                            mimeType: 'text/csv',
                                            dialogTitle: 'Save or Share CSV File',
                                        })
                                    }}
                                    key={i}
                                >
                                    <Text className=' text-white'>{url.split("/").at(-1)}</Text>
                                </TouchableOpacity>
                            )
                        }
                    </View>

                </View>}
            <ChangeSenderInfo />
            <ChangeDefaultImages />
            <View className=' py-8  pb-16'>
                <Text className=' text-red-400 border-t border-red-400 py-4 text-2xl font-bold'>Danger Zone</Text>
                <TouchableOpacity
                    className="bg-red-400 text-black rounded-2xl p-4 flex flex-row items-center justify-center gap-2"
                    onPress={deleteAppImages}>
                    <Ionicons name="trash-bin" size={16} color='white' />
                    <Text className=' text-white'>Delete All Images</Text>
                    <Ionicons name="images" size={16} color='white' />
                </TouchableOpacity>
                <TouchableOpacity
                    className="bg-red-400 mt-4 text-black rounded-2xl p-4 flex flex-row items-center justify-center gap-2"
                    onPress={confirmAndDeleteAllData}>
                    <Ionicons name="trash-bin" size={16} color='white' />
                    <Text className='text-white'>Delete All Data</Text>
                    <Ionicons name="document" size={16} color='white' />
                </TouchableOpacity>
            </View>
        </ScrollView>
    )
}

