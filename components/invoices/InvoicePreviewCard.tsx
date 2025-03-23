import { View, Text, TouchableHighlight } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router';

export default function InvoicePreviewCard({ amount, date, id, invoiceNumber, recipientName, currency }: { id: number, invoiceNumber: string, recipientName: string, date: string, amount: number, currency: string }) {
    const router = useRouter();
    return (
        <TouchableHighlight onPress={() => {
            router.push(`/invoices/details/${id}`)
        }}>
            <View className="bg-gray-700 p-4 rounded-2xl my-2 flex flex-row justify-between">
                <View>
                    <Text className="text-white font-bold">{invoiceNumber}</Text>
                    <Text className="text-gray-400">{recipientName}</Text>
                    <Text className="text-gray-400">{date}</Text>
                </View>
                <Text className="text-green-400 font-bold">{currency}{amount}</Text>
            </View>
        </TouchableHighlight>
    )
}