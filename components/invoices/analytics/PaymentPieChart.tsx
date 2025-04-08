import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';

// Define props for the component
interface PaymentGiftedPieChartProps {
    paidAmount: number;
    totalAmount: number;
    currencySymbol?: string; // Optional currency symbol
    chartTitle?: string;     // Optional title
    paidColor?: string;      // Optional custom color for 'Paid'
    unpaidColor?: string;    // Optional custom color for 'Unpaid'
}

const PaymentPieChart: React.FC<PaymentGiftedPieChartProps> = ({
    paidAmount,
    totalAmount,
    currencySymbol = '',
    chartTitle = "Payment Status",
    paidColor = '#2ECC71',
    unpaidColor = '#E74C3C',
}) => {

    // --- Data Validation and Calculation ---
    const validPaidAmount = Math.max(0, paidAmount);
    const validTotalAmount = Math.max(0, totalAmount);
    let unpaidAmount = Math.max(0, validTotalAmount - validPaidAmount);
    const actualPaidAmount = Math.min(validPaidAmount, validTotalAmount);

    const paidPercentage = validTotalAmount > 0 ? (actualPaidAmount / validTotalAmount) * 100 : 0;
    const unpaidPercentage = validTotalAmount > 0 ? (unpaidAmount / validTotalAmount) * 100 : 0;

    const pieData = [];

    if (actualPaidAmount > 0) {
        pieData.push({
            value: actualPaidAmount,
            color: paidColor,
            text: `${paidPercentage.toFixed(0)}%`,
            label: 'Paid',
            shiftTextX: -5,
            focused: true,
        });
    }

    if (unpaidAmount > 0) {
        pieData.push({
            value: unpaidAmount,
            color: unpaidColor,
            text: `${unpaidPercentage.toFixed(0)}%`,
            label: 'Unpaid',
            shiftTextX: 5,
        });
    }

    if (validTotalAmount <= 0) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>{chartTitle}</Text>
                <Text style={styles.placeholderText}>No payment data available.</Text>
            </View>
        );
    }
    // Ensure at least one slice if total > 0 but calculations led to empty array
    if (pieData.length === 0 && validTotalAmount > 0) {
        pieData.push({
            value: validTotalAmount,
            color: paidColor,
            text: '100%',
            label: 'Paid',
        });
    }

    // --- Render the Chart ---
    return (
        <View style={styles.container}>
            <Text style={styles.title}>{chartTitle}</Text>
            <View style={styles.chartWrapper}>
                <PieChart
                    data={pieData}
                    donut
                    showText
                    textColor="white"
                    textSize={12}
                    fontWeight="bold"
                    radius={120}
                    innerRadius={60}
                    focusOnPress
                    strokeColor="white"
                    centerLabelComponent={() => { // Display info in the center
                        return (
                            <View style={styles.centerLabel}>
                                <Text style={styles.centerLabelTotal}>Total</Text>
                                <Text style={styles.centerLabelAmount}>
                                    {currencySymbol}{validTotalAmount.toFixed(2)}
                                </Text>
                            </View>
                        );
                    }}
                />
            </View>

            {/* Custom Legend */}
            <View style={styles.legendContainer}>
                {pieData.map((item, index) => (
                    <View key={`legend-${index}`} style={styles.legendItem}>
                        <View style={[styles.legendColorBox, { backgroundColor: item.color }]} />
                        <Text style={styles.legendText}>
                            {item.label}: {currencySymbol}{item.value.toFixed(2)} ({item.text})
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 15,
        alignItems: 'center',
        backgroundColor: '#ffffff', // Example background
        borderRadius: 16,
        paddingVertical: 16,
        paddingHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 3,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333',
    },
    chartWrapper: {
        // Ensures chart doesn't overflow container unexpectedly if specific dimensions used
        alignItems: 'center', // Center the PieChart component if it's smaller than wrapper
        marginBottom: 15,
    },
    placeholderText: {
        fontSize: 16,
        color: '#666',
        paddingVertical: 30,
    },
    centerLabel: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    centerLabelTotal: {
        fontSize: 14,
        color: '#666',
    },
    centerLabelAmount: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    legendContainer: {
        marginTop: 10,
        width: '100%',
        alignItems: 'flex-start', // Align legend items to the left
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    legendColorBox: {
        width: 14,
        height: 14,
        borderRadius: 3,
        marginRight: 8,
    },
    legendText: {
        fontSize: 14,
        color: '#444',
    },
});

export default PaymentPieChart;