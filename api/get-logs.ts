import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getLogsForWeek } from '../src/lib/googleSheets';

const config = {
  clientEmail: process.env.GOOGLE_CLIENT_EMAIL!,
  privateKey: process.env.GOOGLE_PRIVATE_KEY!,
  spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!,
};

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { start, end } = req.query;

  if (!start || !end || typeof start !== 'string' || typeof end !== 'string') {
    return res.status(400).json({ error: 'Start and end dates required' });
  }

  try {
    const logs = await getLogsForWeek(config, start, end);
    return res.status(200).json({ logs });
  } catch (error) {
    console.error('Get logs error:', error);
    return res.status(500).json({ error: 'Failed to fetch logs' });
  }
}