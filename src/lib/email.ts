import sgMail from '@sendgrid/mail';

interface EmailConfig {
  sendgridApiKey: string;
  fromEmail: string;
  toEmail: string;
}

export async function sendWeeklyReport(
  config: EmailConfig,
  excelBuffer: Buffer,
  startDate: Date,
  endDate: Date
): Promise<void> {
  sgMail.setApiKey(config.sendgridApiKey);

  const startStr = startDate.toISOString().split('T')[0];
  const endStr = endDate.toISOString().split('T')[0];

  const msg = {
    to: config.toEmail,
    from: config.fromEmail,
    subject: `Weekly Log Report: ${startStr} to ${endStr}`,
    text: `Please find attached the weekly log report for ${startStr} to ${endStr}.`,
    html: `
      <h2>Weekly Log Report</h2>
      <p>Period: <strong>${startStr}</strong> to <strong>${endStr}</strong></p>
      <p>This report contains all daily logs submitted during this week.</p>
    `,
    attachments: [
      {
        content: excelBuffer.toString('base64'),
        filename: `weekly-report-${startStr}-to-${endStr}.xlsx`,
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        disposition: 'attachment',
      },
    ],
  };

  await sgMail.send(msg);
}