import { View, Text, ScrollView, Switch } from 'react-native'
import React from 'react'
import { useTheme } from '@/context/theme.context'

export default function setting() {

    const { theme, toggleTheme } = useTheme();

    return (
        <ScrollView className=' flex-1 p-4 py-8 dark:bg-slate-900 dark:text-white'>
            <View className=' flex flex-row gap-2 items-center'>
                <Text className=' text-center text-xl text-black dark:text-white'>
                    Dark Theme:
                </Text>
                <Text className=' text-center text-xl text-black dark:text-white'>
                    {theme.dark ? "On" : "Off"}
                </Text>
                <Switch value={theme.dark} onChange={toggleTheme} />
            </View>
        </ScrollView>
    )
}