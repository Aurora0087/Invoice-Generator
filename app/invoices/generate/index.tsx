import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, useColorScheme } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useStore } from '@/store/store';
import { SenderInfoSchema, SenderInfoSchemaProp } from '@/schema/sender';
import Ionicons from '@expo/vector-icons/build/Ionicons';
import { getSetting, initDatabase, saveSetting } from '@/db/db';

export default function GenerateInvoice() {

  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();

  const { addSenderInfo } = useStore();
  const { control, setValue, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(SenderInfoSchema),
    defaultValues: {
      name: '',
      address: '',
      taxId: '',
      email: '',
      phone: ''
    }
  });

  useEffect(() => {
    async function setUp() {
      try {
        await initDatabase();

        // Load saved settings
        const senderName = await getSetting('defaultSenderName');
        const senderAddress = await getSetting('defaultSenderAddress');
        const senderEmail = await getSetting('defaultSenderEmail');
        const senderTaxId = await getSetting('defaultSenderTaxId');
        const senderPhone = await getSetting('defaultSenderPhone');

        // Create form values object with fallbacks
        const formValues = {
          name: senderName || '',
          address: senderAddress || '',
          email: senderEmail || '',
          taxId: senderTaxId || '',
          phone: senderPhone || ''
        };

        // Set form values
        setValue('name', formValues.name);
        setValue('address', formValues.address);
        setValue('email', formValues.email);
        setValue('taxId', formValues.taxId);
        setValue('phone', formValues.phone);

      } catch (error) {
        console.error('Error in setUp:', error);
      } finally {
        setIsLoading(false);
      }
    }

    setUp();
  }, []);

  // save data in db
  async function saveSenderInfo(data: SenderInfoSchemaProp) {
    await saveSetting('defaultSenderName', data.name);
    await saveSetting('defaultSenderAddress', data.address);
    if (data.email) await saveSetting('defaultSenderEmail', data.email);
    if (data.taxId) await saveSetting('defaultSenderTaxId', data.taxId);
    if (data.phone) await saveSetting('defaultSenderPhone', data.phone);
  }

  const onSubmit = (data: SenderInfoSchemaProp) => {
    addSenderInfo(data)
    saveSenderInfo(data);
    router.push('/invoices/generate/recipient')
  };

  const colorScheme = useColorScheme();
  const placeholderColor = colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.4)';

  return (
    <ScrollView className='flex-1 bg-white dark:bg-gray-900'>
      <View className=' p-6'>
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
          <Text className="text-white font-bold text-center text-base">Next</Text>
          <Ionicons name="arrow-forward" size={16} color='white' />
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}