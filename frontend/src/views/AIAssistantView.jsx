import { useRef, useState } from 'react';
import { Send, Mic, MicOff, Sparkles, BookOpen } from 'lucide-react';

import { useTranslation } from '../i18n/useTranslation.js';
import { useVoice } from '../hooks/useVoice.js';
import { LoadingState } from '../components/StateBlocks.jsx';
import { api } from '../api/client.js';

export function AIAssistantView() {
  const { t } = useTranslation();
  const { supported, listening, startListening, stopListening } = useVoice();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [asking, setAsking] = useState(false);
  const scrollRef = useRef(null);

  const ask = async (query) => {
    const trimmed = query.trim();
    if (!trimmed || asking) return;
    setMessages((prev) => [...prev, { role: 'user', text: trimmed }]);
    setInput('');
    setAsking(true);
    try {
      const result = await api.askAI(trimmed);
      setMessages((prev) => [...prev, { role: 'assistant', text: result.text, source: result.source }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'assistant', text: `${t('common.error')}: ${err.message}`, source: 'error' }]);
    } finally {
      setAsking(false);
      requestAnimationFrame(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    ask(input);
  };

  const handleMic = () => {
    if (listening) { stopListening(); return; }
    startListening((text) => ask(text));
  };

  const suggestions = t('assistant.suggestions');
  const suggestionList = Array.isArray(suggestions) ? suggestions : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '70vh', minHeight: 420 }}>
      <div className="section-header">
        <h2>{t('assistant.title')}</h2>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', paddingBottom: 'var(--space-3)' }}>
        {messages.length === 0 && (
          <div className="card">
            <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginBottom: 'var(--space-2)' }}>{t('assistant.suggestionsLabel')}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {suggestionList.map((s) => (
                <button key={s} type="button" className="chip" style={{ textAlign: 'left', width: 'fit-content' }} onClick={() => ask(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className="card"
            style={{
              maxWidth: '85%',
              alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
              background: m.role === 'user' ? 'var(--ink)' : 'var(--paper-raised)',
              color: m.role === 'user' ? 'var(--paper)' : 'var(--ink)',
            }}
          >
            {m.role === 'assistant' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6, fontSize: 11, color: 'var(--ink-faint)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {m.source === 'ai' ? <Sparkles size={12} /> : <BookOpen size={12} />}
                {m.source === 'ai' ? t('assistant.sourceAi') : t('assistant.sourceRuleBased')}
              </div>
            )}
            <p style={{ margin: 0, fontSize: 14, whiteSpace: 'pre-wrap' }}>{m.text}</p>
          </div>
        ))}

        {asking && <LoadingState label={t('assistant.thinking')} />}
        <div ref={scrollRef} />
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 'var(--space-2)' }}>
        <input
          className="input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('assistant.placeholder')}
        />
        {supported && (
          <button type="button" className={`btn btn--outline${listening ? ' btn--danger' : ''}`} onClick={handleMic}>
            {listening ? <MicOff size={16} /> : <Mic size={16} />}
          </button>
        )}
        <button type="submit" className="btn btn--primary" disabled={asking || !input.trim()}>
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
