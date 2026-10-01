import { useState, useEffect } from 'react';
import { format, parseISO, subDays } from 'date-fns';

interface LogEntry {
  date: string;
  log: string;
}

export default function LogHistory() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const endDate = format(new Date(), 'yyyy-MM-dd');
      const startDate = format(subDays(new Date(), 30), 'yyyy-MM-dd');
      const response = await fetch(`/api/get-logs?start=${startDate}&end=${endDate}`);
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="history-section">
        <h2>Recent Logs</h2>
        <div className="loading">Loading...</div>
      </section>
    );
  }

  const sortedLogs = [...logs].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <section className="history-section">
      <h2>Recent Logs ({logs.length})</h2>
      {logs.length === 0 ? (
        <p className="empty-state">No logs yet. Start by adding your first log above!</p>
      ) : (
        <div className="logs-list">
          {sortedLogs.map((entry) => (
            <article key={entry.date} className="log-card">
              <div className="log-header">
                <time dateTime={entry.date}>
                  {format(parseISO(entry.date), 'EEEE, MMMM d, yyyy')}
                </time>
              </div>
              <div className="log-content">{entry.log}</div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}