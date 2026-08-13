// Static, bundled content (no API call) so First Aid always works offline —
// the one screen that must never depend on connectivity. Kept in English
// only (unlike the rest of the UI, which is fully bilingual): translating
// medical steps carries real correctness risk, and a subtly wrong
// first-aid translation is worse than none. Nav labels around this content
// are still translated; see i18n/translations.js -> firstAid.topics.

export const FIRST_AID_TOPICS = [
  {
    id: 'bleeding',
    steps: [
      'Apply firm, direct pressure to the wound with a clean cloth or bandage.',
      "If blood soaks through, don't remove the cloth — add more layers on top and keep pressing.",
      'Raise the injured area above heart level if you can do so without causing more pain.',
      'Once bleeding slows, secure the dressing snugly with a bandage — snug, not so tight it cuts circulation.',
      'Watch for signs of shock: pale/cold skin, rapid breathing, dizziness. Lay the person down and keep them warm.',
    ],
    doNot: [
      "Don't remove any object embedded in the wound — pad around it and get medical help.",
      "Don't apply a tourniquet unless you're trained and bleeding is severe and uncontrolled.",
    ],
    callEmergency: 'Heavy or spurting bleeding, bleeding that won\'t stop after 10 minutes of firm pressure, or any deep wound.',
  },
  {
    id: 'burns',
    steps: [
      'Move the person away from the heat source first.',
      'Cool the burn under cool (not ice-cold) running water for 20 minutes.',
      'Remove nearby jewellery or tight clothing before swelling starts.',
      'Cover loosely with a clean, non-fluffy cloth or plastic cling film.',
      "Leave any blisters intact — don't pop them.",
    ],
    doNot: [
      'No ice, butter, oil, toothpaste, or other home remedies on the burn.',
      "Don't peel off clothing that's stuck to the burnt skin.",
    ],
    callEmergency: 'Burns larger than the person\'s palm, burns on the face/hands/genitals, deep or charred-looking burns, or any chemical/electrical burn.',
  },
  {
    id: 'drowning',
    steps: [
      "Get the person out of the water only if it's safe for you — reach with an object or throw a float rather than swimming in if conditions are unsafe.",
      'Check if they are breathing and responsive.',
      "If not breathing, start CPR immediately: 30 chest compressions, then 2 rescue breaths, and repeat.",
      'If breathing but unconscious, place them on their side in the recovery position.',
      'Keep them warm and get medical review even if they seem to recover — symptoms can appear hours later.',
    ],
    doNot: [
      "Don't attempt a swimming rescue unless you're trained — becoming a second victim helps no one.",
      "Don't waste time trying to drain water from the lungs before starting CPR.",
    ],
    callEmergency: 'Always call 112 for any near-drowning, even if the person seems okay afterward.',
  },
  {
    id: 'fractures',
    steps: [
      "Don't move the person unless they're in immediate danger.",
      'Support the injured area in the position you found it — keep it as still as possible.',
      'Immobilize with a padded splint (a rolled magazine, sticks, anything rigid) secured above and below the injury.',
      'Apply a cold pack wrapped in cloth to reduce swelling.',
      'If they show signs of shock, lay them down, keep them warm, and don\'t give food or water.',
    ],
    doNot: [
      "Don't try to straighten or push a bone back into place.",
      "Don't move the person at all if you suspect a head, neck, or spine injury — wait for trained help.",
    ],
    callEmergency: 'Any suspected fracture — especially head, neck, spine, or hip — or a visibly deformed limb.',
  },
  {
    id: 'smoke_inhalation',
    steps: [
      'Move the person to fresh air immediately, only if it\'s safe for you to do so.',
      'Loosen tight clothing around the neck and chest.',
      'Sit them upright if conscious and breathing — it eases the work of breathing.',
      'Watch their breathing and responsiveness closely for the next hour, even if they seem fine.',
      'Begin CPR if they stop breathing.',
    ],
    doNot: [
      "Don't re-enter a smoke-filled space without proper protection.",
      "Don't assume someone is fine just because they're conscious — carbon monoxide symptoms can be delayed.",
    ],
    callEmergency: 'Any smoke exposure in an enclosed space, confusion, severe coughing, or difficulty breathing.',
  },
  {
    id: 'dehydration',
    steps: [
      'Move to a cool, shaded place immediately.',
      'Loosen or remove excess clothing.',
      'Cool the body with damp cloths, especially at the neck, armpits, and groin — fan if possible.',
      'If conscious and able to swallow, give small, frequent sips of water or oral rehydration solution (ORS).',
      'Have them rest lying down with legs slightly raised.',
    ],
    doNot: [
      "Don't give fluids if the person is confused, vomiting, or unconscious — choking risk.",
      "Don't use ice-cold water to cool them — it can cause shivering, which raises body temperature further.",
    ],
    callEmergency: 'Confusion, seizures, very high body temperature, no sweating despite heat, or no improvement within 30 minutes.',
  },
  {
    id: 'panic',
    steps: [
      'Move to a calmer, safer spot together if possible.',
      'Stay with them and speak in a calm, steady voice.',
      'Encourage slow breathing: in for 4 counts, out for 6.',
      'Try grounding: ask them to name 5 things they can see, 4 they can hear, 3 they can touch.',
      'Reassure them plainly that they are safe right now and this feeling will pass.',
    ],
    doNot: [
      'Don\'t dismiss what they\'re feeling or just tell them to "calm down."',
      "Don't leave them alone if you can help it.",
    ],
    callEmergency: 'Chest pain, breathing difficulty that doesn\'t ease, fainting, or any doubt about whether it could be a medical emergency.',
  },
];
