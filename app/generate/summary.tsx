import { useStore } from "@/store/store";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import { useRouter } from "expo-router";
import React from "react";
import { Image } from "react-native";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function InvoiceSummary() {

    const router = useRouter();
    const { newInvoice } = useStore();

    // Calculate subtotal
    const subtotal = newInvoice.ItemsInfo.items.reduce((total, item) =>
        total + (item.quantity * item.price), 0);

    let grandTotal = subtotal;

    // discount
    const discount = Number(newInvoice.ItemsInfo.discountAmount) || 0;

    grandTotal -= discount;

    // Tax calculation
    const taxRate = Number(newInvoice.ItemsInfo.taxParsentage) / 100 || 0;
    const tax = grandTotal * taxRate;
    grandTotal += tax;

    const shipping = Number(newInvoice.ItemsInfo.shipping) || 0;

    grandTotal += shipping;

    return (
        <ScrollView className="flex-1 bg-gray-100 dark:bg-gray-900">
            <View className="gap-4 p-6">
                {/* sender info */}
                <View className="gap-1 bg-gray-200 dark:bg-gray-700 border-b border-r dark:border-white p-2 rounded-2xl">
                    <Text className="dark:text-white text-2xl font-bold mb-4">From</Text>
                    <View className="flex gap-1">
                        <Text className="text-base font-medium dark:text-white">Sender Name :</Text>
                        <Text className="text-base font-medium mb-1 text-gray-700 dark:text-slate-400">
                            {newInvoice.senderInfo.name}</Text>
                    </View>
                    <View className="flex gap-1">
                        <Text className="text-base font-medium dark:text-white">Sender Address :</Text>
                        <Text className="text-base font-medium text-pretty mb-1 text-gray-700 dark:text-slate-400 flex-shrink">
                            {newInvoice.senderInfo.address}
                        </Text>
                    </View>
                    <View className="flex gap-1">
                        <Text className="text-base font-medium dark:text-white">Sender Tex Id :</Text>
                        <Text className="text-base font-medium mb-1 text-gray-700 dark:text-slate-400">
                            {newInvoice.senderInfo.taxId}
                        </Text>
                    </View>
                    <View className="flex gap-1">
                        <Text className="text-base font-medium dark:text-white">Sender Mail Id :</Text>
                        <Text className="text-base font-medium mb-1 text-gray-700 dark:text-slate-400">
                            {newInvoice.senderInfo.email}
                        </Text>
                    </View>
                    <View className="flex gap-1">
                        <Text className="text-base font-medium dark:text-white">Sender Phone Number :</Text>
                        <Text className="text-base font-medium mb-1 text-gray-700 dark:text-slate-400">
                            {newInvoice.senderInfo.phone}
                        </Text>
                    </View>
                </View>

                {/* Client info */}
                <View className="gap-1 bg-gray-200 dark:bg-gray-700 border-b border-r dark:border-white p-2 rounded-2xl">
                    <Text className="dark:text-white text-2xl font-bold mb-4">To</Text>
                    <View className="flex gap-1">
                        <Text className="text-base font-medium dark:text-white">Client Name :</Text>
                        <Text className="text-base font-medium mb-1 text-gray-700 dark:text-slate-400">
                            {newInvoice.recipientInfo.name}
                        </Text>
                    </View>
                    <View className="flex gap-1">
                        <Text className="text-base font-medium dark:text-white">Client Address :</Text>
                        <Text className="text-base font-medium text-pretty mb-1 text-gray-700 dark:text-slate-400 flex-shrink">
                            {newInvoice.recipientInfo.address}
                        </Text>
                    </View>
                    <View className="flex gap-1">
                        <Text className="text-base font-medium dark:text-white">Client Mail Id :</Text>
                        <Text className="text-base font-medium mb-1 text-gray-700 dark:text-slate-400">
                            {newInvoice.recipientInfo.email}
                        </Text>
                    </View>
                    <View className="flex gap-1">
                        <Text className="text-base font-medium dark:text-white">Client Phone Number :</Text>
                        <Text className="text-base font-medium mb-1 text-gray-700 dark:text-slate-400">
                            {newInvoice.recipientInfo.phone}
                        </Text>
                    </View>
                </View>

                {/* invoice info */}
                <View className="gap-1 bg-gray-200 dark:bg-gray-700 border-b border-r dark:border-white p-2 rounded-2xl">
                    <Text className="dark:text-white text-2xl font-bold mb-4">Invoice Details</Text>
                    <View className="flex gap-1">
                        <Text className="text-base font-medium dark:text-white">Invoice ID :</Text>
                        <Text className="text-base font-medium mb-1 text-gray-700 dark:text-slate-400">
                            {newInvoice.invoiceInfo.invoiceNumber}
                        </Text>
                    </View>
                    <View className="flex gap-1">
                        <Text className="text-base font-medium dark:text-white">Order ID :</Text>
                        <Text className="text-base font-medium mb-1 text-gray-700 dark:text-slate-400">
                            {newInvoice.invoiceInfo.orderId}
                        </Text>
                    </View>
                    <View className="flex gap-1">
                        <Text className="text-base font-medium dark:text-white">Date(dd/mm/yyyy) :</Text>
                        <Text className="text-base font-medium text-pretty mb-1 text-gray-700 dark:text-slate-400 flex-shrink">
                            {newInvoice.invoiceInfo.date}
                        </Text>
                    </View>
                    <View className="flex gap-1">
                        <Text className="text-base font-medium dark:text-white">Due Date(dd/mm/yyyy) :</Text>
                        <Text className="text-base font-medium mb-1 text-gray-700 dark:text-slate-400">
                            {newInvoice.invoiceInfo.dueDate}
                        </Text>
                    </View>
                </View>

                {/* Items info */}
                <View className="gap-1 bg-gray-200 dark:bg-gray-700 border-b border-r dark:border-white p-2 rounded-2xl">
                    <Text className="dark:text-white text-2xl font-bold mb-4">Items</Text>
                    <View className="flex-row justify-between mb-2">
                        <Text className="text-base flex-shrink font-bold dark:text-white w-1/3">Item</Text>
                        <Text className="text-base flex-shrink font-bold dark:text-white w-1/4 text-right">Qty</Text>
                        <Text className="text-base flex-shrink font-bold dark:text-white w-1/4 text-right">Price</Text>
                        <Text className="text-base flex-shrink font-bold dark:text-white w-1/4 text-right">Line total</Text>
                    </View>
                    {newInvoice.ItemsInfo.items.map((item, index) => (
                        <View
                            key={index}
                            className="flex-row justify-between py-2 border-b border-gray-200 dark:border-gray-700"
                        >
                            <Text className="text-base flex-shrink dark:text-white w-1/3">{item.name}</Text>
                            <Text className="text-base flex-shrink dark:text-white w-1/4 text-right">{item.quantity}</Text>
                            <Text className="text-base flex-shrink dark:text-white w-1/4 text-right">{newInvoice.currency}{item.price.toFixed(2)}</Text>
                            <Text className="text-base flex-shrink dark:text-white w-1/4 text-right">{newInvoice.currency}{(item.quantity * item.price).toFixed(2)}</Text>
                        </View>
                    ))}
                </View>

                {/* Total */}
                <View className="gap-1 bg-gray-200 dark:bg-gray-700 border-b border-r dark:border-white p-2 rounded-2xl">
                    <Text className="dark:text-white text-2xl font-bold mb-4">Totals</Text>
                    <View className="flex-row justify-between mb-2">
                        <Text className="text-base font-medium dark:text-white">Subtotal</Text>
                        <Text className="text-base font-medium dark:text-white">{newInvoice.currency}{subtotal.toFixed(2)}</Text>
                    </View>
                    <View className="flex-row justify-between mb-2">
                        <Text className="text-base font-medium dark:text-white">Discount</Text>
                        <Text className="text-base font-medium dark:text-white">-{newInvoice.currency}{discount}</Text>
                    </View>
                    <View className="flex-row justify-between mb-2">
                        <Text className="text-base font-medium dark:text-white">Tax ({taxRate * 100}%)</Text>
                        <Text className="text-base font-medium dark:text-white">{newInvoice.currency}{tax.toFixed(2)}</Text>
                    </View>
                    <View className="flex-row justify-between mb-2">
                        <Text className="text-base font-medium dark:text-white">Shipping</Text>
                        <Text className="text-base font-medium dark:text-white">{newInvoice.currency}{shipping}</Text>
                    </View>
                    <View className="flex-row justify-between mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <Text className="text-base font-bold dark:text-white">Grand Total</Text>
                        <Text className="text-base font-bold text-green-600 dark:text-green-400">{newInvoice.currency}{grandTotal.toFixed(2)}</Text>
                    </View>
                </View>

                <View className="bg-gray-200 dark:bg-gray-700 gap-1 border-b border-r dark:border-white p-2 rounded-2xl">
                    <View className="flex-row justify-between mb-2">
                        <Text className="text-base font-medium dark:text-white">Payed Amount</Text>
                        <Text className="text-base font-medium dark:text-white">{newInvoice.currency}{newInvoice.ItemsInfo.payed.toFixed(2)}</Text>
                    </View>
                    <View className="flex-row justify-between mb-2">
                        <Text className="text-base font-medium dark:text-white">Amount due</Text>
                        <Text className="text-base font-medium text-green-600 dark:text-green-400 ">{newInvoice.currency}{(grandTotal - newInvoice.ItemsInfo.payed).toFixed(2)}</Text>
                    </View>
                </View>

                {
                    newInvoice.logoImg.length > 1 &&
                    <Image source={{ uri: newInvoice.logoImg }} className='w-48 h-48 border rounded-2xl self-center' />
                }

                {
                    newInvoice.signImg.length > 1 &&
                    <Image source={{ uri: newInvoice.signImg }} className=' w-full aspect-video border rounded-2xl' />
                }

                <TouchableOpacity
                    className=" bg-[#00B2E7] text-white py-4 px-6 rounded-2xl mt-8 flex flex-row items-center justify-center gap-2"
                    onPress={() => { router.push('/generate/previewTemplates') }}
                >
                    <Ionicons name="document" size={16} color='white' />
                    <Text className="text-white font-bold text-center text-base">Preview invoice Paper</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    )
}