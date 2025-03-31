import React from 'react'
import { Tabs, useRouter } from 'expo-router'
import TabBar from '@/components/TabBar';
import DefultHeader from '@/components/DefultHeader';
import { Header } from 'react-native/Libraries/NewAppScreen';

export default function TabLayout() {

    const router = useRouter();
    return (
        <Tabs
            tabBar={(props) => <TabBar {...props} />}
            screenOptions={{ header: (props) => <DefultHeader {...props} /> }}
        >
            <Tabs.Screen
                name='index'
                options={{
                    title: 'Home'
                }}
            />
            <Tabs.Screen
                name='generateInvoice'
                options={{
                    title: 'New',
                }}
                listeners={{
                    tabPress: (e) => {
                        e.preventDefault();
                        router.push("/generate")
                    }
                }}
            />
            <Tabs.Screen name='invoices/details/index' options={{
                title: 'Invoices',
            }} />
            <Tabs.Screen name='invoices/edit' options={{
                href: null,
            }} />
            <Tabs.Screen name='invoices/details/[id]' options={{
                href: null,
            }} />
            <Tabs.Screen name='preview' options={{
                href: null,
            }} />

        </Tabs>
    )
}