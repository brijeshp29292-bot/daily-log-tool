import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getLogsForWeek } from '../src/lib/googleSheets';
import { generateWeeklyExcel } from '../src/lib/excel';
import { sendWeeklyReport } from '../src/lib/email';
import { subDays, startOfWeek, endOfWeek, format } from 'date-fns';

const sheetsConfig = {
  clientEmail: process.env.GOOGLE_CLIENT_EMAIL!,
  privateKey: process.env.GOOGLE_PRIVATE_KEY!,
  spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!,
};

const emailConfig = {
  sendgridApiKey: process.env.SENDGRID_API_KEY!,
  fromEmail: process.env.FROM_EMAIL!,
  toEmail: process.env.TO_EMAIL!,
};

const CRON_SECRET = process.env.CRON_SECRET!;

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const now = new Date();
    const saturday = endOfWeek(now, { weekStartsOn: 1 });
    const monday = startOfWeek(now, { weekStartsOn: 1 });

    const startStr = format(monday, 'yyyy-MM-dd');
    const endStr = format(saturday, 'yyyy-MM-dd');

    const logs = await getLogsForWeek(sheetsConfig, startStr, endStr);
    const excelBuffer = await generateWeeklyExcel(logs, monday, saturday);
    await sendWeeklyReport(emailConfig, excelBuffer, monday, saturday);

    return res.status(200).json({
      success: true,
      logsCount: logs.length,
      period: `${startStr} to ${endStr}`,
    });
  } catch (error) {
    console.error('Weekly report error:', error);
    return res.status(500).json({ error: 'Failed to generate report' });
  }
}