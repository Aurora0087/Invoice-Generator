import { View, Text, useColorScheme, TouchableOpacity, TextInput, Platform, ToastAndroid, Alert } from 'react-native'
import React, { useState } from 'react'
import { NewInvoiceProp } from '@/store/store'
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { InvoiceInfoSchema, InvoiceInfoSchemaProp } from '@/schema/invoice-info';
import { formatDate, parseDate } from '@/utils';

import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { updateInvoice } from '@/db/db';

export default function InvoiceInfo({ invoice, addInvoiceInfo, id }: {
    invoice: NewInvoiceProp, id: number, addInvoiceInfo: (invoiceInfo: {
        invoiceNumber: string;
        orderId: string;
        date: string;
        dueDate: string;
    }) => void
}) {

    const [isDatePickerVisible, setDatePickerVisible] = useState(false);
    const [isDueDatePickerVisible, setDueDatePickerVisible] = useState(false);

    const { control, handleSubmit, formState: { errors } } = useForm<InvoiceInfoSchemaProp>({
        resolver: zodResolver(InvoiceInfoSchema),
        defaultValues: {
            invoiceNumber: invoice.invoiceInfo.invoiceNumber || '',
            orderId: invoice.invoiceInfo.orderId || '',
            date: parseDate(invoice.invoiceInfo.date) || new Date(),
            dueDate: parseDate(invoice.invoiceInfo.dueDate) || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
    });

    const onSubmit = async (data: InvoiceInfoSchemaProp) => {

        try {
            const formatedData = {
                invoiceNumber: data.invoiceNumber,
                orderId: data.orderId,
                date: formatDate(data.date),
                dueDate: formatDate(data.dueDate),
            };
            addInvoiceInfo(formatedData);
            await updateInvoice(id, { ...invoice, invoiceInfo: formatedData });
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
            <View className="p-6">
                <Text className="dark:text-white text-2xl font-bold py-8 text-center">Invoice Info</Text>

                {/* Invoice Number Input */}
                <Controller
                    control={control}
                    name="invoiceNumber"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <View className="mb-4">
                            <Text className="text-base font-medium mb-1 text-gray-700 dark:text-white">Invoice Id</Text>
                            <TextInput
                                className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-2xl p-3 text-base dark:text-white"
                                placeholder="Enter invoice id"
                                placeholderTextColor={placeholderColor}
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                            />
                            {errors.invoiceNumber && (
                                <Text className="text-red-500 text-sm mt-1">{errors.invoiceNumber.message}</Text>
                            )}
                        </View>
                    )}
                />

                {/* Order Id Input */}
                <Controller
                    control={control}
                    name="orderId"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <View className="mb-4">
                            <Text className="text-base font-medium mb-1 text-gray-700 dark:text-white">Order Id :</Text>
                            <TextInput
                                className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-2xl p-3 text-base dark:text-white"
                                placeholder="Enter order id"
                                placeholderTextColor={placeholderColor}
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                            />
                            {errors.orderId && (
                                <Text className="text-red-500 text-sm mt-1">{errors.orderId.message}</Text>
                            )}
                        </View>
                    )}
                />

                {/* Date Input */}
                <Controller
                    control={control}
                    name="date"
                    render={({ field: { onChange, value } }) => (
                        <View className="mb-4">
                            <Text className="text-base font-medium mb-1 text-gray-700 dark:text-white">Invoice Date</Text>

                            {/* Date display/button */}
                            <TouchableOpacity
                                onPress={() => setDatePickerVisible(true)}
                                className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-2xl p-3"
                            >
                                <Text className="text-gray-800 dark:text-gray-200">{formatDate(value)}</Text>
                            </TouchableOpacity>

                            {/* Modal Date picker */}
                            <DateTimePickerModal
                                isVisible={isDatePickerVisible}
                                mode="date"
                                onConfirm={(selectedDate) => {
                                    setDatePickerVisible(false);
                                    onChange(selectedDate);
                                }}
                                onCancel={() => setDatePickerVisible(false)}
                                date={value}
                            />

                            {errors.date && (
                                <Text className="text-red-500 text-sm mt-1">{errors.date.message}</Text>
                            )}
                        </View>
                    )}
                />

                {/* Due Date Input */}
                <Controller
                    control={control}
                    name="dueDate"
                    render={({ field: { onChange, value } }) => (
                        <View className="mb-4">
                            <Text className="text-base font-medium mb-1 text-gray-700 dark:text-white">Due Date</Text>

                            {/* Due date display/button */}
                            <TouchableOpacity
                                onPress={() => setDueDatePickerVisible(true)}
                                className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-2xl p-3"
                            >
                                <Text className="text-gray-800 dark:text-gray-200">{formatDate(value)}</Text>
                            </TouchableOpacity>

                            {/* Modal Due date picker */}
                            <DateTimePickerModal
                                isVisible={isDueDatePickerVisible}
                                mode="date"
                                minimumDate={new Date()}
                                onConfirm={(selectedDate) => {
                                    setDueDatePickerVisible(false);
                                    onChange(selectedDate);
                                }}
                                onCancel={() => setDueDatePickerVisible(false)}
                                date={value}
                            />

                            {errors.dueDate && (
                                <Text className="text-red-500 text-sm mt-1">{errors.dueDate.message}</Text>
                            )}
                        </View>
                    )}
                />

                <TouchableOpacity
                    className=" bg-[#00B2E7] text-white py-4 px-6 rounded-2xl mt-8 flex flex-row items-center justify-center gap-2"
                    onPress={handleSubmit(onSubmit)}
                >
                    <Text className="text-white font-bold text-center text-base">Update invoice info</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}