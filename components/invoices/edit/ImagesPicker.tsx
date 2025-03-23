import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { CurrencyProp, NewInvoiceProp } from '@/store/store';
import { Ionicons } from '@expo/vector-icons';

import * as ExpoImagePicker from 'expo-image-picker';
import RNPickerSelect from 'react-native-picker-select';

import { Image } from 'react-native';

export default function ImagesPicker({ invoice, addCurrency, addLogo, addSign }: { invoice: NewInvoiceProp, addCurrency: (currency: CurrencyProp) => void, addLogo: (imgUrl: string) => void, addSign: (imgUrl: string) => void }) {

    const [logoImageUrl, setLogoImageUrl] = useState<string | null>(invoice.logoImg);
    const [signImageUrl, setSignImageUrl] = useState<string | null>(invoice.signImg);

    const [currency, setCurrency] = useState<CurrencyProp>(invoice.currency);

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

    function saveImages() {

    }

    return (
        <View>
            <View className=' p-4'>
                <Text className=' dark:text-white text-2xl font-bold pt-8 text-center'>Logo image for Invoice</Text>

                <TouchableOpacity
                    className=" bg-blue-400 text-black py-4 px-6 rounded-2xl mt-8 flex flex-row items-center justify-center gap-2"
                    onPress={pickLogoImage}
                >
                    {logoImageUrl === null ?
                        <Text className="text-white font-bold text-center text-base">Pick Logo Image</Text>
                        :
                        <Image source={{ uri: logoImageUrl }} className='w-48 h-48 border rounded-2xl' />}
                </TouchableOpacity>

                <Text className=' dark:text-white text-2xl font-bold pt-8 text-center'>Sign image for Invoice</Text>

                <TouchableOpacity
                    className=" bg-blue-400 text-black py-4 px-6 rounded-2xl mt-8 flex flex-1 items-center justify-center"
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

                <View className=' bg-blue-400 rounded-2xl text-white'>
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
                    className=" bg-blue-400 text-white py-4 px-6 rounded-2xl mt-8 flex flex-row items-center justify-center gap-2 disabled:opacity-70"
                    disabled={logoImageUrl === null && signImageUrl === null && currency === ''}
                    onPress={saveImages}
                >
                    <Ionicons name="save" size={16} color='white' />
                    <Text className="text-white font-bold text-center text-base">Update </Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}