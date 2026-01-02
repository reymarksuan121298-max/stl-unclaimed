/**
 * ============================================================================
 * BETTING TRACKER - GOOGLE APPS SCRIPT
 * ============================================================================
 * 
 * Based on the final structure:
 * A: Teller Name
 * B: Trans. ID
 * C: Draw Time/Date
 * D: Bet No.
 * E: Bet Code
 * F: Bet Amount
 * G: Win Amount
 * H: Collector
 * I: Status
 * J: Notification
 */

const CONFIG = {
    SHEET_NAME: 'OverAllPending',
    HEADER_ROW: 1,
    DATA_START_ROW: 2,

    // Column mapping based on final structure
    COLUMNS: {
        TELLER_NAME: 1,    // A
        TRANS_ID: 2,       // B
        DRAW_TIME: 3,      // C
        BET_NUMBER: 4,     // D
        BET_CODE: 5,       // E
        BET_AMOUNT: 6,     // F
        WIN_AMOUNT: 7,     // G
        COLLECTOR: 8,      // H
        STATUS: 9,         // I
        NOTIFICATION: 10   // J
    }
};

/**
 * Handles GET requests - Returns betting data as JSON or handles DELETE
 */
function doGet(e) {
    try {
        const sheet = getSheet();

        // Check if this is a DELETE request (via query parameter)
        if (e.parameter && e.parameter.action === 'delete' && e.parameter.transCode) {
            return handleDelete(sheet, e.parameter.transCode);
        }

        // Otherwise, return all data
        const data = getBettingData(sheet);

        const response = {
            success: true,
            timestamp: new Date().toISOString(),
            count: data.length,
            data: data
        };

        return ContentService
            .createTextOutput(JSON.stringify(response))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        return ContentService
            .createTextOutput(JSON.stringify({ success: false, error: error.message }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}

/**
 * Helper to get the sheet
 */
function getSheet() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(CONFIG.SHEET_NAME) || ss.getActiveSheet();
    return sheet;
}

/**
 * Handles deletion of a row by transaction code
 */
function handleDelete(sheet, transCode) {
    try {
        const lastRow = sheet.getLastRow();

        if (lastRow < CONFIG.DATA_START_ROW) {
            return ContentService
                .createTextOutput(JSON.stringify({ success: false, error: 'No data to delete' }))
                .setMimeType(ContentService.MimeType.JSON);
        }

        // Find the row with matching transaction code
        const dataRange = sheet.getRange(CONFIG.DATA_START_ROW, CONFIG.COLUMNS.TRANS_ID, lastRow - CONFIG.HEADER_ROW, 1);
        const values = dataRange.getValues();

        let rowToDelete = -1;
        for (let i = 0; i < values.length; i++) {
            if (values[i][0] === transCode) {
                rowToDelete = CONFIG.DATA_START_ROW + i;
                break;
            }
        }

        if (rowToDelete === -1) {
            return ContentService
                .createTextOutput(JSON.stringify({ success: false, error: 'Transaction not found' }))
                .setMimeType(ContentService.MimeType.JSON);
        }

        // Delete the row
        sheet.deleteRow(rowToDelete);

        return ContentService
            .createTextOutput(JSON.stringify({
                success: true,
                message: 'Row deleted successfully',
                transCode: transCode
            }))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        return ContentService
            .createTextOutput(JSON.stringify({ success: false, error: error.message }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}


/**
 * Formats date value to "9PM 2025-12-30" format
 */
function formatDrawDate(dateValue) {
    if (!dateValue) return '';

    try {
        // First check if it's a string (most common from plain text cells)
        if (typeof dateValue === 'string') {
            return dateValue.trim();
        }

        // Check if it's a Date object
        if (dateValue instanceof Date && !isNaN(dateValue.getTime())) {
            // Get hour and determine AM/PM
            const hour = dateValue.getHours();
            const period = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour % 12 || 12;

            // Format date as YYYY-MM-DD
            const formattedDate = Utilities.formatDate(dateValue, Session.getScriptTimeZone(), 'yyyy-MM-dd');

            return `${displayHour}${period} ${formattedDate}`;
        }

        // Otherwise convert to string
        return String(dateValue).trim();

    } catch (error) {
        Logger.log('Error formatting date: ' + error.message);
        return String(dateValue);
    }
}

/**
 * Gets all betting data from the sheet
 */
function getBettingData(sheet) {
    const lastRow = sheet.getLastRow();

    if (lastRow < CONFIG.DATA_START_ROW) {
        return [];
    }

    // Get all data (10 columns)
    const dataRange = sheet.getRange(CONFIG.DATA_START_ROW, 1, lastRow - CONFIG.HEADER_ROW, 10);
    const values = dataRange.getValues();

    return values
        .filter(row => {
            const transId = row[CONFIG.COLUMNS.TRANS_ID - 1];
            const tellerName = row[CONFIG.COLUMNS.TELLER_NAME - 1];

            // Filter out rows that:
            // 1. Don't have a Transaction ID
            // 2. Have "Teller" or "Teller Name" as teller name (header rows)
            // 3. Have "Trans. ID" or similar as trans ID (header rows)
            if (!transId) return false;
            if (String(tellerName).toLowerCase().includes('teller')) return false;
            if (String(transId).toLowerCase().includes('trans')) return false;

            return true;
        })
        .map(row => ({
            tellerName: row[CONFIG.COLUMNS.TELLER_NAME - 1],
            transCode: row[CONFIG.COLUMNS.TRANS_ID - 1],
            drawTime: formatDrawDate(row[CONFIG.COLUMNS.DRAW_TIME - 1]), // Format the date
            betNumber: row[CONFIG.COLUMNS.BET_NUMBER - 1],
            betCode: row[CONFIG.COLUMNS.BET_CODE - 1],
            betAmount: row[CONFIG.COLUMNS.BET_AMOUNT - 1],
            winAmount: row[CONFIG.COLUMNS.WIN_AMOUNT - 1],
            collector: row[CONFIG.COLUMNS.COLLECTOR - 1],
            status: row[CONFIG.COLUMNS.STATUS - 1],
            notification: row[CONFIG.COLUMNS.NOTIFICATION - 1]
        }));
}

/**
 * Handles POST requests (Optional)
 */
function doPost(e) {
    try {
        const params = JSON.parse(e.postData.contents);
        const sheet = getSheet();

        sheet.appendRow([
            params.tellerName || '',
            params.transCode || '',
            params.drawTime || '',
            params.betNumber || '',
            params.betCode || '',
            params.betAmount || 0,
            params.winAmount || 0,
            params.collector || '',
            params.status || 'pending',
            params.notification || ''
        ]);

        return ContentService
            .createTextOutput(JSON.stringify({ success: true, message: 'Record added successfully' }))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        return ContentService
            .createTextOutput(JSON.stringify({ success: false, error: error.message }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}

function onOpen() {
    const ui = SpreadsheetApp.getUi();
    ui.createMenu('🎰 Pending List Tools')
        .addItem('📊 Refresh Data Connection', 'doGet')
        .addToUi();
}