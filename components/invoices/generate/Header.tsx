import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { NativeStackHeaderProps } from '@react-navigation/native-stack'
import { Ionicons } from '@expo/vector-icons'
import { Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function InvoiceGenHeader({ navigation, route, options, back }: NativeStackHeaderProps) {


    const insets = useSafeAreaInsets();

    return (
        <View
            style={{
                paddingTop: insets.top,
            }}
            className=' bg-white dark:bg-black border-b border-black/20 dark:border-white/50 flex flex-row gap-1 justify-between items-center p-4'>

            {back ? <TouchableOpacity
                className=" p-2 rounded-2xl flex flex-row items-center justify-center gap-2"
                onPress={() => { navigation.goBack() }}
            >
                <Ionicons name="arrow-back" size={24} color='#00B2E7' />
                <Text className=' text-black dark:text-white text-xl'>Back</Text>
            </TouchableOpacity>
                : undefined
            }
            <Link href="/(tabs)" asChild>
                <TouchableOpacity
                    className=" p-2 rounded-2xl flex flex-row items-center justify-center gap-2"
                >
                    <Ionicons name="home" size={24} color='#00B2E7' />
                </TouchableOpacity>
            </Link>
            <Link href="/setting" asChild>
                <TouchableOpacity
                    className=" p-2 rounded-2xl flex flex-row items-center justify-center gap-2"
                >
                    <Ionicons name="settings" size={24} color="#00B2E7" />
                </TouchableOpacity>
            </Link>

        </View>
    )
}