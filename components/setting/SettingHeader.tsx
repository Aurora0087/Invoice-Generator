import { View, Text, TouchableOpacity, Pressable } from 'react-native'
import React from 'react'
import { NativeStackHeaderProps } from '@react-navigation/native-stack'
import { Ionicons } from '@expo/vector-icons'
import { Link } from 'expo-router';
import { useTheme } from '@/context/theme.context';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SettingHeader({ navigation, route, options, back }: NativeStackHeaderProps) {

    const { theme, toggleTheme } = useTheme();

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

            <View className=' flex flex-row gap-2 items-center justify-end'>
                <Pressable onPress={toggleTheme} className='p-2'>
                    <Animated.View key={String(theme.dark)} entering={FadeInRight.duration(500)} exiting={FadeOutLeft.duration(500)}>
                        {theme.dark ?
                            <Ionicons name='sunny' size={24} color={'white'} />
                            :
                            <Ionicons name='moon' size={24} color={'black'} />
                        }
                    </Animated.View>
                </Pressable>
            </View>
        </View>
    )
}