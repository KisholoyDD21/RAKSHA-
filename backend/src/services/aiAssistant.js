// AI Hazard Assistant.
//
// Calls the real Anthropic Messages API server-side (never expose the key
// to the browser) when ANTHROPIC_API_KEY is configured. If it isn't
// configured, or the call fails for any reason (network, rate limit, bad
// key), this falls back to a genuine rule-based safety-tip engine rather
// than showing an error — the assistant should never just go dark during
// a disaster because a third-party API hiccupped.
//
// Model choice: Claude Sonnet 5 by default for response quality; swap
// ANTHROPIC_MODEL to 'claude-haiku-4-5-20251001' in .env for a faster/
// cheaper option if you're calling this at high volume.

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5';
const ANTHROPIC_TIMEOUT_MS = 12000;

export async function getAIAssistance({ query, context }) {
  if (ANTHROPIC_API_KEY) {
    try {
      const text = await callAnthropic(query, context);
      return { source: 'ai', model: MODEL, text };
    } catch (err) {
      return { source: 'rule-based', text: ruleBasedAssist(query, context), note: `AI call unavailable (${err.message}); showing rule-based guidance.` };
    }
  }
  return { source: 'rule-based', text: ruleBasedAssist(query, context) };
}

async function callAnthropic(query, context) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ANTHROPIC_TIMEOUT_MS);
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 500,
        system: buildSystemPrompt(context),
        messages: [{ role: 'user', content: query }],
      }),
    });
    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      throw new Error(`API ${res.status}${errBody ? ': ' + errBody.slice(0, 120) : ''}`);
    }
    const data = await res.json();
    const text = (data.content || [])
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('\n')
      .trim();
    if (!text) throw new Error('empty response');
    return text;
  } finally {
    clearTimeout(timeout);
  }
}

function buildSystemPrompt(context) {
  const { activeIncidents = [], userLocationLabel, areaAlert } = context || {};
  const incidentSummary = activeIncidents.length
    ? activeIncidents
        .slice(0, 12)
        .map((i) => `- ${i.type} (severity ${i.severity}/5, ${i.status}) near ${i.lat.toFixed(3)},${i.lng.toFixed(3)}${i.description ? ': ' + i.description.slice(0, 100) : ''}`)
        .join('\n')
    : 'No active incidents currently reported.';

  return [
    'You are the RAKSHA Hazard Assistant, embedded in a disaster-response app used in India during active emergencies.',
    'Be calm, specific, and brief (under 150 words unless the question needs a numbered procedure). Prioritize actions the person can take in the next few minutes.',
    'Ground every answer in the live incident data below when it is relevant — do not invent incidents or facilities that are not listed.',
    'For any life-threatening situation, tell the person to call 112 (India\'s unified emergency number) immediately, in addition to any other guidance.',
    'If you are not confident about something specific to the user\'s exact situation, say so plainly rather than guessing.',
    '',
    `Current area alert level: ${areaAlert?.level ?? 'unknown'} (${areaAlert?.label ?? ''})`,
    userLocationLabel ? `User's approximate location: ${userLocationLabel}` : '',
    'Active incidents:',
    incidentSummary,
  ].filter(Boolean).join('\n');
}

// --- Rule-based fallback -----------------------------------------------
// Deliberately simple keyword routing, not a toy: every branch gives a
// real, actionable answer, so offline/no-API-key mode is never a dead end.

const TOPIC_TIPS = {
  flood: 'Move to higher ground immediately. Avoid walking or driving through moving water — 15cm can knock you over, 30cm can float a car. Stay off bridges over fast-moving water. Turn off electricity at the mains if water is entering your home and it is safe to reach the switch.',
  fire: 'Get out immediately, stay low under smoke, and close doors behind you to slow the fire\'s spread. Do not use elevators. If your clothes catch fire: stop, drop, and roll. Once outside, call 101 (fire) or 112 and do not go back in.',
  earthquake: 'Drop, cover, and hold on — get under sturdy furniture and protect your head and neck. Stay away from windows and heavy furniture that could fall. If outdoors, move to open ground away from buildings and power lines. After shaking stops, expect aftershocks.',
  landslide: 'Move away from the slope, not along it — get to the nearest high, stable ground perpendicular to the slide direction. Listen for unusual sounds like cracking trees or rumbling, which can precede a slide. Do not return to evacuated areas until authorities confirm it is safe.',
  chemical: 'Move upwind and uphill from the source immediately. Cover your nose and mouth with a damp cloth if you must pass through fumes. Do not touch or walk through any visible spill or residue. Report the exact location to 112.',
  gas: 'Do not switch on/off any electrical switches or create sparks. Open windows and doors if safe, leave the area immediately, and call for help from outside the building.',
  power: 'Unplug sensitive electronics to protect them from surge on restoration. Keep refrigerators/freezers closed to preserve food. If using a backup generator, run it outdoors only, never indoors or in a garage.',
  shelter: 'Open shelters near you are listed on the Shelters tab, sorted by distance, with live capacity. If your nearest one shows "full," the app will suggest the next-closest option automatically.',
  route: 'Use the Safe Route tool on the Map or SOS tab — it checks live hazard reports along the way and avoids roads passing close to active incidents, falling back to an offline route calculation if live road data isn\'t reachable.',
  sos: 'Tap the SOS button on the SOS tab and hold to confirm — it captures your exact location, logs the incident for responders, and gives you one-tap options to alert your emergency contacts with your location attached.',
  bleeding: 'Apply firm, direct pressure to the wound with a clean cloth. Keep pressing without lifting to check — if blood soaks through, add more cloth on top rather than removing it. Raise the injured area above heart level if possible. Seek medical help for deep or spurting wounds.',
  burn: 'Cool the burn under cool (not ice-cold) running water for 20 minutes. Remove nearby jewelry/tight clothing before swelling starts. Do not apply ice, butter, or ointments. Cover loosely with a clean, non-fluffy cloth and seek medical care for large or deep burns.',
};

function ruleBasedAssist(query, context) {
  const q = (query || '').toLowerCase();
  const matched = Object.keys(TOPIC_TIPS).find((key) => q.includes(key));

  const areaAlert = context?.areaAlert;
  const alertLine = areaAlert
    ? `Current area alert level: ${areaAlert.label} (${areaAlert.level}). ${areaAlert.headline || ''}`
    : '';

  if (matched) {
    return [TOPIC_TIPS[matched], alertLine, 'For any life-threatening emergency, call 112 immediately.']
      .filter(Boolean)
      .join('\n\n');
  }

  const activeCount = context?.activeIncidents?.length ?? 0;
  return [
    `I couldn't find a specific match for that in offline mode, so here's the general picture: ${activeCount} active incident${activeCount === 1 ? '' : 's'} currently reported in your area.`,
    alertLine,
    'Try asking about a specific hazard (flood, fire, earthquake, landslide, chemical leak), or "nearest shelter" / "safe route". For anything life-threatening, call 112 now.',
  ]
    .filter(Boolean)
    .join('\n\n');
}

export const _internal = { ruleBasedAssist, buildSystemPrompt };
