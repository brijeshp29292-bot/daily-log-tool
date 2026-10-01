import { useState } from 'react';
import type { FormEvent } from 'react';
import { format, parseISO } from 'date-fns';

interface DailyLogFormProps {
  date: string;
  onDateChange: (date: string) => void;
}

export default function DailyLogForm({ date, onDateChange }: DailyLogFormProps) {
  const [log, setLog] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!log.trim()) return;

    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/save-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, log: log.trim() }),
      });

      if (!response.ok) throw new Error('Failed to save');

      setMessage({ type: 'success', text: 'Log saved successfully!' });
      setLog('');
    } catch {
      setMessage({ type: 'error', text: 'Failed to save log. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const formattedDate = format(parseISO(date), 'EEEE, MMMM d, yyyy');

  return (
    <section className="log-form-section">
      <h2>Add Log for {formattedDate}</h2>

      <form onSubmit={handleSubmit} className="log-form">
        <div className="date-picker">
          <label htmlFor="log-date">Date:</label>
          <input
            id="log-date"
            type="date"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            max={format(new Date(), 'yyyy-MM-dd')}
          />
        </div>

        <div className="textarea-wrapper">
          <label htmlFor="log-text">What did you do today?</label>
          <textarea
            id="log-text"
            value={log}
            onChange={(e) => setLog(e.target.value)}
            placeholder="Write your daily log here...&#10;&#10;Example:&#10;- Completed feature X&#10;- Fixed bug in module Y&#10;- Meeting with team about Z&#10;- Blockers: waiting for API access"
            rows={8}
            spellCheck={true}
          />
        </div>

        {message && (
          <div className={`message ${message.type}`}>{message.text}</div>
        )}

        <button type="submit" disabled={saving || !log.trim()} className="save-btn">
          {saving ? 'Saving...' : 'Save Log'}
        </button>
      </form>
    </section>
  );
}