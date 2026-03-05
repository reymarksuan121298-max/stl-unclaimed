/**====================================================================
 * BETTING TRACKER - GOOGLE APPS SCRIPT
 *====================================================================*
 *  A: Teller Name
 *  B: Trans. ID
 *  C: Draw Time/Date
 *  D: Bet No.
 *  E: Bet Code
 *  F: Bet Amount
 *  G: Win Amount
 *  H: Collector
 *  I: Status
 *  J: Notification
 *====================================================================*/

const CONFIG = {
    // Multiple sheet names to aggregate data from
    SHEET_NAMES: [
        'OverAllPending',
    ],
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

/*====================================================================
 *  PUBLIC ENDPOINTS (doGet / doPost)
 *====================================================================*/

/**
 * Handles GET requests.
 *   • No query‑param → returns **all** betting data (original behaviour)
 *   • ?collector=NAME → returns only pending rows for that collector,
 *                         with an extra `daysOverdue` field.
 *   • ?action=delete … → unchanged delete handling
 */
function doGet(e) {
    try {
        // ------------------------------------------------------------
        // DELETE handling (unchanged)
        // ------------------------------------------------------------
        if (e.parameter && e.parameter.action === 'delete' && e.parameter.transCode) {
            return handleDelete(e.parameter.transCode, e.parameter.sheetName);
        }

        // ------------------------------------------------------------
        // COLLECTOR‑ONLY view (new)
        // ------------------------------------------------------------
        if (e.parameter && e.parameter.collector) {
            const collectorName = e.parameter.collector.trim();

            // OPTIONAL: verify collector exists in the DB (lightweight HTTP call)
            const userExists = verifyCollectorExists(collectorName);
            if (!userExists) {
                return jsonResponse({
                    success: false,
                    error: `Collector "${collectorName}" not found`
                });
            }

            const allData = getAllBettingData();
            const pending = getCollectorPending(allData, collectorName);

            return jsonResponse({
                success: true,
                timestamp: new Date().toISOString(),
                collector: collectorName,
                count: pending.length,
                data: pending
            });
        }

        // ------------------------------------------------------------
        // FALLBACK – return everything (original behaviour)
        // ------------------------------------------------------------
        const data = getAllBettingData();
        return jsonResponse({
            success: true,
            timestamp: new Date().toISOString(),
            count: data.length,
            data: data
        });

    } catch (error) {
        return jsonResponse({ success: false, error: error.message });
    }
}

/**
 * Helper to build a JSON ContentService response.
 */
function jsonResponse(obj) {
    return ContentService
        .createTextOutput(JSON.stringify(obj))
        .setMimeType(ContentService.MimeType.JSON);
}

/*====================================================================
 *  FILTER FOR COLLECTOR PENDING ITEMS (including 1‑, 2‑, 3‑day)
 *====================================================================*/

/**
 * Returns only rows that belong to *collectorName* **and** have a
 * pending status. Adds a `daysOverdue` integer (0 = today, 1 = yesterday, …).
 *
 * @param {Array<Object>} data   Full data set from all sheets.
 * @param {string} collectorName  Name of the collector (exact match, case‑insensitive).
 * @return {Array<Object>}        Filtered array with extra `daysOverdue`.
 */
function getCollectorPending(data, collectorName) {
    const collectorLower = collectorName.toLowerCase().trim();
    // Normalize: remove spaces and @domain if searching by name
    const collectorSimple = collectorLower.split('@')[0].replace(/\s+/g, '');

    return data
        .filter(row => {
            const rowCollector = (row.collector || '').toString().trim().toLowerCase();
            const rowStatus    = (row.status   || '').toString().trim().toLowerCase();

            // Match collector:
            // 1. Exact match (case insensitive, trimmed)
            // 2. Simple name match (ignore spaces and GFLDN suffix)
            const rowSimple = rowCollector.split('@')[0].replace(/\s+/g, '');
            const matchesCollector = (rowCollector === collectorLower || rowSimple === collectorSimple);
            
            // Match status: empty, 'pending', or 'unclaimed'
            const matchesStatus = (
                rowStatus === 'pending' || 
                rowStatus === 'unclaimed' || 
                rowStatus === ''
            );

            return matchesCollector && matchesStatus;
        })
        .map(row => {
            const daysOverdue = calcDaysOverdue(row.drawTime || null);
            return Object.assign({}, row, { daysOverdue });
        });
}

function verifyCollectorExists(collectorName) {
    // For now, allow any collector name in the parameter list.
    // The filter in the sheet handles data isolation.
    return true;
}

/**
 * Calculates how many whole days have passed between **now** and the
 * supplied `drawTime`. Accepts either a JavaScript [Date](cci:1://file:///c:/Users/HP/Desktop/stl-unclaimed/code.gs:250:0-282:1) object
 * or a string that `new Date()` can parse.
 *
 * @param {any} drawTime  The raw value from the sheet.
 * @return {number|null}  Integer days overdue, or `null` if unparsable.
 */
function calcDaysOverdue(drawTime) {
    if (!drawTime) return null;

    try {
        // If the value is already a Date object, use it directly.
        const drawDate = (drawTime instanceof Date) ? drawTime : new Date(drawTime);
        if (isNaN(drawDate.getTime())) return null;

        const now = new Date();
        const diffMs = now - drawDate;               // milliseconds
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        return diffDays >= 0 ? diffDays : 0;          // never negative
    } catch (e) {
        Logger.log('calcDaysOverdue error: ' + e);
        return null;
    }
}

// verifyCollectorExists removed and simplified above

/*====================================================================
 *  ORIGINAL FUNCTIONS (unchanged – only comments added)
 *====================================================================*/

function getAllBettingData() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let allData = [];
    let summary = [];

    // Loop through each sheet name
    CONFIG.SHEET_NAMES.forEach(sheetName => {
        try {
            const sheet = ss.getSheetByName(sheetName);

            if (!sheet) {
                Logger.log(`❌ Sheet "${sheetName}" not found. Skipping...`);
                summary.push({ sheet: sheetName, status: 'NOT_FOUND', count: 0 });
                return; // Skip this sheet
            }

            const lastRow = sheet.getLastRow();
            Logger.log(`📄 Sheet "${sheetName}" has ${lastRow} total rows`);

            const sheetData = getBettingDataFromSheet(sheet, sheetName);
            allData = allData.concat(sheetData);

            Logger.log(`✅ Fetched ${sheetData.length} valid items from "${sheetName}"`);
            summary.push({ sheet: sheetName, status: 'SUCCESS', count: sheetData.length, totalRows: lastRow });
        } catch (error) {
            Logger.log(`❌ Error fetching from "${sheetName}": ${error.message}`);
            summary.push({ sheet: sheetName, status: 'ERROR', error: error.message, count: 0 });
            // Continue with other sheets even if one fails
        }
    });

    Logger.log(`📊 Total items from all sheets: ${allData.length}`);
    Logger.log('Summary:', JSON.stringify(summary, null, 2));

    return allData;
}

/**
 * Gets betting data from a specific sheet
 */
function getBettingDataFromSheet(sheet, sheetName) {
    const lastRow = sheet.getLastRow();

    if (lastRow < CONFIG.DATA_START_ROW) {
        return [];
    }

    // Get all data (10 columns)
    const dataRange = sheet.getRange(CONFIG.DATA_START_ROW, 1, lastRow - CONFIG.HEADER_ROW, 10);
    const values = dataRange.getValues();

    let filterReasons = {
        noTransId: 0,
        headerRow: 0,
        totalRow: 0,
        emptyRow: 0,
        passed: 0
    };

    const filtered = values.filter(row => {
        const transId = row[CONFIG.COLUMNS.TRANS_ID - 1];
        const tellerName = row[CONFIG.COLUMNS.TELLER_NAME - 1];
        const betNumber = row[CONFIG.COLUMNS.BET_NUMBER - 1];

        // 1. No Transaction ID
        if (!transId) {
            filterReasons.noTransId++;
            return false;
        }

        // 2. Header rows (contain the words “teller” or “trans”)
        if (String(tellerName).toLowerCase().includes('teller') ||
            String(transId).toLowerCase().includes('trans')) {
            filterReasons.headerRow++;
            return false;
        }

        // 3. Summary rows (contain “total”)
        if (String(tellerName).toLowerCase().includes('total')) {
            filterReasons.totalRow++;
            return false;
        }

        // 4. Empty rows (no bet number)
        if (!betNumber) {
            filterReasons.emptyRow++;
            return false;
        }

        filterReasons.passed++;
        return true;
    });

    Logger.log(`🔍 "${sheetName}" filtering: ${filterReasons.passed} passed, ${filterReasons.noTransId} no transId, ${filterReasons.headerRow} headers, ${filterReasons.totalRow} totals, ${filterReasons.emptyRow} empty rows`);

    return filtered.map(row => ({
        tellerName: row[CONFIG.COLUMNS.TELLER_NAME - 1],
        transCode: row[CONFIG.COLUMNS.TRANS_ID - 1],
        drawTime: formatDrawDate(row[CONFIG.COLUMNS.DRAW_TIME - 1]),
        betNumber: row[CONFIG.COLUMNS.BET_NUMBER - 1],
        betCode: row[CONFIG.COLUMNS.BET_CODE - 1],
        betAmount: row[CONFIG.COLUMNS.BET_AMOUNT - 1],
        winAmount: row[CONFIG.COLUMNS.WIN_AMOUNT - 1],
        collector: row[CONFIG.COLUMNS.COLLECTOR - 1],
        status: row[CONFIG.COLUMNS.STATUS - 1],
        notification: row[CONFIG.COLUMNS.NOTIFICATION - 1],
        sheetSource: sheetName // Add sheet source for tracking
    }));
}

/**
 * Handles deletion of a row by transaction code
 */
function handleDelete(transCode, sheetName) {
    try {
        const ss = SpreadsheetApp.getActiveSpreadsheet();

        // If sheetName is provided, only search in that sheet
        const sheetsToSearch = sheetName ? [sheetName] : CONFIG.SHEET_NAMES;

        for (let i = 0; i < sheetsToSearch.length; i++) {
            const sheet = ss.getSheetByName(sheetsToSearch[i]);

            if (!sheet) continue;

            const lastRow = sheet.getLastRow();
            if (lastRow < CONFIG.DATA_START_ROW) continue;

            // Find the row with matching transaction code
            const dataRange = sheet.getRange(CONFIG.DATA_START_ROW, CONFIG.COLUMNS.TRANS_ID, lastRow - CONFIG.HEADER_ROW, 1);
            const values = dataRange.getValues();

            let rowToDelete = -1;
            for (let j = 0; j < values.length; j++) {
                if (values[j][0] === transCode) {
                    rowToDelete = CONFIG.DATA_START_ROW + j;
                    break;
                }
            }

            if (rowToDelete !== -1) {
                // Delete the row
                sheet.deleteRow(rowToDelete);

                return jsonResponse({
                    success: true,
                    message: 'Row deleted successfully',
                    transCode: transCode,
                    sheetName: sheetsToSearch[i]
                });
            }
        }

        return jsonResponse({ success: false, error: 'Transaction not found in any sheet' });

    } catch (error) {
        return jsonResponse({ success: false, error: error.message });
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
 * Handles POST requests (Optional)
 */
function doPost(e) {
    try {
        const params = JSON.parse(e.postData.contents);
        const ss = SpreadsheetApp.getActiveSpreadsheet();

        // Use the first sheet by default or specified sheet
        const sheetName = params.sheetName || CONFIG.SHEET_NAMES[0];
        const sheet = ss.getSheetByName(sheetName);

        if (!sheet) {
            throw new Error(`Sheet "${sheetName}" not found`);
        }

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

        return jsonResponse({
            success: true,
            message: 'Record added successfully',
            sheetName: sheetName
        });

    } catch (error) {
        return jsonResponse({ success: false, error: error.message });
    }
}

/**
 * Adds a custom menu to the spreadsheet UI
 */
function onOpen() {
    const ui = SpreadsheetApp.getUi();
    ui.createMenu('🎰 Pending List Tools')
        .addItem('📊 Refresh Data Connection', 'doGet')
        .addToUi();
}
