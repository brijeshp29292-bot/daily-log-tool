import ExcelJS from 'exceljs';
import { format } from 'date-fns';

interface LogEntry {
  date: string;
  log: string;
}

export async function generateWeeklyExcel(
  logs: LogEntry[],
  startDate: Date,
  endDate: Date
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Weekly Logs');

  worksheet.columns = [
    { header: 'Date', key: 'date', width: 15 },
    { header: 'Day', key: 'day', width: 12 },
    { header: 'Log', key: 'log', width: 80 },
  ];

  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4472C4' },
  };
  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

  const logsByDate = new Map(logs.map((l) => [l.date, l.log]));

  const current = new Date(startDate);
  while (current <= endDate) {
    const dateStr = format(current, 'yyyy-MM-dd');
    const dayStr = format(current, 'EEEE');
    const log = logsByDate.get(dateStr) || '';

    const row = worksheet.addRow({ date: dateStr, day: dayStr, log });
    row.alignment = { vertical: 'top', wrapText: true };
    current.setDate(current.getDate() + 1);
  }

  worksheet.views = [{ state: 'frozen', ySplit: 1 }];

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}