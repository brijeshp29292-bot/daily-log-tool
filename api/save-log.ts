import type { VercelRequest, VercelResponse } from '@vercel/node';
import { appendLogToSheets, ensureSheetExists } from '../src/lib/googleSheets';

const config = {
  clientEmail: process.env.GOOGLE_CLIENT_EMAIL!,
  privateKey: process.env.GOOGLE_PRIVATE_KEY!,
  spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!,
};

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { date, log } = req.body;

  if (!date || !log) {
    return res.status(400).json({ error: 'Date and log are required' });
  }

  try {
    await ensureSheetExists(config);
    await appendLogToSheets(config, date, log);
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Save log error:', error);
    return res.status(500).json({ error: 'Failed to save log' });
  }
}