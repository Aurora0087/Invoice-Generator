import {
    View,
    Text,
    useColorScheme,
    TouchableOpacity,
    TextInput,
    Alert,
    ToastAndroid,
    Platform
} from 'react-native'
import React from 'react'
import { NewInvoiceProp } from '@/store/store'
import { SenderInfoSchema, SenderInfoSchemaProp } from '@/schema/sender'
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { updateInvoice } from '@/db/db';
import { Ionicons } from '@expo/vector-icons';

export default function SenderInfo({ invoice, id, addSenderInfo }: { invoice: NewInvoiceProp, id: number, addSenderInfo: (senderInfo: SenderInfoSchemaProp) => void }) {

    const { control, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(SenderInfoSchema),
        defaultValues: {
            name: invoice.senderInfo.name || '',
            address: invoice.senderInfo.address || '',
            taxId: invoice.senderInfo.taxId || '',
            email: invoice.senderInfo.email || '',
            phone: invoice.senderInfo.phone || ''
        }
    });

    const onSubmit = async (data: SenderInfoSchemaProp) => {
        try {
            addSenderInfo(data);
            await updateInvoice(id, { ...invoice, senderInfo: data });
            if (Platform.OS === 'android') {
                ToastAndroid.show('Sender info updated.', ToastAndroid.SHORT);
            }
        } catch (error) {
            Alert.alert('Unable to Update. error: ', String(error));
        }
    };

    const colorScheme = useColorScheme();
    const placeholderColor = colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.4)';
    return (
        <View>
            <View className=' p-6 pt-0'>
                <Text className=' dark:text-white text-2xl font-bold py-8 text-center'>Sender Info</Text>
                {/* Name Input */}
                <Controller
                    control={control}
                    name="name"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <View className="mb-4">
                            <Text className="text-base font-medium mb-1 text-gray-700 dark:text-white">Full Name</Text>
                            <TextInput
                                className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-2xl p-3 text-base dark:text-white"
                                placeholder="Enter your full name"
                                placeholderTextColor={placeholderColor}
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                            />
                            {errors.name && (
                                <Text className="text-red-500 text-sm mt-1">{errors.name.message}</Text>
                            )}
                        </View>
                    )}
                />

                {/* Address Input */}
                <Controller
                    control={control}
                    name="address"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <View className="mb-4">
                            <Text className="text-base font-medium mb-1 text-gray-700 dark:text-white">Address</Text>
                            <TextInput
                                className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-2xl p-3 text-base dark:text-white"
                                placeholder="Enter your address"
                                placeholderTextColor={placeholderColor}
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                                multiline
                                numberOfLines={5}
                            />
                            {errors.address && (
                                <Text className="text-red-500 text-sm mt-1">{errors.address.message}</Text>
                            )}
                        </View>
                    )}
                />

                {/* Tax ID Input */}
                <Controller
                    control={control}
                    name="taxId"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <View className="mb-4">
                            <Text className="text-base font-medium mb-1 text-gray-700 dark:text-white">Tax ID</Text>
                            <TextInput
                                className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-2xl p-3 text-base dark:text-white"
                                placeholder="Enter your tax ID (e.g., 123-45-6789)"
                                placeholderTextColor={placeholderColor}
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                            />
                            {errors.taxId && (
                                <Text className="text-red-500 text-sm mt-1">{errors.taxId.message}</Text>
                            )}
                        </View>
                    )}
                />

                {/* Email Input */}
                <Controller
                    control={control}
                    name="email"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <View className="mb-4">
                            <Text className="text-base font-medium mb-1 text-gray-700 dark:text-white">Email ID</Text>
                            <TextInput
                                className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-2xl p-3 text-base dark:text-white"
                                placeholder="Enter your Email ID (e.g., urname@example.com)"
                                placeholderTextColor={placeholderColor}
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                                keyboardType="email-address"
                            />
                            {errors.email && (
                                <Text className="text-red-500 text-sm mt-1">{errors.email.message}</Text>
                            )}
                        </View>
                    )}
                />
                {/* Phone Input */}
                <Controller
                    control={control}
                    name="phone"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <View className="mb-4">
                            <Text className="text-base font-medium mb-1 text-gray-700 dark:text-white">Phone number</Text>
                            <TextInput
                                className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-2xl p-3 text-base dark:text-white"
                                placeholder="Enter your Phone Number (e.g., 123-45-6789)"
                                placeholderTextColor={placeholderColor}
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                                keyboardType="phone-pad"
                            />
                            {errors.phone && (
                                <Text className="text-red-500 text-sm mt-1">{errors.phone.message}</Text>
                            )}
                        </View>
                    )}
                />

                <TouchableOpacity
                    className=" bg-[#00B2E7] text-white py-4 px-6 rounded-2xl mt-8 flex flex-row items-center justify-center gap-2"
                    onPress={handleSubmit(onSubmit)}
                >
                    <Ionicons name="pencil" size={16} color='white' />
                    <Text className="text-white font-bold text-center text-base">Update Sender info</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}