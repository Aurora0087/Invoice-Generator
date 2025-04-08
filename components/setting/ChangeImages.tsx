import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, Platform, ToastAndroid } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import * as ExpoImagePicker from 'expo-image-picker';

import * as FileSystem from 'expo-file-system';

import { Image } from 'react-native';
import { getSetting, saveSetting } from '@/db/db';
import { LinearGradient } from 'expo-linear-gradient';

export default function ChangeDefaultImages() {

    const [logoImageUrl, setLogoImageUrl] = useState<string | null>(null);
    const [signImageUrl, setSignImageUrl] = useState<string | null>(null);

    async function setUp() {
        try {
            // Load saved settings
            const savedLogo = await getSetting('logoImageUrl');
            const savedSign = await getSetting('signImageUrl');

            console.log(savedLogo);

            if (savedLogo) setLogoImageUrl(savedLogo);
            if (savedSign) setSignImageUrl(savedSign);

        } catch (error) {
            console.error('Error setting up database:', error);
            Alert.alert('Error', 'Failed to load saved settings');
        }
    }

    useEffect(() => {
        setUp();
    }, [])

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
                mediaTypes: 'images',
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
            console.error('Error picking or saving logo image:', error);
            Alert.alert('Failed to pick or save logo image', String(error));
        }
    }

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
            Alert.alert('Failed to pick sign image', String(error));
        }
    };


    async function saveImages() {
        try {
            // Save to SQLite
            if (logoImageUrl) await saveSetting('logoImageUrl', logoImageUrl);
            if (signImageUrl) await saveSetting('signImageUrl', signImageUrl);

            if (Platform.OS === 'android') {
                ToastAndroid.show('Images updated.', ToastAndroid.SHORT);
            }
        } catch (error) {
            console.error('Error saving data:', error);
            Alert.alert('Error', 'Failed to save settings');
        }
    }

    return (
        <View className=' py-4 border-t border-black/30 dark:border-white/50'>
            <Text className=' dark:text-white text-2xl font-bold text-center'>Logo image for Invoice</Text>

            <TouchableOpacity
                className=" bg-[#00B2E7] text-black rounded-2xl mt-8 flex flex-row items-center justify-center gap-2"
                onPress={pickLogoImage}
            >
                <LinearGradient
                    colors={['#00B2E7', '#E064F7', '#FF8D6C']}
                    className='h-full w-full py-4 px-6 flex flex-row justify-center gap-2 items-center text-center'
                    style={{ borderRadius: 16 }}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    {(logoImageUrl === null || logoImageUrl.length < 1) ?
                        <>
                            <Ionicons name="images" size={16} color='white' />
                            <Text className="text-white font-bold text-center text-base">Pick Logo Image</Text>
                        </>

                        :
                        <Image source={{ uri: logoImageUrl }} className='w-48 h-48 border rounded-2xl' />}
                </LinearGradient>

            </TouchableOpacity>

            <Text className=' dark:text-white text-2xl font-bold pt-8 text-center'>Sign image for Invoice</Text>

            <TouchableOpacity
                className=" bg-[#00B2E7] text-black rounded-2xl mt-8 flex flex-1 items-center justify-center"
                onPress={pickSignImage}
            >
                <LinearGradient
                    colors={['#00B2E7', '#E064F7', '#FF8D6C']}
                    className='h-full w-full py-4 px-6 flex flex-row justify-center gap-2 items-center text-center'
                    style={{ borderRadius: 16 }}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    {(signImageUrl === null || signImageUrl.length < 2) ?
                        <>
                            <Ionicons name="images" size={16} color='white' />
                            <Text className="text-white font-bold text-center text-base">Pick Sign Image</Text>
                        </>
                        :
                        <Image
                            source={{ uri: signImageUrl }}
                            className=' w-full aspect-video' />
                    }
                </LinearGradient>

            </TouchableOpacity>

            <TouchableOpacity
                className=" bg-[#00B2E7] text-white py-4 px-6 rounded-2xl mt-8 flex flex-row items-center justify-center gap-2 disabled:opacity-70"
                onPress={saveImages}
            >
                <Ionicons name="pencil" size={16} color='white' />
                <Text className="text-white font-bold text-center text-base">Update Default Images</Text>
            </TouchableOpacity>
        </View>
    )
}