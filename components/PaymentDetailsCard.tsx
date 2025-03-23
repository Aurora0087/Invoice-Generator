import { View, Text, Dimensions } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient';

export default function PaymentDetailsCard({ currency, paidAmount, unpaidAmount }: {
    currency: string,
    paidAmount: number,
    unpaidAmount: number
}) {
    return (
        <View style={{
            width: Dimensions.get('window').width - 32,
            height: Dimensions.get('window').width / 2
        }}
            className=' rounded-2xl'
        >
            <LinearGradient
                colors={['#00B2E7', '#E064F7', '#FF8D6C']}
                className='p-8 h-full flex flex-col justify-between items-center text-center'
                style={{ borderRadius: 16 }}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View>
                    <Text className=' text-white text-center text-sm'>Currency : {currency === '' ? 'NONE' : currency}</Text>
                    <Text className=' text-white text-center'>Total Invoices Created</Text>
                    <Text
                        style={{
                            fontSize: 64,
                            lineHeight: 70
                        }}
                        className=' text-white text-2xl font-bold text-center'>{currency}{(paidAmount + unpaidAmount).toFixed(2)}</Text>
                </View>
                <View className=' flex flex-row w-full justify-between'>
                    <View>
                        <Text className=' text-white text-center text-sm'>Payed</Text>
                        <Text className=' text-white text-center text-xl'>{currency}{paidAmount.toFixed(2)}</Text>
                    </View>
                    <View>
                        <Text className=' text-white text-center text-sm'>Unpayed</Text>
                        <Text className=' text-white text-center text-xl'>{currency}{unpaidAmount.toFixed(2)}</Text>
                    </View>
                </View>

            </LinearGradient>
        </View >
    )
}