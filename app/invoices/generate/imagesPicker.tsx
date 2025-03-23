import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { CurrencyProp, useStore } from '@/store/store';
import { Ionicons } from '@expo/vector-icons';

import * as ExpoImagePicker from 'expo-image-picker';
import RNPickerSelect from 'react-native-picker-select';

import { Image } from 'react-native';
import { getSetting, initDatabase, saveSetting } from '@/db/db';


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
            const result = await ExpoImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            });

            if (!result.canceled) {
                setLogoImageUrl(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error picking logo image:', error);
            Alert.alert('Error', 'Failed to pick logo image');
        }
    };

    async function pickSignImage() {
        try {
            const result = await ExpoImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [16, 9],
                quality: 1,
            });

            if (!result.canceled) {
                setSignImageUrl(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error picking sign image:', error);
            Alert.alert('Error', 'Failed to pick sign image');
        }
    };

    function skipOnPress() {
        addLogo('');
        addSign('');
        addCurrency('');
        router.push('/invoices/generate/summary');
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

            // Navigate to summary
            router.push('/invoices/generate/summary');
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
        <ScrollView className='flex-1 bg-white dark:bg-gray-900'>
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
                    className=" bg-[#00B2E7] text-black py-4 px-6 rounded-2xl mt-8 flex flex-row items-center justify-center gap-2"
                    onPress={pickLogoImage}
                >
                    {logoImageUrl === null ?
                        <Text className="text-white font-bold text-center text-base">Pick Logo Image</Text>
                        :
                        <Image source={{ uri: logoImageUrl }} className='w-48 h-48 border rounded-2xl' />}
                </TouchableOpacity>

                <Text className=' dark:text-white text-2xl font-bold pt-8 text-center'>Sign image for Invoice</Text>

                <TouchableOpacity
                    className=" bg-[#00B2E7] text-black py-4 px-6 rounded-2xl mt-8 flex flex-1 items-center justify-center"
                    onPress={pickSignImage}
                >
                    {signImageUrl === null ?
                        <Text className="text-white font-bold text-center text-base">Pick Sign Image</Text>
                        :
                        <Image
                            source={{ uri: signImageUrl }}
                            className=' w-full aspect-video' />
                    }
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