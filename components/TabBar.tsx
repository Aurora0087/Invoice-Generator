import { View, Pressable, LayoutChangeEvent } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useEffect, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';


const icons = [
    (props?: any) => <Ionicons name='home-outline' size={16} {...props} />,
    (props?: any) => <Ionicons name='add' size={16} {...props} />,
    (props?: any) => <Ionicons name='document-text-outline' size={16} {...props} />,
    (props?: any) => <Ionicons name='bar-chart-outline' size={16} {...props} />,
]

export default function TabBar({ state, descriptors, navigation, }: BottomTabBarProps) {
    const { colors } = useTheme();

    const [diementions, setDiementions] = useState({ h: 20, w: 100 });


    const onTabBarLayout = (e: LayoutChangeEvent) => {
        setDiementions({
            h: e.nativeEvent.layout.height,
            w: e.nativeEvent.layout.width
        });
    }

    const buttonW = diementions.w / icons.length;

    const tabPositionX = useSharedValue(0);

    const animatedTabStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: tabPositionX.value }
            ]
        }
    })

    useEffect(() => {
        tabPositionX.value = withSpring(buttonW * state.index - (state.index === 3 ? 0 : state.index > 0 ? 6 : 0), { duration: 800 });
    }, [state])

    return (
        <View className=' relative w-full flex justify-center items-center'>
            <View className=' absolute bottom-2 w-fit'>
                <View onLayout={onTabBarLayout} className=' relative bg-white flex justify-center shadow border border-black/10 items-center flex-row gap-[32px] p-[8px] px-[16px] bottom-4 rounded-full overflow-hidden'>
                    <Animated.View style={[{
                        height: diementions.h - 16,
                        width: buttonW - 16
                    }, animatedTabStyle]} className=' absolute left-0 mx-[8px]' >
                        <LinearGradient
                            colors={['#FF8D6C', '#E064F7', '#00B2E7']}
                            className='h-full w-full'
                            style={{ borderRadius: 99999 }}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        ></LinearGradient>
                    </Animated.View>

                    {state.routes.map((route, index) => {
                        const { options } = descriptors[route.key];

                        if (!options.title) {
                            return
                        }

                        const label =
                            options.tabBarLabel !== undefined
                                ? options.tabBarLabel
                                : options.title !== undefined
                                    ? options.title
                                    : route.name;

                        const isFocused = state.index === index;

                        const onPress = () => {
                            const event = navigation.emit({
                                type: 'tabPress',
                                target: route.key,
                                canPreventDefault: true,
                            });

                            if (!isFocused && !event.defaultPrevented) {
                                navigation.navigate(route.name, route.params);
                            }
                        };

                        const onLongPress = () => {
                            navigation.emit({
                                type: 'tabLongPress',
                                target: route.key,
                            });
                        };

                        const scale = useSharedValue(0);

                        useEffect(() => {
                            scale.value = withSpring(typeof isFocused === 'boolean' ? (isFocused ? 1 : 0) : isFocused,
                                { duration: 350 }
                            );
                        }, [isFocused])

                        const animatedIconStyle = useAnimatedStyle(() => {
                            const scalValue = interpolate(scale.value, [0, 1], [1, 1.2]);

                            const top = interpolate(scale.value, [0, 1], [0, 9]);
                            return {
                                transform: [{
                                    scale: scalValue
                                }],
                                top
                            }
                        })

                        const animatedTextStyle = useAnimatedStyle(() => {
                            const opacity = interpolate(scale.value, [0, 1], [1, 0]);
                            const scalValue = interpolate(scale.value, [0, 1], [1, 0]);
                            return {
                                opacity,
                                transform: [{
                                    scale: scalValue
                                }],
                            }
                        })
                        return (
                            <Pressable
                                key={route.name}
                                accessibilityState={isFocused ? { selected: true } : {}}
                                accessibilityLabel={options.tabBarAccessibilityLabel}
                                testID={options.tabBarButtonTestID}
                                onPress={onPress}
                                onLongPress={onLongPress}
                                className='flex justify-center items-center w-fit p-1'
                            >

                                <Animated.View style={animatedIconStyle}>
                                    {icons[index]({
                                        color: isFocused ? "white" : colors.text
                                    })}
                                </Animated.View>

                                <Animated.Text style={[animatedTextStyle]}>
                                    {label.toString()}
                                </Animated.Text>
                            </Pressable>
                        );
                    })}
                </View>
            </View>
        </View>

    );
}