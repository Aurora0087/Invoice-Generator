import InvoicePreviewCard from '@/components/invoices/InvoicePreviewCard';
import PaymentDetailsCard from '@/components/PaymentDetailsCard';
import { deleteInvoice, getInvoiceStatistics, initDatabase } from '@/db/db';
import Ionicons from '@expo/vector-icons/build/Ionicons';
import { Link, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Text, View, TouchableOpacity, FlatList, RefreshControl, Alert, Dimensions } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Swipeable } from 'react-native-gesture-handler';

export default function Index() {

  const [invoices, setInvoices] = useState<{ id: number, invoiceNumber: string, recipientName: string, date: string, amount: number, currency: string }[]>([]);
  const [payentDetails, setPayentDetails] = useState<{
    currency: string,
    paidAmount: number,
    unpaidAmount: number
  }[]>([])
  const [totalInvoices, setTotalInvoices] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  async function getInvoices() {
    setRefreshing(true);
    try {
      const res = await getInvoiceStatistics();
      setInvoices(res.recentInvoices);
      setPayentDetails(res.paymentDetails);
      setTotalInvoices(res.totalInvoices);
    } catch (error) {
      console.log(error);
      Alert.alert("Error while geting Invoice statics.", String(error));
    }
    setRefreshing(false);
  }

  async function handleDelete(id: number) {
    await deleteInvoice(id);
    setInvoices((prev) => prev.filter((invoice) => invoice.id !== id));
  }

  useFocusEffect(
    useCallback(() => {
      getInvoices();
    }, [])
  )

  const renderRightActions = (id: number) => (
    <TouchableOpacity
      className="bg-red-500 justify-center items-center px-6 rounded-2xl my-2"
      onPress={() => handleDelete(id)}
    >
      <Ionicons name="trash-bin" size={16} color='white' />
      <Text className="text-white font-bold text-center text-base">Delete</Text>
    </TouchableOpacity>
  );

  return (
    <View className=' w-full h-full flex justify-between gap-4 p-4 py-8 dark:bg-slate-900 dark:text-white'>
      <Link href={{ pathname: '/generate' }} asChild>
        <TouchableOpacity
          className=" bg-[#00B2E7] text-white py-4 px-6 rounded-2xl flex flex-row items-center justify-center gap-2"
        >
          <Ionicons name="add" size={16} color='white' />
          <Text className="text-white font-bold text-center text-base">New Invoice</Text>
        </TouchableOpacity>
      </Link>
      <View className=' mt-8'>
        <FlatList
          data={payentDetails}
          horizontal
          keyExtractor={(item) => item.currency}
          renderItem={({ item }) => (
            <PaymentDetailsCard key={item.currency} currency={item.currency} paidAmount={item.paidAmount} unpaidAmount={item.unpaidAmount} />
          )}
          snapToInterval={Dimensions.get('window').width - 32}
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
        />
      </View>
      <View className=' flex flex-row items-center justify-between mt-8 px-2'>
        <Text className='dark:text-white text-xl font-bold'>
          Resent Invoices
        </Text>
        <Link href={'/invoices/details'} className='dark:text-white'>
          View All({totalInvoices})
        </Link>
      </View>
      <GestureHandlerRootView>
        <FlatList
          data={invoices}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={getInvoices} />}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <Swipeable
              renderRightActions={() => renderRightActions(item.id)}
            >
              <InvoicePreviewCard
                id={item.id}
                invoiceNumber={item.invoiceNumber}
                recipientName={item.recipientName}
                date={item.date}
                amount={item.amount}
                currency={item.currency} />
            </Swipeable>
          )}
        />
      </GestureHandlerRootView>

    </View>
  );
}
