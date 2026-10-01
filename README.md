# Daily Log Tool

A simple iOS-friendly web app for daily logging. Enter your daily work in a text box, and every Saturday at 9 AM, it automatically compiles Monday-Saturday logs into an Excel file and emails it to you.

## Features

- **Single text area** for daily logs - simple and fast
- **Date picker** - log for any day (up to today)
- **History view** - see your recent logs
- **Google Sheets storage** - free, reliable, accessible anywhere
- **Automated weekly reports** - runs every Saturday at 9 AM via Vercel Cron
- **Excel export** - professionally formatted with dates, days, and logs
- **Email delivery** - via SendGrid
- **iOS optimized** - installable as PWA, works offline-ready
- **Dark mode support** - automatic based on system preference

## Quick Start

### 1. Clone and Install

```bash
git clone <your-repo>
cd daily-log-tool
npm install
```

### 2. Set Up Google Sheets

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Google Sheets API**
4. Create a **Service Account**:
   - IAM & Admin → Service Accounts → Create Service Account
   - Grant **Editor** role (optional, but useful)
   - Create and download JSON key
5. Create a **Google Spreadsheet**:
   - Note the Spreadsheet ID from URL: `https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit`
   - Share the spreadsheet with your service account email (Editor access)

### 3. Set Up SendGrid

1. Create a [SendGrid account](https://sendgrid.com/)
2. Verify a sender email (Settings → Sender Authentication)
3. Create an API Key (Settings → API Keys) with **Mail Send** permissions

### 4. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```env
GOOGLE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----"
GOOGLE_SPREADSHEET_ID=your_spreadsheet_id

SENDGRID_API_KEY=SG.your_sendgrid_api_key
FROM_EMAIL=your-verified-sender@domain.com
TO_EMAIL=recipient@domain.com

CRON_SECRET=generate-a-random-string-here
```

### 5. Deploy to Vercel

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com/)
3. Add all environment variables in Vercel dashboard
4. Deploy!

The cron job will automatically run every Saturday at 9 AM UTC.

### 6. Local Development

```bash
npm run dev
```

Open http://localhost:5173

## Project Structure

```
daily-log-tool/
├── api/                    # Vercel serverless functions
│   ├── save-log.ts         # Save daily log to Google Sheets
│   ├── get-logs.ts         # Fetch logs for history view
│   └── weekly-report.ts    # Cron job: compile & email weekly report
├── src/
│   ├── components/
│   │   ├── DailyLogForm.tsx  # Main input form
│   │   └── LogHistory.tsx    # Recent logs display
│   ├── lib/
│   │   ├── googleSheets.ts   # Google Sheets API wrapper
│   │   ├── excel.ts          # Excel generation with ExcelJS
│   │   └── email.ts          # SendGrid email sending
│   ├── App.tsx               # Main app component
│   ├── App.css               # iOS-friendly styles
│   └── main.tsx              # Entry point
├── vercel.json               # Vercel config with cron
├── .env.example              # Environment variables template
└── package.json
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/save-log` | Save a daily log |
| GET | `/api/get-logs?start=...&end=...` | Fetch logs for date range |
| GET | `/api/weekly-report` | **Cron only** - Generate & email weekly report |

The weekly report endpoint requires `Authorization: Bearer {CRON_SECRET}` header.

## Customization

### Change Report Schedule

Edit `vercel.json` cron schedule (cron format):
```json
"crons": [
  { "path": "/api/weekly-report", "schedule": "0 9 * * 6" }
]
```
Current: Saturday 9:00 AM UTC

### Modify Excel Format

Edit `src/lib/excel.ts` to change columns, styling, or add sheets.

### Add Fields to Log

1. Update `DailyLogForm.tsx` with new inputs
2. Update `save-log.ts` to store additional fields
3. Update `excel.ts` to include in report
4. Update Google Sheets header row

## iOS Installation

1. Open the deployed URL in Safari
2. Tap **Share** → **Add to Home Screen**
3. Opens full-screen like a native app

## Troubleshooting

**Logs not saving?**
- Check Google Sheets API is enabled
- Verify service account has Editor access to spreadsheet
- Check `GOOGLE_PRIVATE_KEY` has `\n` not actual newlines

**Emails not sending?**
- Verify SendGrid API key has Mail Send permission
- Check FROM_EMAIL is verified in SendGrid
- Check spam folder

**Cron not running?**
- Verify `CRON_SECRET` matches in Vercel env vars
- Check Vercel Functions logs for errors
- Ensure project is on Pro plan (crons require Pro)

## License

MIT