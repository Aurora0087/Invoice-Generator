import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

// Get screen width for chart sizing
const screenWidth = Dimensions.get('window').width;

// --- Helper Function to Format Date Labels ---
// (Keep it simple or use a library like date-fns for complex formatting)
const formatDateLabel = (dateString: string): string => {
    try {
        const date = new Date(dateString);
        // Simple MM/DD format
        return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
    } catch (e) {
        return dateString; // Fallback if date parsing fails
    }
};

// --- Define Component Props ---
interface TimeSeriesDataPoint {
    date: string;      // Should be a parseable date string
    paid: number;
    unpaid: number;
    // Add other relevant fields if needed (e.g., total)
}

interface TimeSeriesPaymentChartProps {
    timeSeriesData: TimeSeriesDataPoint[];
    chartTitle?: string;
    paidColor?: string;
    unpaidColor?: string;
    currencySymbol?: string;
    height?: number; // Allow custom height
}

const TimeSeriesPaymentChart: React.FC<TimeSeriesPaymentChartProps> = ({
    timeSeriesData,
    chartTitle = "Paid vs Unpaid Over Time",
    paidColor = '#2ECC71',   // Default green for paid
    unpaidColor = '#E74C3C', // Default red for unpaid
    currencySymbol = '',
    height = 250, // Default chart height
}) => {

    // --- Data Validation ---
    if (!timeSeriesData || !Array.isArray(timeSeriesData) || timeSeriesData.length === 0) {
        return (
            <View style={[styles.container, { height: height + 50 }]}>
                <Text style={styles.title}>{chartTitle}</Text>
                <Text style={styles.placeholderText}>No time series data available.</Text>
            </View>
        );
    }

    // --- Transform Data for Gifted Line Chart ---
    const paidLinePoints = timeSeriesData.map(item => ({
        value: item.paid,
        label: formatDateLabel(item.date), // X-axis label for this point
        date: item.date, // Keep original date for tooltips
        paid: item.paid, // Pass data for tooltip
        unpaid: item.unpaid, // Pass data for tooltip
    }));

    const unpaidLinePoints = timeSeriesData.map(item => ({
        value: item.unpaid,
        // No label needed for the second dataset, it uses labels from the first
        date: item.date, // Keep original date for tooltips
        paid: item.paid, // Pass data for tooltip
        unpaid: item.unpaid, // Pass data for tooltip
    }));

    // Find max value for Y-axis scaling (consider both paid and unpaid)
    const maxValue = timeSeriesData.reduce((max, item) => {
        return Math.max(max, item.paid, item.unpaid);
    }, 0);

    // --- Render the Chart ---
    return (
        <View style={styles.container}>
            <Text style={styles.title}>{chartTitle}</Text>
            <View style={styles.chartWrapper}>
                <LineChart
                    data={paidLinePoints}   // Primary dataset (defines X-axis labels)
                    data2={unpaidLinePoints} // Secondary dataset

                    height={height}
                    width={screenWidth - 100}
                    initialSpacing={15}
                    spacing={(screenWidth - 90) / Math.max(1, paidLinePoints.length - 1)} // Adjust spacing based on number of points

                    color1={paidColor}
                    color2={unpaidColor}

                    textColor="#333"
                    dataPointsColor1={paidColor}
                    dataPointsColor2={unpaidColor}
                    dataPointsRadius={4}
                    textShiftY={-8} // Shift Y-axis labels slightly up
                    textShiftX={-5} // Shift Y-axis labels slightly left
                    textFontSize={12}

                    // --- Axes Configuration ---
                    yAxisLabelPrefix={currencySymbol}
                    yAxisLabelSuffix="" // No suffix needed
                    yAxisTextStyle={{ color: '#555', fontSize: 10 }}
                    xAxisLabelTextStyle={{ color: '#555', fontSize: 10, height: 20 }} // Give height for rotation/wrapping if needed
                    // rotateXLabels={paidLinePoints.length > 5 ? 30 : 0} // Rotate if many labels
                    // yAxisLabelWidth={40} // Adjust if labels are wide
                    noOfSections={5} // Number of horizontal grid lines
                    maxValue={maxValue * 1.1} // Add some buffer to max value
                    yAxisThickness={0.5}
                    xAxisThickness={0.5}
                    rulesType="solid" // or "dashed"
                    rulesColor="#e0e0e0"
                    backgroundColor="transparent" // Chart area background

                    // --- Pointer/Tooltip Configuration ---
                    pointerConfig={{
                        pointerStripHeight: height,
                        pointerStripColor: 'lightgray',
                        pointerStripWidth: 1,
                        pointerColor: 'gray',
                        radius: 5,
                        pointerLabelWidth: 120, // Width of the tooltip box
                        pointerLabelHeight: 90, // Height of the tooltip box
                        activatePointersOnLongPress: true,
                        autoAdjustPointerLabelPosition: true,
                        pointerLabelComponent: (items: any[]) => { // items contains data points at the focused X position
                            // items[0] should be the 'paid' point, items[1] the 'unpaid' point
                            if (!items || items.length < 1 || !items[0]) return null;

                            // Find the points corresponding to paid and unpaid (more robust than index)
                            // Assuming the original data object was passed along
                            const pointData = items[0]; // Use the first item's full data

                            // Format Date for Tooltip
                            let displayDate = pointData.date; // Fallback
                            try {
                                displayDate = new Date(pointData.date).toLocaleDateString();
                            } catch (e) { }


                            return (
                                <View style={styles.tooltipContainer}>
                                    <Text style={styles.tooltipDate}>{displayDate}</Text>
                                    <View style={styles.tooltipRow}>
                                        <View style={[styles.tooltipColorBox, { backgroundColor: paidColor }]} />
                                        <Text style={styles.tooltipText}>
                                            Paid: {currencySymbol}{pointData.paid?.toFixed(2) ?? 'N/A'}
                                        </Text>
                                    </View>
                                    <View style={styles.tooltipRow}>
                                        <View style={[styles.tooltipColorBox, { backgroundColor: unpaidColor }]} />
                                        <Text style={styles.tooltipText}>
                                            Unpaid: {currencySymbol}{pointData.unpaid?.toFixed(2) ?? 'N/A'}
                                        </Text>
                                    </View>
                                </View>
                            );
                        },
                    }}
                />
            </View>

            {/* Custom Legend */}
            <View style={styles.legendContainer}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendColorBox, { backgroundColor: paidColor }]} />
                    <Text style={styles.legendText}>Paid Amount</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendColorBox, { backgroundColor: unpaidColor }]} />
                    <Text style={styles.legendText}>Unpaid Amount</Text>
                </View>
            </View>
        </View>
    );
};

// --- Styles ---
const styles = StyleSheet.create({
    container: {
        marginVertical: 15,
        backgroundColor: '#ffffff',
        borderRadius: 16,
        paddingVertical: 16,
        paddingHorizontal: 10, // Less horizontal padding for more chart space
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 3,
        alignItems: 'center', // Center title and legend
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20, // More space before chart
        color: '#333',
    },
    chartWrapper: {
        // Wrapper to control chart positioning if needed
        width: '100%',
        alignItems: 'center', // Center the chart component itself
    },
    placeholderText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        flex: 1, // Take remaining space
        paddingVertical: 30,
    },
    legendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20, // Space after chart
        flexWrap: 'wrap', // Allow wrapping on small screens
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 20,
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
    // Tooltip Styles
    tooltipContainer: {
        paddingHorizontal: 10,
        paddingVertical: 8,
        backgroundColor: 'rgba(40, 40, 40, 0.9)', // Dark semi-transparent
        borderRadius: 6,
        // width: 120, // Set via pointerConfig
        // height: 90, // Set via pointerConfig
        justifyContent: 'center',
    },
    tooltipDate: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
    },
    tooltipRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    tooltipColorBox: {
        width: 10,
        height: 10,
        borderRadius: 2,
        marginRight: 6,
    },
    tooltipText: {
        color: 'white',
        fontSize: 12,
    },
});

export default TimeSeriesPaymentChart;