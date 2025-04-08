import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, useColorScheme } from 'react-native';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ItemsSchema, ItemsSchemaProp } from '@/schema/items';
import { useStore } from '@/store/store';


export default function Items() {

    const router = useRouter();

    const { addItemsInfo } = useStore();

    const { control, handleSubmit, formState: { errors }, watch } = useForm<ItemsSchemaProp>({
        resolver: zodResolver(ItemsSchema),
        defaultValues: {
            items: [
                {
                    name: 'Item 1',
                    quantity: 1,
                    price: 1,
                }
            ],
            discountAmount: 0,
            taxParsentage: 0,
            shipping: 0,
            payed: 0,
        },
        mode: 'onChange', // This ensures validation and updates happen on each change
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "items",
    });

    // Watch all items to calculate the total
    const items = watch("items");
    const discount = watch("discountAmount");
    const tax = watch("taxParsentage");
    const shippingAmount = watch("shipping");

    const payedAmount = watch("payed");

    // Calculate total directly from watched items
    const calculateTotal = () => {
        let totalSum = 0;

        if (items) {
            items.forEach(item => {
                const quantity = Number(item.quantity) || 0;
                const price = Number(item.price) || 0;
                totalSum += quantity * price;
            });
        }
        if (!isNaN(Number(discount))) {
            totalSum = totalSum - Number(discount);
        }


        if (!isNaN(Number(tax))) {
            totalSum = totalSum + (totalSum * (Number(tax) / 100));
        }

        if (!isNaN(Number(shippingAmount))) {
            totalSum = totalSum + Number(shippingAmount);
        }

        let amountDue = totalSum;

        if (!isNaN(Number(payedAmount))) {
            amountDue = totalSum - Number(payedAmount);
        }

        return { totalSum, amountDue };
    };

    // Calculate total once whenever the component renders
    const { totalSum, amountDue } = calculateTotal();

    const onSubmit = (data: ItemsSchemaProp) => {
        addItemsInfo(data)
        router.push('/generate/imagesPicker');
    };

    const colorScheme = useColorScheme();
    const placeholderColor = colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.4)';

    return (
        <ScrollView className="flex-1 bg-gray-100 dark:bg-gray-900">
            <View className="p-6">
                <Text className="dark:text-white text-2xl font-bold py-8 text-center">Items</Text>

                {fields.map((field, index) => (
                    <View key={field.id} className="mb-6 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        <View className="flex-row justify-between items-center mb-2">
                            <Text className="text-lg font-semibold text-gray-800 dark:text-white">Item #{index + 1}</Text>
                            {fields.length > 1 && (
                                <TouchableOpacity
                                    onPress={() => remove(index)}
                                    className="bg-red-500 p-2 rounded-2xl"
                                >
                                    <Ionicons name="trash-outline" size={16} color="white" />
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Item Name */}
                        <Controller
                            control={control}
                            name={`items.${index}.name`}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <View className="mb-4">
                                    <Text className="text-base font-medium mb-1 text-gray-700 dark:text-white">Item Name</Text>
                                    <TextInput
                                        className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-2xl p-3 text-base dark:text-white"
                                        placeholder="Enter item name"
                                        placeholderTextColor={placeholderColor}
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                        value={value}
                                    />
                                    {errors.items?.[index]?.name && (
                                        <Text className="text-red-500 text-sm mt-1">{errors.items[index]?.name?.message}</Text>
                                    )}
                                </View>
                            )}
                        />

                        {/* Item Quantity */}
                        <Controller
                            control={control}
                            name={`items.${index}.quantity`}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <View className="mb-4">
                                    <Text className="text-base font-medium mb-1 text-gray-700 dark:text-white">Quantity</Text>
                                    <TextInput
                                        className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-2xl p-3 text-base dark:text-white"
                                        placeholder="Enter quantity"
                                        placeholderTextColor={placeholderColor}
                                        onBlur={onBlur}
                                        onChangeText={(val) => onChange(val)}
                                        value={value?.toString()}
                                        keyboardType="numeric"
                                    />
                                    {errors.items?.[index]?.quantity && (
                                        <Text className="text-red-500 text-sm mt-1">{errors.items[index]?.quantity?.message}</Text>
                                    )}
                                </View>
                            )}
                        />

                        {/* Item Price */}
                        <Controller
                            control={control}
                            name={`items.${index}.price`}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <View className="mb-2">
                                    <Text className="text-base font-medium mb-1 text-gray-700 dark:text-white">Price</Text>
                                    <TextInput
                                        className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-2xl p-3 text-base dark:text-white"
                                        placeholder="Enter price"
                                        placeholderTextColor={placeholderColor}
                                        onBlur={onBlur}
                                        onChangeText={(val) => onChange(val)}
                                        value={value?.toString()}
                                        keyboardType="decimal-pad"
                                    />
                                    {errors.items?.[index]?.price && (
                                        <Text className="text-red-500 text-sm mt-1">{errors.items[index]?.price?.message}</Text>
                                    )}
                                </View>
                            )}
                        />

                        {/* Item Subtotal */}
                        <View className="flex-row justify-end mt-2">
                            <Text className="text-base font-medium text-gray-700 dark:text-white">
                                Subtotal: {calculateItemSubtotal(items[index])}
                            </Text>
                        </View>
                    </View>
                ))}

                {errors.items && !Array.isArray(errors.items) && (
                    <Text className="text-red-500 text-sm mb-4">{errors.items.message}</Text>
                )}

                {/* Add Item Button */}
                <TouchableOpacity
                    className="border-2 border-dashed border-gray-300 dark:border-gray-600 py-4 rounded-2xl mt-2 mb-6 flex-row justify-center items-center"
                    onPress={() => append({ name: '', quantity: 1, price: 0 })}
                >
                    <Ionicons name="add-circle-outline" size={20} color="#4B5563" />
                    <Text className="text-gray-600 dark:text-gray-400 ml-2 font-medium">Add Another Item</Text>
                </TouchableOpacity>

                {/* Discount amount */}
                <Controller
                    control={control}
                    name="discountAmount"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <View className="mb-4">
                            <Text className="text-base font-medium mb-1 text-gray-700 dark:text-white">Discount Amount</Text>
                            <TextInput
                                className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-2xl p-3 text-base dark:text-white"
                                placeholder="0"
                                placeholderTextColor={placeholderColor}
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value.toString()}
                                keyboardType="decimal-pad"
                            />
                            {errors.discountAmount && (
                                <Text className="text-red-500 text-sm mt-1">{errors.discountAmount.message}</Text>
                            )}
                        </View>
                    )}
                />


                {/* Tax Persentage */}

                <Controller
                    control={control}
                    name="taxParsentage"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <View className="mb-4">
                            <Text className="text-base font-medium mb-1 text-gray-700 dark:text-white">Tax %</Text>
                            <TextInput
                                className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-2xl p-3 text-base dark:text-white"
                                placeholder="0"
                                placeholderTextColor={placeholderColor}
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value.toString()}
                                keyboardType="decimal-pad"
                            />
                            {errors.taxParsentage && (
                                <Text className="text-red-500 text-sm mt-1">{errors.taxParsentage.message}</Text>
                            )}
                        </View>
                    )}
                />

                {/* Shipping Amount */}
                <Controller
                    control={control}
                    name="shipping"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <View className="mb-4">
                            <Text className="text-base font-medium mb-1 text-gray-700 dark:text-white">Shipping Amount</Text>
                            <TextInput
                                className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-2xl p-3 text-base dark:text-white"
                                placeholder="0"
                                placeholderTextColor={placeholderColor}
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value.toString()}
                                keyboardType="decimal-pad"
                            />
                            {errors.shipping && (
                                <Text className="text-red-500 text-sm mt-1">{errors.shipping.message}</Text>
                            )}
                        </View>
                    )}
                />

                {/* Total */}
                <View className="bg-gray-100 dark:bg-gray-800 p-4 rounded-2xl mb-6">
                    <Text className="text-xl font-bold text-gray-800 dark:text-white text-right">
                        Total: {totalSum.toFixed(2)}
                    </Text>
                </View>

                {/* Payed Amount */}
                <Controller
                    control={control}
                    name="payed"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <View className="mb-4">
                            <Text className="text-base font-medium mb-1 text-gray-700 dark:text-white">Payed Amount</Text>
                            <TextInput
                                className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-2xl p-3 text-base dark:text-white"
                                placeholder="0"
                                placeholderTextColor={placeholderColor}
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value.toString()}
                                keyboardType="decimal-pad"
                            />
                            {errors.payed && (
                                <Text className="text-red-500 text-sm mt-1">{errors.payed.message}</Text>
                            )}
                        </View>
                    )}
                />

                {/* Due Amount */}
                <View className="bg-gray-100 dark:bg-gray-800 p-4 rounded-2xl mb-6">
                    <Text className="text-xl font-bold text-gray-800 dark:text-white text-right">
                        Amount due: {amountDue.toFixed(2)}
                    </Text>
                </View>

                {/* Next Button */}
                <TouchableOpacity
                    className=" bg-[#00B2E7] text-white py-4 px-6 rounded-2xl mt-8 flex flex-row items-center justify-center gap-2"
                    onPress={handleSubmit(onSubmit)}
                >
                    <Text className="text-white font-bold text-center text-base">Next</Text>
                    <Ionicons name="arrow-forward" size={16} color='white' />
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

// Helper function to calculate subtotal for each item
function calculateItemSubtotal(item: { name: string; quantity: number; price: number; }) {
    if (!item) return "0.00";
    const quantity = Number(item.quantity) || 0;
    const price = Number(item.price) || 0;
    return (quantity * price).toFixed(2);
}