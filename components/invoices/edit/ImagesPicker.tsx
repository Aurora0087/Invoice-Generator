import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Platform, ToastAndroid } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { CurrencyProp, NewInvoiceProp } from '@/store/store';
import { Ionicons } from '@expo/vector-icons';

import * as ExpoImagePicker from 'expo-image-picker';

import { Image } from 'react-native';
import { saveSetting, updateInvoice } from '@/db/db';
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';

export default function ImagesPicker({ invoice, id, addCurrency, addLogo, addSign }: { invoice: NewInvoiceProp, id: number, addCurrency: (currency: CurrencyProp) => void, addLogo: (imgUrl: string) => void, addSign: (imgUrl: string) => void }) {

    const [logoImageUrl, setLogoImageUrl] = useState<string | null>(invoice.logoImg || null);
    const [signImageUrl, setSignImageUrl] = useState<string | null>(invoice.signImg || null);

    const [currency, setCurrency] = useState<CurrencyProp>(invoice.currency);

    async function pickLogoImage() {
        try {

            (async () => {
                const { status } = await ExpoImagePicker.requestMediaLibraryPermissionsAsync();
                console.log(status);

                if (status !== 'granted') {
                    Alert.alert('Sorry, we need camera roll permissions to make this work!');
                    return
                }
            })();

            const result = await ExpoImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            });

            if (!result.canceled) {
                // Get the selected image URI
                const sourceUri = result.assets[0].uri;

                // Create a permanent directory if it doesn't exist
                const appImagesDir = `${FileSystem.documentDirectory}app-images/`;
                const dirInfo = await FileSystem.getInfoAsync(appImagesDir);

                if (!dirInfo.exists) {
                    await FileSystem.makeDirectoryAsync(appImagesDir, { intermediates: true });
                }

                // Generate a unique filename with timestamp
                const fileName = `logo-${new Date().getTime()}.jpg`;
                const destUri = `${appImagesDir}${fileName}`;

                // Copy the file to the permanent location
                await FileSystem.copyAsync({
                    from: sourceUri,
                    to: destUri
                });

                setLogoImageUrl(destUri);
            }
        } catch (error) {
            console.error('Error picking logo image:', error);
            Alert.alert('Error', 'Failed to pick logo image');
        }
    };

    async function pickSignImage() {
        try {

            (async () => {
                const { status } = await ExpoImagePicker.requestMediaLibraryPermissionsAsync();
                console.log(status);

                if (status !== 'granted') {
                    Alert.alert('Sorry, we need camera roll permissions to make this work!');
                    return
                }
            })();

            const result = await ExpoImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [16, 9],
                quality: 1,
            });

            if (!result.canceled) {
                // Get the selected image URI
                const sourceUri = result.assets[0].uri

                // Create a permanent directory if it doesn't exist
                const appImagesDir = `${FileSystem.documentDirectory}app-images/`;
                const dirInfo = await FileSystem.getInfoAsync(appImagesDir);

                if (!dirInfo.exists) {
                    await FileSystem.makeDirectoryAsync(appImagesDir, { intermediates: true });
                }

                // Generate a unique filename with timestamp
                const fileName = `sign-${new Date().getTime()}.jpg`;
                const destUri = `${appImagesDir}${fileName}`;

                // Copy the file to the permanent location
                await FileSystem.copyAsync({
                    from: sourceUri,
                    to: destUri
                });

                setSignImageUrl(destUri);
            }
        } catch (error) {
            console.error('Error picking sign image:', error);
            Alert.alert('Error', 'Failed to pick sign image');
        }
    };

    async function saveImages() {
        try {

            // Update db andstore

            await updateInvoice(id, { ...invoice, logoImg: logoImageUrl || "", signImg: signImageUrl || "", currency: currency });
            addLogo(logoImageUrl || '');
            addSign(signImageUrl || '');
            addCurrency(currency);

            if (Platform.OS === 'android') {
                ToastAndroid.show('Images and currency updated.', ToastAndroid.SHORT);
            }
        } catch (error) {
            console.error('Error saving data:', error);
            Alert.alert('Error', 'Failed to Update');
        }
    }

    return (
        <View className=' border-t border-black/30 dark:border-white/50'>
            <View className=' p-4 pt-0'>
                <Text className=' dark:text-white text-2xl font-bold pt-8 text-center'>Logo image for Invoice</Text>

                <TouchableOpacity
                    className=" bg-[#00B2E7] text-black py-4 px-6 rounded-2xl mt-8 flex flex-row items-center justify-center gap-2"
                    onPress={pickLogoImage}
                >
                    <LinearGradient
                        colors={['#00B2E7', '#E064F7', '#FF8D6C']}
                        className='h-full w-full py-4 px-6 flex flex-col justify-between items-center text-center'
                        style={{ borderRadius: 16 }}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        {(logoImageUrl === null) ?
                            <Text className="text-white font-bold text-center text-base">Pick Logo Image</Text>
                            :
                            <View className='w-48 h-48 border rounded-2xl relative overflow-hidden'>
                                <Image source={{ uri: logoImageUrl }} className=' w-full h-full object-cover' />
                                <TouchableOpacity
                                    onPress={() => { setLogoImageUrl(null) }}
                                    className=' absolute right-2 top-2 bg-red-400 rounded-full p-2'>
                                    <Ionicons name='trash-bin' size={16} color={"white"} />
                                </TouchableOpacity>
                            </View>

                        }
                    </LinearGradient>
                </TouchableOpacity>

                <Text className=' dark:text-white text-2xl font-bold pt-8 text-center'>Sign image for Invoice</Text>

                <TouchableOpacity
                    className=" bg-[#00B2E7] text-black py-4 px-6 rounded-2xl mt-8 flex flex-1 items-center justify-center"
                    onPress={pickSignImage}
                >
                    {signImageUrl === null ?
                        <Text className="text-white font-bold text-center text-base">Pick Sign Image</Text>
                        :
                        <View className=' w-full aspect-video border rounded-2xl relative overflow-hidden'>
                            <Image source={{ uri: signImageUrl }} className=' w-full h-full object-cover' />
                            <TouchableOpacity
                                onPress={() => { setSignImageUrl(null) }}
                                className=' absolute right-2 top-2 bg-red-400 rounded-full p-2'>
                                <Ionicons name='trash-bin' size={16} color={"white"} />
                            </TouchableOpacity>
                        </View>
                    }
                </TouchableOpacity>

                <Text className=' dark:text-white text-2xl font-bold py-8 text-center'>Currency</Text>

                <View className='overflow-hidden rounded-2xl text-white'>
                    <Picker
                        onValueChange={(c, i) =>
                            setCurrency(c)
                        }
                        selectedValue={currency}
                        className=' text-white'
                        mode='dropdown'
                        style={{
                            backgroundColor: "#00B2E7",
                            color: "white"
                        }}
                        dropdownIconColor={'white'}
                    >
                        <Picker.Item
                            style={{
                                backgroundColor: "#00B2E7",
                                color: "white",
                            }}
                            label="None"
                            value="" />
                        <Picker.Item
                            style={{
                                backgroundColor: "#00B2E7",
                                color: "white",
                            }}
                            label="INR ₹"
                            value="₹" />
                        <Picker.Item
                            style={{
                                backgroundColor: "#00B2E7",
                                color: "white",
                            }}
                            label="USD $"
                            value="$" />
                        <Picker.Item
                            style={{
                                backgroundColor: "#00B2E7",
                                color: "white",
                            }}
                            label="EURO €"
                            value="€" />
                    </Picker>
                </View>
                <TouchableOpacity
                    className=" bg-[#00B2E7] text-white py-4 px-6 rounded-2xl mt-8 flex flex-row items-center justify-center gap-2 disabled:opacity-70"
                    disabled={logoImageUrl === null && signImageUrl === null && currency === ''}
                    onPress={saveImages}
                >
                    <Ionicons name="pencil" size={16} color='white' />
                    <Text className="text-white font-bold text-center text-base">Update Images and currency</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}