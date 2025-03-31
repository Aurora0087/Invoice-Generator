import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { BottomTabHeaderProps } from '@react-navigation/bottom-tabs'
import { Ionicons } from '@expo/vector-icons'

import { getHeaderTitle } from '@react-navigation/elements';
import { Link } from 'expo-router';

export default function DefultHeader({ navigation, route, options }: BottomTabHeaderProps) {
    const title = getHeaderTitle(options, route.name);
    return (
        <View className=' min-h-28 bg-white dark:bg-black border-b border-black/20 dark:border-white/50 flex flex-row gap-1 justify-between items-center p-4 pt-16'>
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