import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, useColorScheme } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useStore } from '@/store/store';
import { RecipientInfoSchema, RecipientInfoSchemaProp } from '@/schema/recipient';
import Ionicons from '@expo/vector-icons/build/Ionicons';


export default function Recipient() {

    const router = useRouter();
    const { addRecipientInfo } = useStore();

    const { control, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(RecipientInfoSchema),
        defaultValues: {
            name: '',
            address: '',
            email: '',
            phone: ''
        }
    });

    const onSubmit = (data: RecipientInfoSchemaProp) => {
        addRecipientInfo(data)
        router.push('/generate/invoice-info')
    };

    const colorScheme = useColorScheme();
    const placeholderColor = colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.4)';

    return (
        <ScrollView className='flex-1 bg-gray-100 dark:bg-gray-900'>
            <View className=' p-6'>
                <Text className=' dark:text-white text-2xl font-bold py-8 text-center'>Client Info</Text>
                {/* Name Input */}
                <Controller
                    control={control}
                    name="name"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <View className="mb-4">
                            <Text className="text-base font-medium mb-1 text-gray-700 dark:text-white">Client's Full Name</Text>
                            <TextInput
                                className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-2xl p-3 text-base dark:text-white"
                                placeholder="Enter your Client's full name"
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
                            <Text className="text-base font-medium mb-1 text-gray-700 dark:text-white">Client's Address</Text>
                            <TextInput
                                className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-2xl p-3 text-base dark:text-white"
                                placeholder="Enter your Client's address"
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

                {/* Email Input */}
                <Controller
                    control={control}
                    name="email"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <View className="mb-4">
                            <Text className="text-base font-medium mb-1 text-gray-700 dark:text-white">Email ID</Text>
                            <TextInput
                                className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-2xl p-3 text-base dark:text-white"
                                placeholder="Enter your Client's Email ID (e.g., clname@example.com)"
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
                                placeholder="Enter your Client's Phone Number (e.g., 123-45-6789)"
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
                    <Text className="text-white font-bold text-center text-base">Next</Text>
                    <Ionicons name="arrow-forward" size={16} color='white' />
                </TouchableOpacity>
            </View>
        </ScrollView>
    )
}