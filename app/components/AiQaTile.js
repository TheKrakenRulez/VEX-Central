import { useState } from 'react';

export default function AiQaTile() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    setLoading(true);
    setError(null);
    setAnswer('');
    try {
      const res = await fetch('/api/qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });
      if (!res.ok) throw new Error('Server error');
      const data = await res.json();
      setAnswer(data.answer);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(answer);
    } catch (_) {}
  };

  return (
    <div className="bg-slate-900/30 backdrop-blur-md border border-slate-700 rounded-xl p-6 shadow-xl hover:shadow-2xl transition-shadow">
      <h2 className="text-xl font-bold text-white mb-4">VEX Manual Q&amp;A</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <textarea
          className="w-full p-2 bg-slate-800 text-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
          rows={3}
          placeholder="Ask a question about the game manual..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md transition-colors disabled:opacity-50"
        >
          {loading ? 'Thinking…' : 'Ask'}
        </button>
      </form>
      {error && <p className="mt-2 text-red-400">Error: {error}</p>}
      {answer && (
        <div className="mt-4 p-3 bg-slate-800 rounded-md text-slate-100 relative">
          <p>{answer}</p>
          <button
            className="absolute top-2 right-2 text-slate-400 hover:text-slate-200"
            onClick={copyToClipboard}
            title="Copy answer"
          >
            📋
          </button>
        </div>
      )}
    </div>
  );
}
