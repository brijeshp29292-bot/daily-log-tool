import { google, sheets_v4 } from 'googleapis';
import { JWT } from 'google-auth-library';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

interface SheetsConfig {
  clientEmail: string;
  privateKey: string;
  spreadsheetId: string;
}

function getSheetsClient(config: SheetsConfig): sheets_v4.Sheets {
  const auth = new JWT({
    email: config.clientEmail,
    key: config.privateKey.replace(/\\n/g, '\n'),
    scopes: SCOPES,
  });

  return google.sheets({ version: 'v4', auth });
}

export async function appendLogToSheets(
  config: SheetsConfig,
  date: string,
  log: string
): Promise<void> {
  const sheets = getSheetsClient(config);
  await sheets.spreadsheets.values.append({
    spreadsheetId: config.spreadsheetId,
    range: 'Logs!A:B',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[date, log]],
    },
  });
}

export async function getLogsForWeek(
  config: SheetsConfig,
  startDate: string,
  endDate: string
): Promise<Array<{ date: string; log: string }>> {
  const sheets = getSheetsClient(config);
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: config.spreadsheetId,
    range: 'Logs!A:B',
  });

  const rows = response.data.values || [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  return rows
    .filter((row) => {
      const rowDate = new Date(row[0]);
      return rowDate >= start && rowDate <= end;
    })
    .map((row) => ({ date: row[0], log: row[1] || '' }));
}

export async function ensureSheetExists(config: SheetsConfig): Promise<void> {
  const sheets = getSheetsClient(config);
  try {
    await sheets.spreadsheets.get({ spreadsheetId: config.spreadsheetId });
  } catch {
    throw new Error('Spreadsheet not found. Check SPREADSHEET_ID.');
  }

  const metadata = await sheets.spreadsheets.get({
    spreadsheetId: config.spreadsheetId,
  });

  const hasLogsSheet = metadata.data.sheets?.some(
    (s) => s.properties?.title === 'Logs'
  );

  if (!hasLogsSheet) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: config.spreadsheetId,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: {
                title: 'Logs',
                gridProperties: { frozenRowCount: 1 },
              },
            },
          },
        ],
      },
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId: config.spreadsheetId,
      range: 'Logs!A1:B1',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [['Date', 'Log']],
      },
    });
  }
}