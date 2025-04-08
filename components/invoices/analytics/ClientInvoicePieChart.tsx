import { ClientInvoiceData } from '@/db/db';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';

interface ClientInvoicePieChartProps {
    clientInvoiceData: ClientInvoiceData[];
    title?: string;
    currencySymbol?: string,
}

const COLORS = [
    '#6366F1', // Indigo-500
    '#06B6D4', // Cyan-500
    '#F59E0B', // Amber-500
    '#8B5CF6', // Violet-500
    '#10B981', // Emerald-500
    '#EF4444', // Red-500
    '#3B82F6', // Blue-500
    '#14B8A6', // Teal-500
    '#A855F7', // Purple-500
    '#EC4899', // Rose-500
];



const ClientInvoicePieChart: React.FC<ClientInvoicePieChartProps> = ({
    clientInvoiceData,
    currencySymbol = '',
    title = "Client Invoice Distribution",
}) => {
    if (!clientInvoiceData || clientInvoiceData.length === 0) {
        return <Text>No client invoice data available.</Text>;
    }

    const pieChartData = clientInvoiceData.map((item, index) => ({
        value: item.totalInvoiceAmount,
        label: item.clientName,
        color: COLORS[index % COLORS.length], // Cycle through colors
        id: item.clientName, // Useful if you need to track selection
    }));

    const totalAmount = pieChartData.reduce((sum, data) => sum + data.value, 0);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>
            <View style={styles.chartWrapper}>
                <PieChart
                    data={pieChartData}
                    donut
                    radius={120}
                    innerRadius={60}
                    textColor="black"
                    textSize={12}
                    fontWeight="bold"
                    focusOnPress
                    showText
                    centerLabelComponent={() => { // Display info in the center
                        return (
                            <View style={styles.centerLabel}>
                                <Text style={styles.centerLabelTotal}>Total</Text>
                                <Text style={styles.centerLabelAmount}>
                                    {currencySymbol}{totalAmount.toFixed(2)}
                                </Text>
                            </View>
                        );
                    }}
                />
            </View>
            <View style={styles.legendContainer}>
                {pieChartData.map((item, index) => (
                    <View key={item.id} style={styles.legendItem}>
                        <View style={[styles.legendColorBox, { backgroundColor: item.color }]} />
                        <Text style={styles.legendText}>
                            {item.label} - {(item.value / totalAmount * 100).toFixed(1)}%
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

export default ClientInvoicePieChart;