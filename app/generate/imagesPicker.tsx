import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Platform, ToastAndroid } from 'react-native';
import { useRouter } from 'expo-router';
import { CurrencyProp, useStore } from '@/store/store';
import { Ionicons } from '@expo/vector-icons';

import * as ExpoImagePicker from 'expo-image-picker';
import RNPickerSelect from 'react-native-picker-select';

import * as FileSystem from 'expo-file-system';

import { Image } from 'react-native';
import { getSetting, initDatabase, saveSetting } from '@/db/db';
import { LinearGradient } from 'expo-linear-gradient';


export default function ImagePicker() {

    const [logoImageUrl, setLogoImageUrl] = useState<string | null>(null);
    const [signImageUrl, setSignImageUrl] = useState<string | null>(null);

    const [currency, setCurrency] = useState<CurrencyProp>('');
    const [isLoading, setIsLoading] = useState(true);

    const router = useRouter();

    const { addLogo, addSign, addCurrency } = useStore();

    useEffect(() => {
        async function setUp() {
            try {
                await initDatabase();

                // Load saved settings
                const savedLogo = await getSetting('logoImageUrl');
                const savedSign = await getSetting('signImageUrl');
                const savedCurrency = await getSetting('currency');

                if (savedLogo) setLogoImageUrl(savedLogo);
                if (savedSign) setSignImageUrl(savedSign);
                if (savedCurrency) setCurrency(savedCurrency as CurrencyProp);

                // Update store with saved values
                if (savedLogo) addLogo(savedLogo);
                if (savedSign) addSign(savedSign);
                if (savedCurrency) addCurrency(savedCurrency as CurrencyProp);

            } catch (error) {
                console.error('Error setting up database:', error);
                Alert.alert('Error', 'Failed to load saved settings');
            } finally {
                setIsLoading(false);
            }
        }

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

    function skipOnPress() {
        addLogo('');
        addSign('');
        addCurrency('');
        router.push('/generate/summary');
    }
    async function saveImages() {
        try {
            setIsLoading(true);

            // Save to SQLite
            if (logoImageUrl) await saveSetting('logoImageUrl', logoImageUrl);
            if (signImageUrl) await saveSetting('signImageUrl', signImageUrl);
            await saveSetting('currency', currency);

            // Update store
            addLogo(logoImageUrl || '');
            addSign(signImageUrl || '');
            addCurrency(currency);

            if (Platform.OS === 'android') {
                ToastAndroid.show('Images and currency updated.', ToastAndroid.SHORT);
            }

            // Navigate to summary
            router.push('/generate/summary');
        } catch (error) {
            console.error('Error saving data:', error);
            Alert.alert('Error', 'Failed to save settings');
        } finally {
            setIsLoading(false);
        }
    }

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
                <ActivityIndicator size="large" color="#4299e1" />
                <Text className="mt-4 dark:text-white">Loading...</Text>
            </View>
        );
    }

    return (
        <ScrollView className='flex-1 bg-gray-100 dark:bg-gray-900'>
            <View className=' p-6'>
                <TouchableOpacity
                    className=" bg-slate-700 text-white py-4 px-6 rounded-2xl mt-8 flex flex-row items-center justify-center gap-2"
                    onPress={skipOnPress}
                >
                    <Text className="text-white font-bold text-center text-base">Skip</Text>
                    <Ionicons name="play-skip-forward" size={16} color='white' />
                </TouchableOpacity>
                <Text className=' dark:text-white text-2xl font-bold pt-8 text-center'>Logo image for Invoice</Text>

                <TouchableOpacity
                    className=" bg-[#00B2E7] text-black rounded-2xl mt-8 flex flex-row items-center justify-center gap-2"
                    onPress={pickLogoImage}
                >
                    <LinearGradient
                        colors={['#00B2E7', '#E064F7', '#FF8D6C']}
                        className='h-full w-full py-4 px-6 flex flex-col justify-between items-center text-center'
                        style={{ borderRadius: 16 }}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        {logoImageUrl === null ?
                            <Text className="text-white font-bold text-center text-base">Pick Logo Image</Text>
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
                        className='h-full w-full py-4 px-6 flex flex-col justify-between items-center text-center'
                        style={{ borderRadius: 16 }}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        {signImageUrl === null ?
                            <Text className="text-white font-bold text-center text-base">Pick Sign Image</Text>
                            :
                            <Image
                                source={{ uri: signImageUrl }}
                                className=' w-full aspect-video' />
                        }
                    </LinearGradient>

                </TouchableOpacity>

                <Text className=' dark:text-white text-2xl font-bold py-8 text-center'>Currency</Text>

                <View className=' bg-[#00B2E7] rounded-2xl text-white'>
                    <RNPickerSelect
                        onValueChange={(c, i) =>
                            setCurrency(c)
                        }
                        value={currency}
                        placeholder={{ label: 'Select currency', value: '' }}
                        items={[
                            { label: 'None', value: '' },
                            { label: 'INR ₹', value: '₹' },
                            { label: 'USD $', value: '$' },
                            { label: 'EURO €', value: '€' },
                        ]}
                    />
                </View>
                <TouchableOpacity
                    className=" bg-[#00B2E7] text-white py-4 px-6 rounded-2xl mt-8 flex flex-row items-center justify-center gap-2 disabled:opacity-70"
                    disabled={logoImageUrl === null && signImageUrl === null && currency === ''}
                    onPress={saveImages}
                >
                    <Ionicons name="save" size={16} color='white' />
                    <Text className="text-white font-bold text-center text-base">Save and go to Summary</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}