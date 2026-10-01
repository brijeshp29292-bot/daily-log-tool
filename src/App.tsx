import { useState } from 'react';
import { format } from 'date-fns';
import DailyLogForm from './components/DailyLogForm';
import LogHistory from './components/LogHistory';
import './App.css';

function App() {
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));

  return (
    <div className="app">
      <header className="header">
        <h1>Daily Log</h1>
        <p className="subtitle">Track your daily work • Auto-compiled weekly report every Saturday</p>
      </header>

      <main className="main">
        <DailyLogForm date={selectedDate} onDateChange={setSelectedDate} />
        <LogHistory />
      </main>

      <footer className="footer">
        <p>Data stored in Google Sheets • Report emailed via SendGrid every Saturday</p>
      </footer>
    </div>
  );
}

export default App;