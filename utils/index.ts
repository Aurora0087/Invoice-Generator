import { NewInvoiceProp } from "@/store/store";

import * as FileSystem from 'expo-file-system';


// Function to convert image to base64
export async function getImageAsBase64(uri: string) {
    try {
        if (uri.length < 1) {
            return '';
        }
        const base64 = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64
        });
        return `data:image/png;base64,${base64}`;
    } catch (error) {
        console.error("Error reading image:", error);
        return '';
    }
}

export function generateHtml(newInvoice: NewInvoiceProp) {
    // Calculate subtotal
    const subtotal = newInvoice.ItemsInfo.items.reduce((total, item) =>
        total + (item.quantity * item.price), 0);

    let grandTotal = subtotal;

    // discount
    const discount = Number(newInvoice.ItemsInfo.discountAmount) || 0;

    grandTotal -= discount;

    // Tax calculation
    const taxRate = Number(newInvoice.ItemsInfo.taxParsentage) / 100 || 0;
    const tax = grandTotal * taxRate;
    grandTotal += tax;

    const shipping = Number(newInvoice.ItemsInfo.shipping) || 0;

    grandTotal += shipping;

    const html = `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Invoice Template</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        }

        html, body {
            width: 100%;
            height: 100%;
            background-color: white;
            overflow-x: hidden;
        }

        .invoice-container {
            background-color: white;
            width: 100%;
            padding: 20px;
            max-width: 100%;
        }

        .invoice-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 1px solid #eee;
        }

        .bold{
        font-weight: bold;
        }

        .invoice-title {
            font-size: 22px;
            font-weight: bold;
            color: #333;
        }

        .invoice-number {
            font-size: 14px;
            color: #666;
            margin-top: 3px;
        }

        .logo-img {
            max-width: 60px;
            max-height: 60px;
            object-fit: contain;
        }

        .invoice-info {
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            margin-bottom: 20px;
        }

        .info-column {
            flex: 1 1 30%;
            min-width: 150px;
            margin-bottom: 15px;
            padding-right: 10px;
        }

        .info-title {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 5px;
            color: #333;
        }

        .info-value {
            font-size: 13px;
            color: #666;
            margin-bottom: 3px;
            line-height: 1.4;
            display: flex;
            flex-shrink: 1;
            text-wrap: pretty;
        }

        .invoice-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            table-layout: fixed;
        }

        .invoice-table th {
            text-align: left;
            padding: 8px 5px;
            font-size: 13px;
            color: #333;
            border-bottom: 1px solid #eee;
        }

        .invoice-table th:last-child {
            text-align: right;
        }

        .invoice-table td {
            padding: 10px 5px;
            font-size: 13px;
            color: #666;
            border-bottom: 1px solid #eee;
            word-wrap: break-word;
        }

        .invoice-table td:last-child {
            text-align: right;
        }

        .service-column {
            width: 50%;
        }

        .qty-column, .rate-column, .total-column {
            width: 16%;
        }

        .service-name {
            font-weight: bold;
            color: #333;
        }

        .service-description {
            font-size: 12px;
            margin-top: 3px;
        }

        .summary-table {
            width: 100%;
            border-collapse: collapse;
        }

        .summary-table td {
            padding: 6px 0;
            font-size: 13px;
        }

        .summary-table td:first-child {
            text-align: left;
        }

        .summary-table td:last-child {
            text-align: right;
        }

        .total-row td {
            font-weight: bold;
            font-size: 15px;
            padding-top: 8px;
            border-top: 1px solid #eee;
        }

        .amount-payed {
            background-color: #f8f0ff;
            padding: 8px;
            margin-top: 10px;
            border-radius: 4px;
            color: #6200ea;
            text-align: right;
            font-weight: bold;
        }

        .amount-payed span:first-child {
            float: left;
        }

        .amount-due {
            background-color: #6200ea;
            color: #f8f0ff;
            padding: 8px;
            margin-top: 10px;
            border-radius: 4px;
            text-align: right;
            font-weight: bold;
        }

        .amount-due span:first-child {
            float: left;
        }

        .footer {
            margin-top: 30px;
            border-top: 1px solid #eee;
            padding-top: 15px;
            position: relative;
        }

        .thank-you {
            font-weight: bold;
            margin-bottom: 6px;
        }

        .payment-notice {
            font-size: 12px;
            color: #666;
            margin-bottom: 15px;
        }

        .checkbox {
            display: inline-block;
            width: 10px;
            height: 10px;
            border: 1px solid #666;
            margin-right: 5px;
            text-align: center;
            line-height: 10px;
            font-size: 8px;
        }

        .contact-info {
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
            font-size: 12px;
            color: #666;
            margin-top: 15px;
        }
        
        .signature-container {
            display: flex;
            justify-content: flex-end;
            margin-top: 20px;
        }
        
        .signature-img {
            max-width: 120px;
            max-height: 60px;
            object-fit: contain;
        }
        
        @media (max-width: 600px) {
            .info-column {
                flex: 1 1 100%;
            }
            
            .contact-info {
                flex-direction: column;
                gap: 5px;
            }
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <div class="invoice-header">
            <div>
                <div class="invoice-title">INVOICE</div>
                <div class="invoice-number">${newInvoice.invoiceInfo.invoiceNumber}</div>
            </div>
            ${newInvoice.logoImg.length > 1 ? `<div class="logo">
                <img class="logo-img" src="${newInvoice.logoImg}" alt="Company Logo">
            </div>`: ``}
        </div>

        <div class="invoice-info">
            <div class="info-column">
                <div class="info-title">Issued (dd/mm/yyyy)</div>
                <div class="info-value">${newInvoice.invoiceInfo.date}</div>
                <div class="info-title" style="margin-top: 12px;">Due (dd/mm/yyyy)</div>
                <div class="info-value">${newInvoice.invoiceInfo.dueDate}</div>
                <div class="info-title" style="margin-top: 12px;">Order #</div>
                <div class="info-value">${newInvoice.invoiceInfo.orderId}</div>
            </div>
            <div class="info-column">
                <div class="info-title">Billed to</div>
                <div class="info-value bold">${newInvoice.recipientInfo.name}</div>
                <div class="info-value">${newInvoice.recipientInfo.address}</div>
                <div class="info-value">${newInvoice.recipientInfo.email}</div>
                <div class="info-value">${!newInvoice.recipientInfo.phone ? '' : newInvoice.recipientInfo.phone}</div>
            </div>
            <div class="info-column">
                <div class="info-title">From</div>
                <div class="info-value">${newInvoice.senderInfo.name}</div>
                <div class="info-value">${newInvoice.senderInfo.address}</div>
                <div class="info-value">${newInvoice.senderInfo.email}</div>
                <div class="info-value">${newInvoice.senderInfo.phone}</div>
                ${newInvoice.senderInfo.taxId && `<div class="info-value">TAX ID:${newInvoice.senderInfo.taxId}</div>`
        }
            </div>
        </div>
        <table class="invoice-table">
            <thead>
                <tr>
                    <th class="service-column">Item</th>
                    <th class="qty-column">Qty</th>
                    <th class="rate-column">Price</th>
                    <th class="total-column">Line total</th>
                </tr>
            </thead>
            <tbody>
            ${newInvoice.ItemsInfo.items.map((itm) =>
            `
        <tr>
                    <td>
                        <div class="service-name">${itm.name}</div>
                    </td>
                    <td>${itm.quantity}</td>
                    <td>${newInvoice.currency}${itm.price.toFixed(2)}</td>
                    <td>${newInvoice.currency}${(itm.quantity * itm.price).toFixed(2)}</td>
                </tr>
        `
        ).join('')
        }
            </tbody>
        </table>

        <table class="summary-table">
            <tr>
                <td>Subtotal</td>
                <td>${newInvoice.currency}${subtotal.toFixed(2)}</td>
            </tr>
            <tr>
                <td>Discount</td>
                <td>-${newInvoice.currency}${discount.toFixed(2)}</td>
            </tr>
            <tr>
                <td>Tax (${taxRate * 100}%)</td>
                <td>${newInvoice.currency}${tax.toFixed(2)}</td>
            </tr>
            <tr>
                <td>Shipping</td>
                <td>${newInvoice.currency}${shipping.toFixed(2)}</td>
            </tr>
            <tr class="total-row">
                <td>Grand Total</td>
                <td>${newInvoice.currency}${grandTotal.toFixed(2)}</td>
            </tr>
        </table>

        <div class="amount-payed">
            <span>Amount Payed</span>
            <span>${newInvoice.currency}${newInvoice.ItemsInfo.payed.toFixed(2)}</span>
        </div>

        <div class="amount-due">
            <span>Amount Due</span>
            <span>${newInvoice.currency}${(grandTotal - newInvoice.ItemsInfo.payed).toFixed(2)}</span>
        </div>

        <div class="footer">
            <div class="thank-you">Thank you for the business!</div>
            <div class="contact-info">
                <div>${newInvoice.senderInfo.phone}</div>
                <div>${newInvoice.senderInfo.email}</div>
            </div>
           ${newInvoice.signImg.length > 1 ? `<div class="signature-container">
                <img class="signature-img" src="${newInvoice.signImg}" alt="Signature">
            </div>`: ``}
        </div>
    </div>
</body>
</html>
`;
    return html;
}


export function formatDate(date: Date) {
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric'
    });
};

export function parseDate(dateStr: string): Date | null {
    const parts = dateStr.split("/");
    if (parts.length !== 3) return null;

    const month = parseInt(parts[0], 10) - 1;
    const day = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);

    const date = new Date(year, month, day);
    return isNaN(date.getTime()) ? null : date;
}