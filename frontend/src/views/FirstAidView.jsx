import { useState } from 'react';
import { ChevronDown, Volume2, VolumeX, PhoneCall, ShieldAlert } from 'lucide-react';

import { useTranslation } from '../i18n/useTranslation.js';
import { useVoice } from '../hooks/useVoice.js';
import { FIRST_AID_TOPICS } from '../data/firstAidContent.js';

export function FirstAidView() {
  const { t } = useTranslation();
  const { speak, synthesisSupported, listening } = useVoice();
  const [openTopic, setOpenTopic] = useState(null);
  const [readingTopic, setReadingTopic] = useState(null);

  const readAloud = (topic) => {
    const text = [
      t(`firstAid.topics.${topic.id}`),
      ...topic.steps,
      `Do not: ${topic.doNot.join('. ')}`,
      `Call for help: ${topic.callEmergency}`,
    ].join('. ');
    setReadingTopic(topic.id);
    speak(text);
  };

  const stopReading = () => {
    window.speechSynthesis?.cancel();
    setReadingTopic(null);
  };

  return (
    <div>
      <div className="section-header">
        <h2>{t('firstAid.title')}</h2>
      </div>

      <div className="card" style={{ marginBottom: 'var(--space-4)', borderColor: 'var(--alert-orange)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <ShieldAlert size={18} color="var(--alert-orange)" style={{ flexShrink: 0 }} />
          <p style={{ fontSize: 13, margin: 0 }}>{t('firstAid.disclaimer')}</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {FIRST_AID_TOPICS.map((topic) => {
          const isOpen = openTopic === topic.id;
          return (
            <div key={topic.id} className="card">
              <button
                type="button"
                onClick={() => setOpenTopic(isOpen ? null : topic.id)}
                style={{
                  all: 'unset', cursor: 'pointer', display: 'flex', width: '100%',
                  alignItems: 'center', justifyContent: 'space-between', fontWeight: 700, fontSize: 16,
                }}
              >
                {t(`firstAid.topics.${topic.id}`)}
                <ChevronDown size={18} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }} />
              </button>

              {isOpen && (
                <div style={{ marginTop: 'var(--space-4)' }}>
                  <ol style={{ paddingLeft: 20, listStyle: 'decimal', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {topic.steps.map((step, i) => (
                      <li key={i} style={{ fontSize: 14 }}>{step}</li>
                    ))}
                  </ol>

                  <div style={{ marginTop: 'var(--space-3)', background: 'var(--paper-muted)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3)' }}>
                    <strong style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Don't</strong>
                    <ul style={{ marginTop: 4, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {topic.doNot.map((item, i) => (
                        <li key={i} style={{ fontSize: 13, color: 'var(--ink-soft)' }}>• {item}</li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ marginTop: 'var(--space-3)', display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)', color: 'var(--alert-red)' }}>
                    <PhoneCall size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{topic.callEmergency}</span>
                  </div>

                  {synthesisSupported && (
                    <button
                      type="button"
                      className="btn btn--outline btn--sm"
                      style={{ marginTop: 'var(--space-3)' }}
                      onClick={() => (readingTopic === topic.id ? stopReading() : readAloud(topic))}
                    >
                      {readingTopic === topic.id ? <VolumeX size={14} /> : <Volume2 size={14} />}
                      {readingTopic === topic.id ? t('firstAid.stopReading') : t('firstAid.readAloud')}
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
