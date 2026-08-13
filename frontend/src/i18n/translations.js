// Full UI coverage for English and Hindi. The lookup structure is a flat
// dot-path object per language rather than deeply nested, which keeps
// t('sos.holdToConfirm') simple and makes it obvious at a glance which
// keys still need translating when adding a third language.

export const translations = {
  en: {
    appName: 'RAKSHA',
    tagline: 'Disaster Response Grid',

    nav: {
      map: 'Map', sos: 'SOS', shelters: 'Shelters', report: 'Report', broadcasts: 'Alerts',
      family: 'Family', firstAid: 'First Aid', assistant: 'Assistant', admin: 'Admin', settings: 'Settings',
    },

    alert: {
      green: 'All Clear', yellow: 'Watch', orange: 'Be Prepared', red: 'Take Action',
      activeCount: 'active incident(s)',
    },

    common: {
      loading: 'Loading…', retry: 'Retry', cancel: 'Cancel', save: 'Save', close: 'Close',
      confirm: 'Confirm', submit: 'Submit', away: 'away', viewOnMap: 'View on map',
      getDirections: 'Get directions', call: 'Call', share: 'Share',
      offlineBanner: "You're offline — showing the last data downloaded. New reports will be queued and sent automatically once you're back online.",
      onlineAgain: 'Back online — syncing…', noResults: 'Nothing to show here yet.',
      error: 'Something went wrong', tryAgain: 'Try again',
    },

    sos: {
      title: 'Emergency SOS', holdToConfirm: 'HOLD TO SEND SOS',
      holdInstructions: 'Press and hold for 2 seconds to send your live location to responders.',
      typeLabel: 'What kind of emergency is this?',
      types: { medical: 'Medical', fire: 'Fire', flood: 'Flood', trapped: 'Trapped', violence: 'Violence', accident: 'Accident', other: 'Other' },
      locating: 'Getting your exact location…',
      sent: 'SOS sent — this location is now visible to responders',
      nearestHelp: 'Nearest help from here', notifyContacts: 'Alert your emergency contacts',
      notifyHint: 'Opens WhatsApp/SMS pre-filled with your live location — nothing sends automatically without you tapping through.',
      noContacts: 'Add emergency contacts in Settings to enable one-tap alerts.',
      locationDenied: 'Location access is required for SOS. Enable it in your browser/device settings and try again.',
      cancel: 'Release to cancel',
    },

    map: {
      title: 'Live Disaster Map', layers: 'Layers', hazards: 'Hazards', facilities: 'Facilities',
      planRoute: 'Plan a safe route', origin: 'Origin', destination: 'Destination', useMyLocation: 'Use my location',
      findRoute: 'Find safest route', routeVia: 'Routed via', sourceOsrm: 'live road network',
      sourceGrid: 'offline estimated route (road network unreachable)', hazardsAvoided: 'hazard zone(s) considered',
      distance: 'Distance', duration: 'Est. time', clearRoute: 'Clear route',
      severity: 'Severity', reportedAgo: 'reported', tapForDetails: 'Tap a marker for details',
    },

    shelters: {
      title: 'Shelters & Facilities', all: 'All', shelter: 'Shelters', hospital: 'Hospitals',
      relief_camp: 'Relief Camps', police: 'Police', fire_station: 'Fire Stations', resource_point: 'Resource Points',
      capacity: 'Capacity', occupancy: 'Occupancy', status: { open: 'Open', full: 'Full', closed: 'Closed' },
      sortedByDistance: 'Sorted by distance from you', enableLocation: 'Enable location to sort by distance',
    },

    report: {
      title: 'Report an Incident', type: 'Type of incident', description: 'Description (optional)',
      descriptionPlaceholder: 'What are you seeing? Water level, fire size, how many lanes blocked…',
      severity: 'Severity', severityHint: '1 = minor, 5 = severe/life-threatening', addPhoto: 'Add a photo',
      removePhoto: 'Remove photo', location: 'Location', useMyLocation: 'Use my current location', pickOnMap: 'Or tap the map to place it',
      submit: 'Submit report', queuedOffline: "You're offline — this report is saved and will send automatically once you're back online.",
      submitted: 'Report submitted — thank you, this helps the whole community.',
      needLocation: 'Please set a location for this report.',
      confirmReport: 'Confirm', disputeReport: 'Dispute', confirmations: 'confirmations', disputes: 'disputes',
      confidence: 'Confidence', status: { unverified: 'Unverified', verified: 'Verified', disputed: 'Disputed', resolved: 'Resolved' },
      types: {
        flood: 'Flood', fire: 'Fire', accident: 'Accident', roadblock: 'Roadblock', landslide: 'Landslide',
        storm: 'Storm', earthquake: 'Earthquake', building_collapse: 'Building Collapse',
        power_outage: 'Power Outage', chemical_leak: 'Chemical Leak', other: 'Other',
      },
    },

    broadcasts: {
      title: 'Official Alerts', newBroadcast: 'New broadcast', category: 'Category', priority: 'Priority level',
      titleLabel: 'Title', message: 'Message', send: 'Send broadcast', sent: 'Broadcast sent to all users',
      categories: {
        evacuation: 'Evacuation', road_closure: 'Road Closure', weather: 'Weather', shelter_update: 'Shelter Update',
        safety_instruction: 'Safety Instruction', general: 'General',
      },
    },

    family: {
      title: 'Family Safety', groupCode: 'Family group code', groupCodeHint: 'Share this code with family — anyone who enters it can see and update the group\'s status.',
      createGroup: 'Create a new group', joinGroup: 'Join with a code', yourName: 'Your name',
      iAmSafe: "I'm safe", iNeedHelp: 'I need help', unknown: 'Unknown', checkIn: 'Check in',
      lastUpdated: 'Last updated', noMembers: 'No one has checked in to this group yet. Share the code to get started.',
      shareCode: 'Share group code',
    },

    firstAid: {
      title: 'First Aid Guide', readAloud: 'Read aloud', stopReading: 'Stop', disclaimer:
        'General guidance only — not a substitute for professional care or certified first-aid training. Call 112 for any life-threatening emergency.',
      topics: {
        bleeding: 'Bleeding', burns: 'Burns', drowning: 'Drowning', fractures: 'Fractures',
        smoke_inhalation: 'Smoke Inhalation', dehydration: 'Dehydration & Heat Illness', panic: 'Panic & Acute Stress',
      },
    },

    assistant: {
      title: 'AI Hazard Assistant', placeholder: 'Ask about a hazard, a safe route, or what to do right now…',
      ask: 'Ask', thinking: 'Thinking…', sourceAi: 'AI-generated', sourceRuleBased: 'Rule-based (offline-safe) guidance',
      suggestionsLabel: 'Try asking:',
      suggestions: ['What should I do about the flooding near me?', 'Where is the nearest open shelter?', 'Is it safe to travel through Byculla right now?'],
    },

    admin: {
      title: 'Responder Dashboard', login: 'Admin Login', passcode: 'Passcode', loginButton: 'Log in',
      loginError: 'Incorrect passcode', logout: 'Log out', priorityQueue: 'Priority Queue',
      activeIncidents: 'Active Incidents', activeSos: 'Active SOS', avgShelterOccupancy: 'Avg. Shelter Occupancy',
      verifiedShare: 'Verified Reports', markResolved: 'Mark resolved', updateStatus: 'Update status',
      manageFacilities: 'Manage Facilities', updateOccupancy: 'Update occupancy',
    },

    settings: {
      title: 'Settings', language: 'Language', yourName: 'Your name', yourNamePlaceholder: 'Optional — shown on your reports',
      emergencyContacts: 'Emergency Contacts', addContact: 'Add contact', contactName: 'Name', contactPhone: 'Phone number',
      familyGroupCode: 'Default family group code', about: 'About RAKSHA',
    },
  },

  hi: {
    appName: 'रक्षा',
    tagline: 'आपदा प्रतिक्रिया ग्रिड',

    nav: {
      map: 'मानचित्र', sos: 'एसओएस', shelters: 'आश्रय स्थल', report: 'रिपोर्ट करें', broadcasts: 'चेतावनियाँ',
      family: 'परिवार', firstAid: 'प्राथमिक चिकित्सा', assistant: 'सहायक', admin: 'व्यवस्थापक', settings: 'सेटिंग्स',
    },

    alert: {
      green: 'सामान्य', yellow: 'निगरानी', orange: 'तैयार रहें', red: 'कार्रवाई करें',
      activeCount: 'सक्रिय घटनाएँ',
    },

    common: {
      loading: 'लोड हो रहा है…', retry: 'पुनः प्रयास करें', cancel: 'रद्द करें', save: 'सहेजें', close: 'बंद करें',
      confirm: 'पुष्टि करें', submit: 'सबमिट करें', away: 'दूर', viewOnMap: 'मानचित्र पर देखें',
      getDirections: 'दिशा-निर्देश प्राप्त करें', call: 'कॉल करें', share: 'साझा करें',
      offlineBanner: 'आप ऑफ़लाइन हैं — अंतिम डाउनलोड किया गया डेटा दिखाया जा रहा है। नई रिपोर्ट कतारबद्ध होंगी और ऑनलाइन होते ही अपने आप भेज दी जाएँगी।',
      onlineAgain: 'फिर से ऑनलाइन — समन्वयित हो रहा है…', noResults: 'अभी यहाँ दिखाने के लिए कुछ नहीं है।',
      error: 'कुछ गड़बड़ हो गई', tryAgain: 'फिर से प्रयास करें',
    },

    sos: {
      title: 'आपातकालीन एसओएस', holdToConfirm: 'एसओएस भेजने के लिए दबाए रखें',
      holdInstructions: 'प्रतिक्रियादाताओं को अपना लाइव स्थान भेजने के लिए 2 सेकंड तक दबाकर रखें।',
      typeLabel: 'यह किस प्रकार की आपात स्थिति है?',
      types: { medical: 'चिकित्सा', fire: 'आग', flood: 'बाढ़', trapped: 'फंसे हुए', violence: 'हिंसा', accident: 'दुर्घटना', other: 'अन्य' },
      locating: 'आपका सटीक स्थान प्राप्त किया जा रहा है…',
      sent: 'एसओएस भेजा गया — यह स्थान अब प्रतिक्रियादाताओं को दिखाई दे रहा है',
      nearestHelp: 'यहाँ से निकटतम सहायता', notifyContacts: 'अपने आपातकालीन संपर्कों को सूचित करें',
      notifyHint: 'आपके लाइव स्थान के साथ पहले से भरा हुआ व्हाट्सएप/एसएमएस खोलता है — आपके टैप किए बिना कुछ भी अपने आप नहीं भेजा जाता।',
      noContacts: 'एक-टैप अलर्ट सक्षम करने के लिए सेटिंग्स में आपातकालीन संपर्क जोड़ें।',
      locationDenied: 'एसओएस के लिए स्थान की अनुमति आवश्यक है। इसे अपनी ब्राउज़र/डिवाइस सेटिंग्स में सक्षम करें और फिर से प्रयास करें।',
      cancel: 'रद्द करने के लिए छोड़ें',
    },

    map: {
      title: 'लाइव आपदा मानचित्र', layers: 'परतें', hazards: 'खतरे', facilities: 'सुविधाएं',
      planRoute: 'सुरक्षित मार्ग बनाएं', origin: 'प्रारंभिक स्थान', destination: 'गंतव्य', useMyLocation: 'मेरा स्थान उपयोग करें',
      findRoute: 'सबसे सुरक्षित मार्ग खोजें', routeVia: 'मार्ग स्रोत', sourceOsrm: 'लाइव सड़क नेटवर्क',
      sourceGrid: 'ऑफ़लाइन अनुमानित मार्ग (सड़क नेटवर्क अनुपलब्ध)', hazardsAvoided: 'खतरा क्षेत्र माने गए',
      distance: 'दूरी', duration: 'अनुमानित समय', clearRoute: 'मार्ग हटाएं',
      severity: 'गंभीरता', reportedAgo: 'रिपोर्ट किया गया', tapForDetails: 'विवरण के लिए मार्कर पर टैप करें',
    },

    shelters: {
      title: 'आश्रय स्थल और सुविधाएं', all: 'सभी', shelter: 'आश्रय स्थल', hospital: 'अस्पताल',
      relief_camp: 'राहत शिविर', police: 'पुलिस', fire_station: 'दमकल केंद्र', resource_point: 'संसाधन केंद्र',
      capacity: 'क्षमता', occupancy: 'वर्तमान संख्या', status: { open: 'खुला', full: 'भरा हुआ', closed: 'बंद' },
      sortedByDistance: 'आपसे दूरी के अनुसार क्रमबद्ध', enableLocation: 'दूरी के अनुसार क्रमबद्ध करने के लिए स्थान सक्षम करें',
    },

    report: {
      title: 'घटना की रिपोर्ट करें', type: 'घटना का प्रकार', description: 'विवरण (वैकल्पिक)',
      descriptionPlaceholder: 'आप क्या देख रहे हैं? पानी का स्तर, आग का आकार, कितनी लेन बंद हैं…',
      severity: 'गंभीरता', severityHint: '1 = मामूली, 5 = गंभीर/जानलेवा', addPhoto: 'फ़ोटो जोड़ें',
      removePhoto: 'फ़ोटो हटाएं', location: 'स्थान', useMyLocation: 'मेरा वर्तमान स्थान उपयोग करें', pickOnMap: 'या मानचित्र पर टैप करके स्थान चुनें',
      submit: 'रिपोर्ट सबमिट करें', queuedOffline: 'आप ऑफ़लाइन हैं — यह रिपोर्ट सहेज ली गई है और ऑनलाइन होते ही अपने आप भेज दी जाएगी।',
      submitted: 'रिपोर्ट सबमिट की गई — धन्यवाद, इससे पूरे समुदाय को मदद मिलती है।',
      needLocation: 'कृपया इस रिपोर्ट के लिए एक स्थान सेट करें।',
      confirmReport: 'पुष्टि करें', disputeReport: 'विवाद करें', confirmations: 'पुष्टियाँ', disputes: 'विवाद',
      confidence: 'विश्वसनीयता', status: { unverified: 'असत्यापित', verified: 'सत्यापित', disputed: 'विवादित', resolved: 'सुलझाया गया' },
      types: {
        flood: 'बाढ़', fire: 'आग', accident: 'दुर्घटना', roadblock: 'सड़क अवरोध', landslide: 'भूस्खलन',
        storm: 'तूफान', earthquake: 'भूकंप', building_collapse: 'इमारत ढहना',
        power_outage: 'बिजली गुल', chemical_leak: 'रासायनिक रिसाव', other: 'अन्य',
      },
    },

    broadcasts: {
      title: 'आधिकारिक चेतावनियाँ', newBroadcast: 'नई चेतावनी भेजें', category: 'श्रेणी', priority: 'प्राथमिकता स्तर',
      titleLabel: 'शीर्षक', message: 'संदेश', send: 'चेतावनी भेजें', sent: 'सभी उपयोगकर्ताओं को चेतावनी भेजी गई',
      categories: {
        evacuation: 'निकासी', road_closure: 'सड़क बंद', weather: 'मौसम', shelter_update: 'आश्रय अपडेट',
        safety_instruction: 'सुरक्षा निर्देश', general: 'सामान्य',
      },
    },

    family: {
      title: 'पारिवारिक सुरक्षा', groupCode: 'पारिवारिक समूह कोड', groupCodeHint: 'यह कोड परिवार के साथ साझा करें — जो भी इसे दर्ज करेगा वह समूह की स्थिति देख और अपडेट कर सकता है।',
      createGroup: 'नया समूह बनाएं', joinGroup: 'कोड से शामिल हों', yourName: 'आपका नाम',
      iAmSafe: 'मैं सुरक्षित हूँ', iNeedHelp: 'मुझे मदद चाहिए', unknown: 'अज्ञात', checkIn: 'चेक इन करें',
      lastUpdated: 'अंतिम अपडेट', noMembers: 'अभी तक कोई भी इस समूह में चेक इन नहीं हुआ है। शुरू करने के लिए कोड साझा करें।',
      shareCode: 'समूह कोड साझा करें',
    },

    firstAid: {
      title: 'प्राथमिक चिकित्सा गाइड', readAloud: 'ज़ोर से पढ़ें', stopReading: 'रोकें', disclaimer:
        'केवल सामान्य मार्गदर्शन — यह पेशेवर देखभाल या प्रमाणित प्राथमिक चिकित्सा प्रशिक्षण का विकल्प नहीं है। किसी भी जानलेवा आपात स्थिति में 112 पर कॉल करें।',
      topics: {
        bleeding: 'रक्तस्राव', burns: 'जलना', drowning: 'डूबना', fractures: 'हड्डी टूटना',
        smoke_inhalation: 'धुआं अंदर जाना', dehydration: 'निर्जलीकरण और गर्मी', panic: 'घबराहट और तीव्र तनाव',
      },
    },

    assistant: {
      title: 'एआई खतरा सहायक', placeholder: 'किसी खतरे, सुरक्षित मार्ग, या अभी क्या करें — इसके बारे में पूछें…',
      ask: 'पूछें', thinking: 'सोच रहा है…', sourceAi: 'एआई-जनित', sourceRuleBased: 'नियम-आधारित (ऑफ़लाइन-सुरक्षित) मार्गदर्शन',
      suggestionsLabel: 'यह पूछ कर देखें:',
      suggestions: ['मेरे पास बाढ़ के बारे में मुझे क्या करना चाहिए?', 'निकटतम खुला आश्रय स्थल कहाँ है?', 'क्या अभी बायकुला से होकर यात्रा करना सुरक्षित है?'],
    },

    admin: {
      title: 'प्रतिक्रियादाता डैशबोर्ड', login: 'व्यवस्थापक लॉगिन', passcode: 'पासकोड', loginButton: 'लॉगिन करें',
      loginError: 'गलत पासकोड', logout: 'लॉगआउट', priorityQueue: 'प्राथमिकता कतार',
      activeIncidents: 'सक्रिय घटनाएं', activeSos: 'सक्रिय एसओएस', avgShelterOccupancy: 'औसत आश्रय भराव',
      verifiedShare: 'सत्यापित रिपोर्ट', markResolved: 'सुलझा हुआ चिह्नित करें', updateStatus: 'स्थिति अपडेट करें',
      manageFacilities: 'सुविधाएं प्रबंधित करें', updateOccupancy: 'वर्तमान संख्या अपडेट करें',
    },

    settings: {
      title: 'सेटिंग्स', language: 'भाषा', yourName: 'आपका नाम', yourNamePlaceholder: 'वैकल्पिक — आपकी रिपोर्ट पर दिखाया जाएगा',
      emergencyContacts: 'आपातकालीन संपर्क', addContact: 'संपर्क जोड़ें', contactName: 'नाम', contactPhone: 'फोन नंबर',
      familyGroupCode: 'डिफ़ॉल्ट पारिवारिक समूह कोड', about: 'रक्षा के बारे में',
    },
  },
};

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
];

/** Dot-path lookup, e.g. t('en', 'sos.holdToConfirm'). Falls back to English, then the key itself. */
export function translate(lang, path) {
  const dict = translations[lang] || translations.en;
  const fallback = translations.en;
  const parts = path.split('.');

  const walk = (obj) => parts.reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);

  return walk(dict) ?? walk(fallback) ?? path;
}
