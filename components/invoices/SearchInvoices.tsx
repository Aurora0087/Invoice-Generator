import { View, Text, Switch, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { formatDate } from '@/utils';

export default function SearchInvoices({
    searchInvoicesBy
}: {
    searchInvoicesBy: (params: {
        invoiceNumber?: string;
        recipientName?: string;
        fromDate?: string;
        toDate?: string;
    }) => void
}) {
    // State for input values
    const [invoiceNumber, setInvoiceNumber] = useState('');
    const [recipientName, setRecipientName] = useState('');
    const [fromDate, setFromDate] = useState<Date | null>(null);
    const [toDate, setToDate] = useState<Date | null>(null);

    // State for showing date pickers
    const [showFromDatePicker, setShowFromDatePicker] = useState(false);
    const [showToDatePicker, setShowToDatePicker] = useState(false);

    // State for which fields to search by
    const [searchBy, setSearchBy] = useState({
        invoiceNumber: false,
        recipientName: false,
        fromDate: false,
        toDate: false
    });

    // Check if any search criteria are enabled
    const [isSearchEnabled, setIsSearchEnabled] = useState(false);

    // Update search button state when criteria change
    useEffect(() => {
        const hasInvoiceNumber = invoiceNumber.trim().length > 0 && searchBy.invoiceNumber;
        const hasRecipientName = recipientName.trim().length > 0 && searchBy.recipientName;
        const hasFromDate = fromDate !== null && searchBy.fromDate;
        const hasToDate = toDate !== null && searchBy.toDate;

        setIsSearchEnabled(hasInvoiceNumber || hasRecipientName || hasFromDate || hasToDate);
    }, [invoiceNumber, recipientName, fromDate, toDate, searchBy]);

    // Handle date selection
    const onFromDateChange = (event: any, selectedDate?: Date) => {
        setShowFromDatePicker(false);
        if (selectedDate) {
            setFromDate(selectedDate);
        }
    };

    const onToDateChange = (event: any, selectedDate?: Date) => {
        setShowToDatePicker(false);
        if (selectedDate) {
            setToDate(selectedDate);
        }
    };

    // Handle search button press
    const onSearch = () => {
        const params: {
            invoiceNumber?: string;
            recipientName?: string;
            fromDate?: string;
            toDate?: string;
        } = {};

        if (invoiceNumber.trim() && searchBy.invoiceNumber) {
            params.invoiceNumber = invoiceNumber.trim();
        }

        if (recipientName.trim() && searchBy.recipientName) {
            params.recipientName = recipientName.trim();
        }

        if (fromDate && searchBy.fromDate) {
            params.fromDate = formatDate(fromDate);
        }

        if (toDate && searchBy.toDate) {
            params.toDate = formatDate(toDate);
        }

        // Call the search function with the parameters
        searchInvoicesBy(params);
    };

    // Reset all filters
    const resetFilters = () => {
        setInvoiceNumber('');
        setRecipientName('');
        setFromDate(null);
        setToDate(null);
        setSearchBy({
            invoiceNumber: false,
            recipientName: false,
            fromDate: false,
            toDate: false
        });
    };

    // Render a search field with label, input, and switch
    const renderSearchField = (
        label: string,
        value: string,
        onChangeText: (text: string) => void,
        switchKey: keyof typeof searchBy
    ) => (
        <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>{label}</Text>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.textInput}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={`Enter ${label.toLowerCase()}`}
                    placeholderTextColor="#999"
                />
                <Switch
                    value={searchBy[switchKey]}
                    onValueChange={() => setSearchBy({ ...searchBy, [switchKey]: !searchBy[switchKey] })}
                />
            </View>
        </View>
    );

    // Render a date field with label, display, and switch
    const renderDateField = (
        label: string,
        date: Date | null,
        onPress: () => void,
        switchKey: keyof typeof searchBy
    ) => (
        <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>{label}</Text>
            <View style={styles.inputContainer}>
                <TouchableOpacity style={styles.dateInput} onPress={onPress}>
                    <Text style={date ? styles.dateText : styles.datePlaceholder}>
                        {date ? formatDate(date) : `Select ${label.toLowerCase()}`}
                    </Text>
                </TouchableOpacity>
                <Switch
                    value={searchBy[switchKey]}
                    onValueChange={() => setSearchBy({ ...searchBy, [switchKey]: !searchBy[switchKey] })}
                />
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.heading}>Search Invoices</Text>

            {renderSearchField('Invoice Number', invoiceNumber, setInvoiceNumber, 'invoiceNumber')}
            {renderSearchField('Recipient/Client Name', recipientName, setRecipientName, 'recipientName')}

            {renderDateField('From Date', fromDate, () => setShowFromDatePicker(true), 'fromDate')}
            {renderDateField('To Date', toDate, () => setShowToDatePicker(true), 'toDate')}

            {/* Date pickers */}
            {showFromDatePicker && (
                <DateTimePicker
                    value={fromDate || new Date()}
                    mode="date"
                    onChange={onFromDateChange}
                />
            )}

            {showToDatePicker && (
                <DateTimePicker
                    value={toDate || new Date()}
                    mode="date"
                    onChange={onToDateChange}
                />
            )}

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.resetButton]}
                    onPress={resetFilters}
                >
                    <Ionicons name="refresh" size={16} color="white" />
                    <Text style={styles.buttonText}>Reset</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.searchButton, !isSearchEnabled && styles.disabledButton]}
                    onPress={onSearch}
                    disabled={!isSearchEnabled}
                >
                    <Ionicons name="search" size={16} color="white" />
                    <Text style={styles.buttonText}>Search</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        paddingTop: 64,
        paddingBottom: 96,
        flex: 1,
    },
    heading: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
        marginBottom: 24,
    },
    fieldContainer: {
        marginBottom: 16,
    },
    fieldLabel: {
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    textInput: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 12,
        fontSize: 16,
    },
    dateInput: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 12,
    },
    dateText: {
        fontSize: 16,
        color: 'black',
    },
    datePlaceholder: {
        fontSize: 16,
        color: '#999',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 32,
        gap: 12,
    },
    searchButton: {
        flex: 2,
        backgroundColor: '#3b82f6',
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    resetButton: {
        flex: 1,
        backgroundColor: '#000',
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    disabledButton: {
        opacity: 0.6,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});