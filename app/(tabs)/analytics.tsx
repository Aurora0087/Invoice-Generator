import {
    View, Text, Alert, ActivityIndicator, StyleSheet,
    Dimensions, ScrollView, TouchableOpacity, Platform, // Added TouchableOpacity, Platform
} from 'react-native';
import React, { useState, useMemo, useEffect } from 'react'; // Added useEffect
import { getAnalyticsData, AnalyticsData, TimeSeriesDataPoint, AnalyticsInterval } from '@/db/db'; // Assuming types are exported
// Removed useFocusEffect if useEffect handles initial load too
import { BarChart } from "react-native-gifted-charts";
import { Picker } from '@react-native-picker/picker'; // Import Picker
import DateTimePickerModal from "react-native-modal-datetime-picker"; // Import DateTimePickerModal
import { Ionicons } from '@expo/vector-icons'; // For clear date icons
import PaymentPieChart from '@/components/invoices/analytics/PaymentPieChart';
import TimeSeriesPaymentChart from '@/components/invoices/analytics/TimeSeriesPaymentChart';
import ClientInvoicePieChart from '@/components/invoices/analytics/ClientInvoicePieChart';

// App Colors
const COLOR_PRIMARY = '#00B2E7';
const COLOR_SECONDARY = '#E064F7';
const COLOR_ACCENT = '#FF8D6C';
const COLOR_TEXT = '#333';
const COLOR_MUTED = 'gray';
const COLOR_CARD_BG = 'white';

const screenWidth = Dimensions.get('window').width;

// Helper to format Date objects for display
const formatDateForDisplay = (date: Date | null): string => {
    if (!date) return "Select Date";
    // Adjust formatting as needed (e.g., using locale)
    return date.toLocaleDateString(); // Uses device locale format
};

export default function Analytics() {
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // --- Filter States ---
    const [selectedInterval, setSelectedInterval] = useState<AnalyticsInterval>('weekly'); // Default interval
    const [fromDate, setFromDate] = useState<Date | null>(null);
    const [toDate, setToDate] = useState<Date | null>(null);
    const [fillerCurrency, setFillerCurrency] = useState("-");

    // --- Date Picker Modal States ---
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [datePickerMode, setDatePickerMode] = useState<'from' | 'to'>('from'); // To know which date we are picking

    // --- Function to show Date Picker ---
    const showDatePicker = (mode: 'from' | 'to') => {
        setDatePickerMode(mode);
        setDatePickerVisibility(true);
    };

    // --- Function to hide Date Picker ---
    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };

    // --- Function to handle Date confirmation ---
    const handleConfirmDate = (date: Date) => {
        // console.log("A date has been picked: ", date);
        if (datePickerMode === 'from') {
            // Optional: Prevent selecting fromDate after toDate
            if (toDate && date > toDate) {
                Alert.alert("Invalid Date Range", "'From' date cannot be after 'To' date.");
            } else {
                setFromDate(date);
            }
        } else {
            // Optional: Prevent selecting toDate before fromDate
            if (fromDate && date < fromDate) {
                Alert.alert("Invalid Date Range", "'To' date cannot be before 'From' date.");
            } else {
                setToDate(date);
            }
        }
        hideDatePicker();
    };

    // --- Function to clear a selected date ---
    const clearDate = (mode: 'from' | 'to') => {
        if (mode === 'from') {
            setFromDate(null);
        } else {
            setToDate(null);
        }
    };

    // --- Effect to Fetch Data when filters change ---
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            console.log(`Fetching data - Interval: ${selectedInterval}, From: ${fromDate?.toISOString()}, To: ${toDate?.toISOString()}`);
            try {
                const options = {
                    interval: selectedInterval,
                    currency: fillerCurrency === "-" ? "" : fillerCurrency,
                    ...(fromDate && { fromDate }), // Add if not null
                    ...(toDate && { toDate }),     // Add if not null
                };
                const res = await getAnalyticsData(options);

                console.log(res);

                setAnalytics(res);
            } catch (fetchError: any) {
                const errorMessage = fetchError instanceof Error ? fetchError.message : String(fetchError);
                console.error("Analytics fetch error:", errorMessage);
                setError(`Failed to load analytics data: ${errorMessage}`);
                // Alert.alert("Can't get Analytics Data", errorMessage); // Can be annoying if frequent
            } finally {
                setLoading(false);
            }
        };

        fetchData(); // Fetch data whenever a filter state changes

    }, [selectedInterval, fromDate, toDate, fillerCurrency]); // Dependency array includes all filters

    // --- Prepare Chart Data (Memoized) ---
    const chartData = useMemo(() => {
        if (!analytics?.timeSeries || analytics.timeSeries.length === 0) {
            return [];
        }
        // Decide which value to plot based on a state or prop later if needed
        const valueToPlot: keyof TimeSeriesDataPoint = 'totalItemRevenue'; // Or 'invoiceCount', 'totalPaidAmount'

        return analytics.timeSeries.map((point: TimeSeriesDataPoint) => ({
            value: point[valueToPlot] ?? 0,
            label: point.intervalLabel,
            frontColor: (point[valueToPlot] ?? 0) > (analytics.summary.averageItemRevenuePerInvoice || 0) ? COLOR_SECONDARY : COLOR_ACCENT,
            topLabelComponent: () => (
                <Text style={{ color: COLOR_PRIMARY, fontSize: 9, marginBottom: 1 }}>{fillerCurrency === "-" ? "" : fillerCurrency}{(point[valueToPlot] ?? 0).toFixed(0)}</Text>
            ),
        }));
    }, [analytics]);

    const timeSeriesPaymenttData = useMemo(() => {
        if (!analytics?.timeSeries || analytics.timeSeries.length === 0) {
            return [];
        }

        return analytics.timeSeries.map((point: TimeSeriesDataPoint) => ({
            date: point.intervalLabel,
            paid: point.totalPaidAmount,
            unpaid: point.totalItemRevenue - point.totalPaidAmount

        }));
    }, [analytics]);


    // --- Render Loading/Error/No Data ---
    // (Keep the loading, error, and no-data checks from the previous example)
    if (loading && !analytics) { // Show loading only on initial load or if data is cleared
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={COLOR_PRIMARY} />
                <Text style={styles.infoText}>Loading Analytics...</Text>
            </View>
        );
    }
    if (error) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    // --- Render Main Content ---
    return (
        <ScrollView className=' flex-1 p-4 py-8 bg-slate-100 dark:bg-slate-900 dark:text-white'>
            <Text className=' text-black dark:text-white text-2xl my-4 font-bold text-center'>Invoice Analytics</Text>

            {/* --- Filter Controls --- */}
            <View className=' px-4 py-2 bg-slate-200 dark:bg-slate-800 mb-2 border-b border-black/30 dark:border-white/50 rounded-2xl'>
                {/* Interval Picker */}
                <View className=' mb-2'>
                    <Text className=' text-black dark:text-white mb-1'>Group By:</Text>
                    <View className='overflow-hidden rounded-2xl text-white'>
                        <Picker
                            selectedValue={selectedInterval}
                            onValueChange={(itemValue) => setSelectedInterval(itemValue as AnalyticsInterval)}
                            style={styles.picker}
                            dropdownIconColor={"white"}
                        >
                            <Picker.Item label="Daily" value="daily" />
                            <Picker.Item label="Weekly" value="weekly" />
                            <Picker.Item label="Monthly" value="monthly" />
                        </Picker>
                    </View>
                </View>
                {/* Currency Picker */}
                <View className=' mb-2'>
                    <Text className=' text-black dark:text-white mb-1'>Currency Fillter:</Text>
                    <View className='overflow-hidden rounded-2xl text-white'>
                        <Picker
                            selectedValue={fillerCurrency}
                            onValueChange={(itemValue) => {
                                console.log(itemValue);

                                setFillerCurrency(itemValue)
                            }}
                            style={styles.picker}
                            dropdownIconColor={"white"}
                        >
                            <Picker.Item
                                label="None"
                                value="-" />
                            <Picker.Item
                                label="INR ₹"
                                value="₹" />
                            <Picker.Item
                                label="USD $"
                                value="$" />
                            <Picker.Item
                                label="EURO €"
                                value="€" />
                        </Picker>
                    </View>
                </View>

                {/* Date Pickers */}
                <View className=' flex flex-row justify-between items-center gap-2'>
                    {/* From Date */}
                    <View className=' flex-1'>
                        <Text className=' text-black dark:text-white mb-1'>From:</Text>
                        <TouchableOpacity onPress={() => showDatePicker('from')} style={{ height: 50 }} className=' flex flex-row items-center justify-between gap-2 p-2 px-4 bg-white rounded-2xl'>
                            <Text style={styles.datePickerText}>{formatDateForDisplay(fromDate)}</Text>
                            <Ionicons name="calendar-outline" size={20} color={COLOR_PRIMARY} />
                        </TouchableOpacity>
                        {fromDate && (
                            <TouchableOpacity onPress={() => clearDate('from')} style={styles.clearDateButton}>
                                <Ionicons name="close-circle" size={18} color={COLOR_MUTED} />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* To Date */}
                    <View className=' flex-1'>
                        <Text className=' text-black dark:text-white mb-1'>To:</Text>
                        <TouchableOpacity onPress={() => showDatePicker('to')} style={{ height: 50 }} className=' flex flex-row items-center justify-between gap-2 p-2 px-4 bg-white rounded-2xl'>
                            <Text style={styles.datePickerText}>{formatDateForDisplay(toDate)}</Text>
                            <Ionicons name="calendar-outline" size={20} color={COLOR_PRIMARY} />
                        </TouchableOpacity>
                        {toDate && (
                            <TouchableOpacity onPress={() => clearDate('to')} style={styles.clearDateButton}>
                                <Ionicons name="close-circle" size={18} color={COLOR_MUTED} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>

            {/* --- Summary Display --- */}
            {analytics && (
                <View className=' px-4 py-2 bg-slate-200 dark:bg-slate-800 mb-2 border-b border-black/30 dark:border-white/50 rounded-2xl'>
                    <Text style={{ color: COLOR_PRIMARY }} className=' text-xl font-bold pb-2 mb-2 border-b dark:border-white/30'>Summary ({analytics.summary.dateRange.from || 'Start'} - {analytics.summary.dateRange.to || 'End'})</Text>
                    <Text className=' text-black dark:text-white mb-1 text-sm'>Total Revenue: {fillerCurrency === "-" ? "" : fillerCurrency}{analytics.summary.totalItemRevenue.toFixed(2)}</Text>
                    <Text className=' text-black dark:text-white mb-1 text-sm'>Total Invoices: {analytics.summary.totalInvoices}</Text>
                    <Text className=' text-black dark:text-white mb-1 text-sm'>Total Paid: {fillerCurrency === "-" ? "" : fillerCurrency}{analytics.summary.totalPaidAmount.toFixed(2)}</Text>
                    <Text className=' text-black dark:text-white mb-1 text-sm'>Avg Revenue/Invoice: {fillerCurrency === "-" ? "" : fillerCurrency}{analytics.summary.averageItemRevenuePerInvoice.toFixed(2)}</Text>
                </View>
            )}

            {/* --- Loading Indicator During Refetch --- */}
            {loading && analytics && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="small" color={COLOR_PRIMARY} />
                </View>
            )}

            {/* --- Bar Chart Display --- */}
            {!loading && !error && (!analytics || chartData.length === 0) ? (
                <View style={styles.centerContainer}>
                    <Text style={styles.infoText}>No analytics data available for the selected filters.</Text>
                </View>
            ) : !loading && !error && analytics && ( // Render chart only if not loading, no error, and data exists
                <>
                    <View style={styles.chartContainer}>
                        <BarChart
                            data={chartData}
                            barWidth={Platform.OS === 'web' ? 30 : 25} // Example platform specific styling
                            spacing={20}
                            width={screenWidth - 100}
                            initialSpacing={10}
                            barBorderRadius={4}
                            yAxisThickness={1}
                            yAxisExtraHeight={30}
                            yAxisColor={COLOR_MUTED}
                            yAxisTextStyle={{ color: COLOR_MUTED, fontSize: 8 }}
                            noOfSections={5}
                            yAxisLabelSuffix={fillerCurrency === "-" ? "" : fillerCurrency}
                            xAxisThickness={1}
                            xAxisColor={COLOR_MUTED}
                            xAxisLabelTextStyle={{ color: COLOR_MUTED, fontSize: 10, height: 35 }}
                            isAnimated
                            autoCenterTooltip
                            renderTooltip={(item: any) => (
                                <View style={[styles.tooltip, {
                                    backgroundColor: COLOR_PRIMARY,
                                }]}>
                                    <Text className=' text-white text-xs font-bold'>{item.label}</Text>
                                    <Text className=' text-white text-xs text-center font-semibold'>Rev: {fillerCurrency === "-" ? "" : fillerCurrency}{item.value.toFixed(2)}</Text>
                                </View>
                            )}
                        />
                        <Text style={styles.axisLabelX}>{selectedInterval.charAt(0).toUpperCase() + selectedInterval.slice(1)} Interval</Text>
                    </View>
                    <ClientInvoicePieChart
                        currencySymbol={fillerCurrency === "-" ? "" : fillerCurrency}
                        clientInvoiceData={analytics.clientInvoiceData}
                    />
                    <PaymentPieChart
                        paidAmount={analytics.summary.totalPaidAmount}
                        totalAmount={analytics.summary.totalItemRevenue}
                        currencySymbol={fillerCurrency === "-" ? "" : fillerCurrency}
                    />
                    <TimeSeriesPaymentChart
                        timeSeriesData={timeSeriesPaymenttData}
                        currencySymbol={fillerCurrency === "-" ? "" : fillerCurrency}
                    />
                </>

            )}

            {/* --- Date Picker Modal --- */}
            <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date"
                onConfirm={handleConfirmDate}
                onCancel={hideDatePicker}
                // Optional: Set initial date or max/min dates
                date={datePickerMode === 'from' ? fromDate || new Date() : toDate || fromDate || new Date()}
            />
            <View className=' h-40' />
        </ScrollView>
    );
}

// --- Styles ---
const styles = StyleSheet.create({
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        minHeight: 200,
    },
    loadingOverlay: {
        padding: 10,
        alignSelf: 'center',
    },
    filterContainer: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        backgroundColor: COLOR_CARD_BG,
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    pickerWrapper: {
        marginBottom: 10,
    },
    pickerBorder: {
        borderWidth: 1,
        borderColor: COLOR_MUTED,
        borderRadius: 5,
    },
    picker: {
        height: 50,
        width: '100%',
        backgroundColor: "#00B2E7",
        borderRadius: 24,
        color: "white"
    },
    datePickerText: {
        color: COLOR_TEXT,
        fontSize: 14,
    },
    clearDateButton: {
        position: 'absolute',
        right: 35,
        top: 30,
        padding: 5,
        zIndex: 1,
    },
    chartContainer: {
        marginVertical: 20,
        paddingVertical: 20,
        paddingHorizontal: 5,
        backgroundColor: COLOR_CARD_BG,
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.20,
        shadowRadius: 1.41,
        elevation: 2,
        alignItems: 'center',
    },
    infoText: {
        fontSize: 16,
        color: COLOR_MUTED,
        marginTop: 10,
        textAlign: 'center',
    },
    errorText: {
        fontSize: 16,
        color: 'red',
        textAlign: 'center',
    },
    axisLabelX: {
        color: COLOR_MUTED,
        fontSize: 11,
        fontWeight: '500',
        marginTop: 15, // Space above label
        textAlign: 'center',
    },
    tooltip: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 5,
        elevation: 99,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 1,
    },
});