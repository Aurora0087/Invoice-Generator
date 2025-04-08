import { RecipientInfoSchemaProp } from '@/schema/recipient';
import { SenderInfoSchemaProp } from '@/schema/sender';
import { AVALABLECURRENCYES, CurrencyProp, NewInvoiceProp } from '@/store/store';
import * as SQLite from 'expo-sqlite';
import { SQLiteDatabase } from 'expo-sqlite';

// Database name
const DB_NAME = 'invoiceApp.db';

// Initialize database and create necessary tables
export const initDatabase = async (): Promise<SQLiteDatabase> => {
    try {
        const db = await SQLite.openDatabaseAsync(DB_NAME);


        await db.withTransactionAsync(
            async () => {

                // Create table for settings
                await db.execAsync(`
            PRAGMA journal_mode = WAL;
            CREATE TABLE IF NOT EXISTS settings (
              id INTEGER PRIMARY KEY NOT NULL,
              key TEXT NOT NULL UNIQUE,
              value TEXT
            );
          `);

                // Invoices table
                await db.execAsync(`
                    CREATE TABLE IF NOT EXISTS invoices (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              invoiceNumber TEXT NOT NULL UNIQUE,
              orderId TEXT,
              date TEXT NOT NULL,
              dueDate TEXT NOT NULL,
              logoImg TEXT,
              signImg TEXT,
              currency TEXT,
              discountAmount REAL DEFAULT 0,
              taxPercentage REAL DEFAULT 0,
              shipping REAL DEFAULT 0,
              payed REAL DEFAULT 0,
              createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
                    `);

                // Sender info table
                await db.execAsync(`
        CREATE TABLE IF NOT EXISTS sender_info (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              invoiceId INTEGER NOT NULL,
              name TEXT NOT NULL,
              address TEXT NOT NULL,
              taxId TEXT,
              email TEXT,
              phone TEXT,
              FOREIGN KEY (invoiceId) REFERENCES invoices(id) ON DELETE CASCADE
            );
                    `);

                // Recipient info table
                await db.execAsync(`
                    CREATE TABLE IF NOT EXISTS recipient_info (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              invoiceId INTEGER NOT NULL,
              name TEXT NOT NULL,
              address TEXT NOT NULL,
              email TEXT,
              phone TEXT,
              FOREIGN KEY (invoiceId) REFERENCES invoices(id) ON DELETE CASCADE
            );
                    `);

                // Invoice items table
                await db.execAsync(`
                    CREATE TABLE IF NOT EXISTS invoice_items (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              invoiceId INTEGER NOT NULL,
              name TEXT NOT NULL,
              quantity INTEGER NOT NULL,
              price REAL NOT NULL,
              FOREIGN KEY (invoiceId) REFERENCES invoices(id) ON DELETE CASCADE
            );
                    `);
            }
        );

        return db;
    } catch (error) {
        console.error('Failed to initialize database:', error);
        throw error;
    }
};

// Get database instance
export const getDatabase = async (): Promise<SQLiteDatabase> => {
    return await SQLite.openDatabaseAsync(DB_NAME);
};

//Save a setting value
export const saveSetting = async (key: string, value: string): Promise<void> => {
    const db = await getDatabase();
    await db.runAsync(
        'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
        key,
        value
    );
};


// Get a setting value
export const getSetting = async (key: string): Promise<string | null> => {
    const db = await getDatabase();
    try {
        const result = await db.getFirstAsync<{ value: string }>(
            'SELECT value FROM settings WHERE key = ?',
            key
        );
        return result?.value || null;
    } catch (error) {
        console.error(`Error getting setting for key ${key}:`, error);
        return null;
    }
};


// Get all settings
export const getAllSettings = async (): Promise<Record<string, string>> => {
    const db = await getDatabase();
    const rows = await db.getAllAsync<{ key: string; value: string }>(
        'SELECT key, value FROM settings'
    );

    const settings: Record<string, string> = {};
    for (const row of rows) {
        settings[row.key] = row.value;
    }

    return settings;
};


//create a new invoice
export function createInvoice(invoice: NewInvoiceProp): Promise<number | null> {
    return new Promise(async (resolve, reject) => {
        const db = await getDatabase();
        let newInvoiceId: number | null = null;

        let isInvoiceExist = await db.getFirstAsync(`
            SELECT invoiceNumber, orderId FROM invoices WHERE invoiceNumber = ?
            `, invoice.invoiceInfo.invoiceNumber);

        if (isInvoiceExist) {
            reject("Invoice with this invoice Number already exist.")
        }

        isInvoiceExist = await db.getFirstAsync(`
            SELECT invoiceNumber, orderId FROM invoices WHERE orderId = ?
            `, invoice.invoiceInfo.orderId);

        if (isInvoiceExist) {
            reject("Invoice with this order Id already exist.")
        }

        await db.withTransactionAsync(async () => {

            let res = await db.runAsync(`
            INSERT INTO invoices (
          invoiceNumber, orderId, date, dueDate, logoImg, signImg, currency,
          discountAmount, taxPercentage, shipping, payed
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, invoice.invoiceInfo.invoiceNumber,
                invoice.invoiceInfo.orderId,
                invoice.invoiceInfo.date,
                invoice.invoiceInfo.dueDate,
                invoice.logoImg,
                invoice.signImg,
                invoice.currency,
                invoice.ItemsInfo.discountAmount,
                invoice.ItemsInfo.taxParsentage,
                invoice.ItemsInfo.shipping,
                invoice.ItemsInfo.payed,
            );

            newInvoiceId = res.lastInsertRowId || 0;

            //insert data in sender info table
            res = await db.runAsync(`
                INSERT INTO sender_info (invoiceId, name, address, taxId, email, phone)
             VALUES (?, ?, ?, ?, ?, ?)
                `,
                newInvoiceId,
                invoice.senderInfo.name,
                invoice.senderInfo.address,
                invoice.senderInfo.taxId || null,
                invoice.senderInfo.email || null,
                invoice.senderInfo.phone || null
            );

            // insert data in recipient info
            res = await db.runAsync(`
                INSERT INTO recipient_info (invoiceId, name, address, email, phone)
             VALUES (?, ?, ?, ?, ?)
                `,
                newInvoiceId,
                invoice.recipientInfo.name,
                invoice.recipientInfo.address,
                invoice.recipientInfo.email || null,
                invoice.recipientInfo.phone || null
            );

            // insert items
            invoice.ItemsInfo.items.forEach(async item => {
                await db.runAsync(`
                    INSERT INTO invoice_items (invoiceId, name, quantity, price)
               VALUES (?, ?, ?, ?)
                    `,
                    newInvoiceId,
                    item.name,
                    item.quantity,
                    item.price
                )
            })
        }
        ).catch((err) => {
            console.log('Failed to create invoice:', err);
            reject(err);
        })
        resolve(newInvoiceId)
    })
};


// Get all invoices with basic info
export function getAllInvoice(): Promise<{ id: number, invoiceNumber: string, recipientName: string, date: string, amount: number, currency: string }[]> {
    return new Promise(async (resolve, reject) => {
        const db = await getDatabase();
        let invoices: any[] = [];

        await db.withTransactionAsync(async () => {
            const res: {
                date: string,
                discountAmount: number,
                id: number,
                invoiceNumber: string,
                payed: number,
                recipientName: string,
                shipping: number,
                taxPercentage: number,
                currency: string
            }[] = await db.getAllAsync(`
                SELECT 
          i.id, i.invoiceNumber, i.date, r.name as recipientName,
          i.taxPercentage, i.discountAmount, i.shipping, i.payed,i.currency
        FROM 
          invoices i
        JOIN 
          recipient_info r ON i.id = r.invoiceId
        ORDER BY 
          i.date DESC
                `);
            for (let i = 0; i < res.length; i++) {
                const invoice = res[i];

                const subTotalRes: { subtotal: number } | null = await db.getFirstAsync(`
                    SELECT SUM(price * quantity) as subtotal 
                 FROM invoice_items 
                 WHERE invoiceId = ?
                    `, invoice.id);

                if (subTotalRes === null) {
                    continue;
                }

                const subtotal = subTotalRes.subtotal;
                const netAmount = subtotal - invoice.discountAmount;
                const tax = netAmount * (invoice.taxPercentage / 100);
                const total = netAmount + tax + invoice.shipping;

                invoices.push({
                    id: invoice.id,
                    invoiceNumber: invoice.invoiceNumber,
                    recipientName: invoice.recipientName,
                    date: invoice.date,
                    amount: total.toFixed(2),
                    currency: invoice.currency
                });
            }
        }).catch((err) => {
            console.log('Error geting Invoices', err);
            reject(err);
        })

        resolve(invoices);
    })
}


// Get a single invoice by ID with all details

export function getInvoiceById(id: number): Promise<NewInvoiceProp | null> {
    return new Promise(async (resolve, reject) => {
        const db = await getDatabase();
        let invoiceData: any = null;
        let senderInfo: SenderInfoSchemaProp | null = null;
        let recipientInfo: RecipientInfoSchemaProp | null = null;
        let items: { name: string; quantity: number; price: number; }[] = [];

        await db.withTransactionAsync(async () => {
            // Get invoice basic info
            invoiceData = await db.getFirstAsync(`
                SELECT * FROM invoices WHERE id = ?
                `, id);

            //get sender info
            senderInfo = await db.getFirstAsync(`
                SELECT name, address, taxId, email, phone
             FROM sender_info WHERE invoiceId = ?
                `, id)

            // Get recipient info
            recipientInfo = await db.getFirstAsync(
                `SELECT name, address, email, phone
                 FROM recipient_info WHERE invoiceId = ?`,
                id
            );

            // Get items
            items = await db.getAllAsync(
                `SELECT name, quantity, price
                     FROM invoice_items WHERE invoiceId = ?`,
                id
            );
        })

        if (!invoiceData || !senderInfo || !recipientInfo) {
            resolve(null);
            return;
        }


        const invoice: NewInvoiceProp = {
            senderInfo: senderInfo,
            recipientInfo: recipientInfo,
            invoiceInfo: {
                invoiceNumber: invoiceData.invoiceNumber,
                orderId: invoiceData.orderId,
                date: invoiceData.date,
                dueDate: invoiceData.dueDate
            },
            ItemsInfo: {
                items: items,
                discountAmount: invoiceData.discountAmount,
                taxParsentage: invoiceData.taxPercentage,
                shipping: invoiceData.shipping,
                payed: invoiceData.payed
            },
            logoImg: invoiceData.logoImg,
            signImg: invoiceData.signImg,
            currency: invoiceData.currency as CurrencyProp
        };

        resolve(invoice);
    })
}
// Update an existing invoice

export function updateInvoice(id: number, invoice: NewInvoiceProp): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
        const db = await getDatabase();

        await db.withTransactionAsync(
            async () => {

                // Update invoice
                await db.runAsync(
                    `UPDATE invoices SET
          invoiceNumber = ?, orderId = ?, date = ?, dueDate = ?,
          logoImg = ?, signImg = ?, currency = ?,
          discountAmount = ?, taxPercentage = ?, shipping = ?, payed = ?
         WHERE id = ?`,
                    invoice.invoiceInfo.invoiceNumber,
                    invoice.invoiceInfo.orderId,
                    invoice.invoiceInfo.date,
                    invoice.invoiceInfo.dueDate,
                    invoice.logoImg,
                    invoice.signImg,
                    invoice.currency,
                    invoice.ItemsInfo.discountAmount,
                    invoice.ItemsInfo.taxParsentage,
                    invoice.ItemsInfo.shipping,
                    invoice.ItemsInfo.payed,
                    id
                );

                // Update sender info
                await db.runAsync(
                    `UPDATE sender_info SET
          name = ?, address = ?, taxId = ?, email = ?, phone = ?
         WHERE invoiceId = ?`,
                    invoice.senderInfo.name,
                    invoice.senderInfo.address,
                    invoice.senderInfo.taxId || null,
                    invoice.senderInfo.email || null,
                    invoice.senderInfo.phone || null,
                    id
                );

                // Update recipient info
                await db.runAsync(
                    `UPDATE recipient_info SET
          name = ?, address = ?, email = ?, phone = ?
         WHERE invoiceId = ?`,
                    invoice.recipientInfo.name,
                    invoice.recipientInfo.address,
                    invoice.recipientInfo.email || null,
                    invoice.recipientInfo.phone || null,
                    id
                );

                // Delete existing items
                await db.runAsync(
                    `DELETE FROM invoice_items WHERE invoiceId = ?`,
                    id
                );

                // Insert updated items
                invoice.ItemsInfo.items.forEach(async (item) => {
                    await db.runAsync(
                        `INSERT INTO invoice_items (invoiceId, name, quantity, price)
           VALUES (?, ?, ?, ?)`,
                        id, item.name, item.quantity, item.price
                    );
                });

            },
        ).catch(err => {
            console.log(err);
            reject(err)
        });

        resolve(true);
    })
}

// Delete an invoice by ID

export function deleteInvoice(id: number): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
        const db = await getDatabase();

        await db.withTransactionAsync(async () => {
            await db.runAsync(`DELETE FROM invoice_items WHERE invoiceId = ?`, id);
            await db.runAsync(`DELETE FROM sender_info WHERE invoiceId = ?`, id);
            await db.runAsync(`DELETE FROM recipient_info WHERE invoiceId = ?`, id);

            await db.runAsync(`DELETE FROM invoices WHERE id = ?`, id);
        }).catch((err) => {
            console.log(err);
            reject(err)
        });

        resolve(true);
    })
}

// Search invoices by criteria

export function searchInvoices(criteria: {
    invoiceNumber?: string,
    recipientName?: string,
    fromDate?: string,
    toDate?: string,
    currency?: string,
}): Promise<{ id: number, invoiceNumber: string, recipientName: string, date: string, amount: number, currency: string }[]> {
    return new Promise(async (resolve, reject) => {

        const db = await getDatabase();

        let query = `
      SELECT 
        i.id, i.invoiceNumber, i.date, r.name as recipientName,
        i.taxPercentage, i.discountAmount, i.shipping, i.payed,i.currency
      FROM 
        invoices i
      JOIN 
        recipient_info r ON i.id = r.invoiceId
      WHERE 1=1
    `;
        const params: any[] = [];

        if (criteria.invoiceNumber) {
            query += ` AND i.invoiceNumber LIKE ?`;
            params.push(`%${criteria.invoiceNumber}%`);
        }

        if (criteria.recipientName) {
            query += ` AND r.name LIKE ?`;
            params.push(`%${criteria.recipientName}%`);
        }

        if (criteria.fromDate) {
            query += ` AND i.date >= ?`;
            params.push(criteria.fromDate);
        }

        if (criteria.toDate) {
            query += ` AND i.date <= ?`;
            params.push(criteria.toDate);
        }

        if (criteria.currency) {
            query += ` AND i.currency = ?`;
            params.push(criteria.currency);
        }

        query += ` ORDER BY i.date DESC`;

        const invoices: any[] = [];

        await db.withTransactionAsync(async () => {

            const queryRes: {
                date: string,
                discountAmount: number,
                id: number,
                invoiceNumber: string,
                payed: number,
                recipientName: string,
                shipping: number,
                taxPercentage: number,
                currency: string
            }[] = await db.getAllAsync(
                query,
                ...params
            );

            for (let i = 0; i < queryRes.length; i++) {
                const invoice = queryRes[i];

                // Get subtotal for this invoice

                const subTotalRes: { subtotal: number } | null = await db.getFirstAsync(
                    `SELECT SUM(price * quantity) as subtotal 
                 FROM invoice_items 
                 WHERE invoiceId = ?`,
                    invoice.id
                );

                if (subTotalRes === null) {
                    continue
                }
                const subtotal = subTotalRes.subtotal;
                const netAmount = subtotal - invoice.discountAmount;
                const tax = netAmount * (invoice.taxPercentage / 100);
                const total = netAmount + tax + invoice.shipping;

                invoices.push({
                    id: invoice.id,
                    invoiceNumber: invoice.invoiceNumber,
                    recipientName: invoice.recipientName,
                    date: invoice.date,
                    amount: total.toFixed(2),
                    currency: invoice.currency
                });
            }
        }).catch((err) => {
            console.log('Error geting Invoices', err);
            reject(err);
        })

        resolve(invoices);
    })
}

// Generate invoice statistics

export function getInvoiceStatistics(): Promise<{
    totalInvoices: number,
    paymentDetails: {
        currency: string,
        paidAmount: number,
        unpaidAmount: number
    }[],
    recentInvoices: { id: number, invoiceNumber: string, recipientName: string, date: string, amount: number, currency: string, }[]
}> {
    return new Promise(async (resolve, reject) => {
        const db = await getDatabase();

        let totalInvoices = 0;
        let paymentDetails: {
            currency: string,
            paidAmount: number,
            unpaidAmount: number
        }[] = [];
        let recentInvoices: any[] = [];

        await db.withTransactionAsync(async () => {

            const resCount: { count: number } | null = await db.getFirstAsync(
                `SELECT COUNT(*) as count FROM invoices`
            );

            if (!resCount) {
                reject(false);
                return;
            }

            totalInvoices = resCount.count;

            // Get financial data for all invoices
            const invoicesRes: {
                discountAmount: number,
                id: number,
                payed: number,
                shipping: number,
                taxPercentage: number,
                currency: string
            }[] = await db.getAllAsync(
                `SELECT 
          i.id, i.payed, i.taxPercentage, i.discountAmount, i.shipping,i.currency
         FROM invoices i`
            );

            for (let j = 0; j < AVALABLECURRENCYES.length; j++) {
                let paymentDetail = {
                    currency: AVALABLECURRENCYES[j],
                    paidAmount: 0,
                    unpaidAmount: 0
                };
                for (let i = 0; i < invoicesRes.length; i++) {
                    const invoice = invoicesRes[i];
                    if (invoice.currency === AVALABLECURRENCYES[j]) {
                        const subTotalRes: { subtotal: number } | null = await db.getFirstAsync(
                            `SELECT SUM(price * quantity) as subtotal 
                 FROM invoice_items 
                 WHERE invoiceId = ?`,
                            invoice.id
                        );

                        if (!subTotalRes) {
                            reject(false);
                            continue;
                        }
                        const subtotal = subTotalRes.subtotal;
                        const netAmount = subtotal - invoice.discountAmount;
                        const tax = netAmount * (invoice.taxPercentage / 100);
                        const total = netAmount + tax + invoice.shipping;

                        paymentDetail.paidAmount += invoice.payed;

                        paymentDetail.unpaidAmount += (total - invoice.payed);

                    }
                }
                paymentDetails.push(paymentDetail);
            }

            paymentDetails = paymentDetails.sort((a, b) => (a.paidAmount + b.paidAmount));



            // Get recent invoices
            const resentInvoiceRes: {
                date: string,
                discountAmount: number,
                id: number,
                invoiceNumber: string,
                payed: number,
                recipientName: string,
                shipping: number,
                taxPercentage: number,
                currency: string
            }[] = await db.getAllAsync(
                `SELECT 
                i.id, i.invoiceNumber, i.date, r.name as recipientName,
                i.taxPercentage, i.discountAmount, i.shipping, i.payed,i.currency
              FROM 
                invoices i
              JOIN 
                recipient_info r ON i.id = r.invoiceId
              ORDER BY 
                i.date DESC
              LIMIT 5`,
            );

            for (let i = 0; i < resentInvoiceRes.length; i++) {
                const invoice = resentInvoiceRes[i];

                // Get subtotal for this invoice

                const subTotalRes: { subtotal: number } | null = await db.getFirstAsync(
                    `SELECT SUM(price * quantity) as subtotal 
                     FROM invoice_items 
                     WHERE invoiceId = ?`,
                    invoice.id
                );

                if (subTotalRes === null) {
                    continue
                }
                const subtotal = subTotalRes.subtotal;
                const netAmount = subtotal - invoice.discountAmount;
                const tax = netAmount * (invoice.taxPercentage / 100);
                const total = netAmount + tax + invoice.shipping;

                recentInvoices.push({
                    id: invoice.id,
                    invoiceNumber: invoice.invoiceNumber,
                    recipientName: invoice.recipientName,
                    date: invoice.date,
                    amount: total.toFixed(2),
                    currency: invoice.currency
                });
            }
        })

        resolve({
            totalInvoices,
            paymentDetails,
            recentInvoices
        })
    })
}

export const deleteAllDbData = async (): Promise<void> => {
    const db = await getDatabase();
    try {
        console.log('Attempting to delete all data...');
        await db.withTransactionAsync(async () => {
            await db.execAsync('DELETE FROM settings;');
            //console.log('Deleted data from settings.');
            await db.execAsync('DELETE FROM invoices;');
            //console.log('Deleted data from invoices and related tables (via CASCADE).');
            await db.execAsync("DELETE FROM sqlite_sequence WHERE name='invoices';");
            await db.execAsync("DELETE FROM sqlite_sequence WHERE name='sender_info';");
            await db.execAsync("DELETE FROM sqlite_sequence WHERE name='recipient_info';");
            await db.execAsync("DELETE FROM sqlite_sequence WHERE name='invoice_items';");
            await db.execAsync('DELETE FROM sender_info;');
            await db.execAsync('DELETE FROM recipient_info;');
            await db.execAsync('DELETE FROM invoice_items;');
            //console.log('Reset auto-increment counters.');
        });
        //console.log('All data deleted successfully.');
    } catch (error) {
        //console.error('Failed to delete all data:', error);
        throw error;
    }
};

export type AnalyticsInterval = 'daily' | 'weekly' | 'monthly';

export interface AnalyticsOptions {
    fromDate?: Date;
    toDate?: Date;
    interval?: AnalyticsInterval;
    currency?: string;
}

export interface TimeSeriesDataPoint {
    intervalLabel: string; // e.g., '2023-10-26', '2023-W43', '2023-10'
    /** Sum of (item.price * item.quantity) for all invoices starting in this interval */
    totalItemRevenue: number;
    invoiceCount: number;
    /** Sum of 'payed' amounts for all invoices starting in this interval */
    totalPaidAmount: number;
}

const convertDdMmYyyyToIsoSql = (dateStringColumn: string): string => {
    // Extracts parts and concatenates: YYYY-MM-DD
    return `substr(${dateStringColumn}, 7, 4) || '-' || substr(${dateStringColumn}, 4, 2) || '-' || substr(${dateStringColumn}, 1, 2)`;
};

export interface AnalyticsData {
    summary: {
        /** Sum of (item.price * item.quantity) across all filtered invoices */
        totalItemRevenue: number;
        totalInvoices: number;
        /** Sum of 'payed' amounts across all filtered invoices */
        totalPaidAmount: number;
        /** Calculated: summary.totalItemRevenue - summary.totalPaidAmount. Note: Based on item revenue, not final invoice total. */
        estimatedOutstanding: number;
        /** Calculated: summary.totalItemRevenue / summary.totalInvoices */
        averageItemRevenuePerInvoice: number;
        dateRange: {
            from: string | null; // ISO Date string 'YYYY-MM-DD'
            to: string | null;   // ISO Date string 'YYYY-MM-DD'
        };
        interval: AnalyticsInterval;
        currency?: string | null;
    };
    timeSeries: TimeSeriesDataPoint[];
    clientInvoiceData: ClientInvoiceData[];
}

export interface ClientInvoiceData {
    clientEmail: string;  // Use email as the client identifier
    clientName: string;  // Keep the name for display purposes
    totalInvoiceAmount: number; // Sum of invoice totals (not item revenue)
    totalInvoices: number;
    totalPaidAmount: number;
    totalUnpaidAmount: number;
}

/**
 * Retrieves aggregated invoice data for analytics purposes based on specified options.
 *
 * @param options - Optional filtering and grouping parameters.
 * @param options.fromDate - Start date (inclusive).
 * @param options.toDate - End date (inclusive).
 * @param options.interval - Grouping interval ('daily', 'weekly', 'monthly'). Defaults to 'monthly'.
 * @returns A Promise resolving to an AnalyticsData object.
 */
export const getAnalyticsData = async (
    options: AnalyticsOptions = {}
): Promise<AnalyticsData> => {
    const db = await getDatabase();
    const { fromDate, toDate } = options;
    const interval = options.interval || 'monthly'; // Default to monthly
    const currency = options.currency || "";

    // --- 1. Prepare SQL Filters and Grouping ---
    const whereClauses: string[] = [];
    const params: (string | number)[] = [];
    let fromDateStr: string | null = null;
    let toDateStr: string | null = null;

    const dateConversionSql = convertDdMmYyyyToIsoSql('i.date');

    if (fromDate) {
        // Format the parameter to YYYY-MM-DD for SQL comparison
        const fromDateParam = fromDate.toISOString().slice(0, 10);
        fromDateStr = fromDateParam; // Store YYYY-MM-DD for summary

        whereClauses.push(`date(${dateConversionSql}) >= date(?)`);
        params.push(fromDateParam); // Push the correctly formatted YYYY-MM-DD string
    }
    if (toDate) {
        // Format the parameter to YYYY-MM-DD for SQL comparison
        const toDateParam = toDate.toISOString().slice(0, 10);
        toDateStr = toDateParam; // Store YYYY-MM-DD for summary

        whereClauses.push(`date(${dateConversionSql}) <= date(?)`);
        params.push(toDateParam); // Push the correctly formatted YYYY-MM-DD string
    }
    whereClauses.push('i.currency = ?');
    params.push(currency);

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    let intervalFormat: string;
    let intervalColumnName = 'intervalLabel'; // Alias for the formatted date/week/month

    // Apply strftime to the *converted* date string
    switch (interval) {
        case 'daily':
            intervalFormat = `strftime('%Y-%m-%d', ${dateConversionSql})`;
            break;
        case 'weekly':
            intervalFormat = `strftime('%Y-W%W', ${dateConversionSql})`;
            break;
        case 'monthly':
        default:
            intervalFormat = `strftime('%Y-%m', ${dateConversionSql})`;
            break;
    }

    // --- 2. Construct and Execute the Main Query ---
    // This query calculates sums based on invoice items grouped by the chosen interval.
    const sql = `
      SELECT
        ${intervalFormat} AS ${intervalColumnName},
        SUM(ii.price * ii.quantity) AS totalItemRevenue,
        COUNT(DISTINCT i.id) AS invoiceCount,
        SUM(i.payed) AS totalPaidAmount -- Sum 'payed' field for invoices in the interval
      FROM invoices AS i
      JOIN invoice_items AS ii ON i.id = ii.invoiceId
      ${whereSql}
      GROUP BY ${intervalColumnName}
      ORDER BY ${intervalColumnName} ASC;
    `;

    console.log("Executing analytics query:", sql, params); // For debugging

    let timeSeriesResults: TimeSeriesDataPoint[] = [];
    try {
        // We expect the results to match the TimeSeriesDataPoint structure
        timeSeriesResults = await db.getAllAsync<TimeSeriesDataPoint>(sql, ...params);
        console.log(`Analytics query returned ${timeSeriesResults.length} rows.`);
    } catch (error: any) {
        console.error("Error executing analytics query:", error);
        throw new Error(`Failed to retrieve analytics data: ${error.message}`);
    }

    // --- 3. Calculate Summary Statistics ---
    // We could run a separate SUM query for totals, but iterating the results is often fine
    // unless dealing with *massive* datasets where a separate SUM query might be faster.
    let summaryTotalItemRevenue = 0;
    let summaryTotalInvoices = 0;
    let summaryTotalPaidAmount = 0; // This will be recalculated accurately below

    timeSeriesResults.forEach(point => {
        summaryTotalItemRevenue += point.totalItemRevenue || 0;
        summaryTotalInvoices += point.invoiceCount || 0;
        // The totalPaidAmount from the grouped query might be inflated if an invoice spans items
        // Let's calculate the *actual* total paid for the *unique* invoices counted.
    });

    // Recalculate totalPaidAmount accurately by summing 'payed' only once per unique invoice within the date range
    let accurateTotalPaid = 0;
    if (summaryTotalInvoices > 0) {
        const paidSql = `
            SELECT SUM(payed) as totalPaid
            FROM invoices i
            ${whereSql};
        `;
        try {
            const paidResult = await db.getFirstAsync<{ totalPaid: number }>(paidSql, ...params);
            accurateTotalPaid = paidResult?.totalPaid || 0;
            // Update timeSeries results with proportionally distributed paid amounts (approximation)
            if (summaryTotalItemRevenue > 0) {
                timeSeriesResults = timeSeriesResults.map(point => ({
                    ...point,
                    // Distribute total paid based on interval's revenue share
                    totalPaidAmount: (point.totalItemRevenue / summaryTotalItemRevenue) * accurateTotalPaid
                }));
            } else {
                // If no revenue, distribute evenly (or keep as 0)
                timeSeriesResults = timeSeriesResults.map(point => ({
                    ...point,
                    totalPaidAmount: accurateTotalPaid / timeSeriesResults.length // Or just 0
                }));
            }

        } catch (error) {
            console.error("Error fetching total paid amount:", error);
            // Decide how to handle this - maybe proceed with potentially inaccurate sum from first query?
            // Or throw? Let's log and use 0 for now.
            accurateTotalPaid = 0; // Or throw error?
            timeSeriesResults = timeSeriesResults.map(point => ({ ...point, totalPaidAmount: 0 }));
        }
    } else {
        // If no invoices, ensure paid amount is 0
        timeSeriesResults = timeSeriesResults.map(point => ({ ...point, totalPaidAmount: 0 }));
    }


    const averageItemRevenuePerInvoice = summaryTotalInvoices > 0
        ? summaryTotalItemRevenue / summaryTotalInvoices
        : 0;

    const estimatedOutstanding = summaryTotalItemRevenue - accurateTotalPaid;


    // --- 4. Calculate Client Invoice Data ---
    const clientInvoiceSql = `
        SELECT
        ${intervalFormat} AS ${intervalColumnName},
            ri.email AS clientEmail,
            ri.name AS clientName,
            SUM(ii.price * ii.quantity) AS totalInvoiceAmount,
            COUNT(i.id) AS totalInvoices,
            SUM(i.payed) AS totalPaidAmount,
            SUM(ii.price * ii.quantity - i.payed) AS totalUnpaidAmount
        FROM invoices AS i
        JOIN recipient_info AS ri ON i.id = ri.invoiceId
        JOIN invoice_items AS ii ON i.id = ii.invoiceId
        ${whereSql}
        GROUP BY ${intervalColumnName},ri.email, ri.name
        ORDER BY ri.name,${intervalColumnName} ASC;
    `;

    let clientInvoiceData: ClientInvoiceData[] = [];
    try {
        clientInvoiceData = await db.getAllAsync<ClientInvoiceData>(clientInvoiceSql, ...params);
    } catch (error: any) {
        console.error("Error executing client invoice data query:", error);
        throw new Error(`Failed to retrieve client invoice data: ${error.message}`);
    }


    // --- 5. Assemble Final Result ---
    const analyticsData: AnalyticsData = {
        summary: {
            totalItemRevenue: summaryTotalItemRevenue,
            totalInvoices: summaryTotalInvoices,
            totalPaidAmount: accurateTotalPaid,
            estimatedOutstanding: estimatedOutstanding,
            averageItemRevenuePerInvoice: averageItemRevenuePerInvoice,
            dateRange: {
                from: fromDateStr,
                to: toDateStr,
            },
            interval: interval,
            currency: currency
        },
        timeSeries: timeSeriesResults,
        clientInvoiceData: clientInvoiceData,
    };

    return analyticsData;
};