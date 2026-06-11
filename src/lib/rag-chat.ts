import { SCHEMES } from "./schemes-data";
import { loadSession } from "./session";
import type { LangCode, PersonaId, SchemeRecord } from "./types";

/** Normalize code-mixed input: aadhaar, hindi transliterations */
export function normalizeQuery(text: string): string {
  return text
    .toLowerCase()
    .replace(/aadhaar|aadhar|आधार|ஆதார்/gi, "aadhaar")
    .replace(/kisan|किसान/gi, "kisan")
    .replace(/खो गया|காணவில்லை|lost/gi, "lost")
    .replace(/farmer|किसान|விவசாயி/gi, "farmer")
    .replace(/document|दस्तावेज|ஆவணம்|कागदपत्र/gi, "document")
    .replace(/eligib|पात्र|தகுதி|योग्य/gi, "eligibility")
    .replace(/scheme|योजना|திட்டம்|योजन/gi, "scheme")
    .replace(/benefit|लाभ|நன்மை/gi, "benefit")
    .replace(/apply|आवेदन|விண்ணப்ப/gi, "apply")
    .trim();
}

const GREETING_RE =
  /^(hi|hello|hey|hola|namaste|नमस्ते|नमस्कार|வணக்கம்|হ্যালো|నమస్తే|good\s*(morning|afternoon|evening|night)|how\s*are\s*you|kaise\s*ho|kya\s*haal|sup|yo)[\s!.,?]*$/i;

const THANKS_RE = /^(thanks|thank\s*you|धन्यवाद|शुक्रिया|நன்றி|ধন্যবাদ|ధన్యవాదాలు)[\s!.,?]*$/i;

const HELP_RE = /help|what\s*can\s*you\s*do|how\s*do\s*(i|you)\s*use|guide\s*me|मदद|सहायता|உதவி/i;

const WHO_RE = /who\s*are\s*you|what\s*is\s*sahay|तुम\s*कौन|आप\s*कौन|நீங்கள்\s*யார்/i;

const MY_SCHEMES_RE =
  /my\s*scheme|what\s*do\s*i\s*qualify|matched|results|मेरी\s*योजना|मुझे\s*कौन|என்\s*திட்டம்|qualif/i;

const LIST_SCHEMES_RE = /list\s*scheme|all\s*scheme|how\s*many\s*scheme|कौन\s*सी\s*योजना|योजनाएं|திட்டங்கள்/i;

const PERSONA_LABELS: Record<PersonaId, Record<LangCode, string>> = {
  farmer: { en: "farmer", hi: "किसान", ta: "விவசாயி", mr: "शेतकरी", bn: "কৃষক", te: "రైతు" },
  woman: { en: "woman head of household", hi: "महिला परिवार प्रमुख", ta: "பெண் குடும்பத் தலைவர்", mr: "महिला कुटुंब प्रमुख", bn: "নারী পরিবার প্রধান", te: "మహిళా కుటుంబ అధిపతి" },
  gig: { en: "gig/platform worker", hi: "गिग/प्लेटफॉर्म श्रमिक", ta: "கிக் தொழிலாளி", mr: "गिग कामगार", bn: "গিগ শ্রমিক", te: "గిగ్ కార్మికుడు" },
  wage: { en: "daily wage worker", hi: "दिहाड़ी मजदूर", ta: "தினக்கூலி தொழிலாளி", mr: "दैनिक मजूर", bn: "দৈনিক মজুর", te: "రోజువారీ కార్మికుడు" },
  student: { en: "student", hi: "छात्र", ta: "மாணவர்", mr: "विद्यार्थी", bn: "ছাত্র", te: "విద్యార్థి" },
  senior: { en: "senior citizen", hi: "वरिष्ठ नागरिक", ta: "மூத்த குடிமகன்", mr: "ज्येष्ठ नागरिक", bn: "প্রবীণ নাগরিক", te: "వృద్ధులు" },
  business: { en: "small business owner", hi: "छोटे व्यवसायी", ta: "சிறு வணிகர்", mr: "लघु व्यवसायी", bn: "ক্ষুদ্র ব্যবসায়ী", te: "చిన్న వ్యాపారి" },
};

function findSchemeByQuery(query: string): SchemeRecord | undefined {
  const q = query.toLowerCase();
  return SCHEMES.find(
    (s) =>
      q.includes(s.id.replace(/-/g, " ")) ||
      q.includes(s.id) ||
      q.includes(s.name.toLowerCase()) ||
      s.keywords.some((k) => k.length > 2 && q.includes(k.toLowerCase())),
  );
}

function scoreScheme(query: string, persona: PersonaId | null): { id: string; score: number; name: string; source: string }[] {
  const direct = findSchemeByQuery(query);
  if (direct) {
    return [{ id: direct.id, score: 10, name: direct.name, source: direct.source }];
  }

  const tokens = query.split(/\s+/).filter((t) => t.length > 2);
  return SCHEMES.map((s) => {
    let score = 0;
    const hay = `${s.name} ${s.id} ${s.keywords.join(" ")} ${s.desc.en}`.toLowerCase();
    for (const t of tokens) {
      if (hay.includes(t)) score += 2;
    }
    if (persona && s.personas.includes(persona)) score += 3;
    return { id: s.id, score, name: s.name, source: s.source };
  })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

function personaSchemes(persona: PersonaId, lang: LangCode): SchemeRecord[] {
  return SCHEMES.filter((s) => s.personas.includes(persona)).slice(0, 4);
}

function greetingReply(lang: LangCode, persona: PersonaId | null, matchedIds: string[]): { text: string; citations: string[] } {
  const personaLabel = persona ? PERSONA_LABELS[persona][lang] : null;

  if (matchedIds.length > 0) {
    const names = matchedIds
      .slice(0, 3)
      .map((id) => SCHEMES.find((s) => s.id === id)?.name ?? id)
      .join(", ");
    const texts: Record<LangCode, string> = {
      en: `Hello! Welcome back. Based on your last check, you may qualify for ${names}. Ask me about documents, benefits, or how to apply — or say "check eligibility" for a fresh check.`,
      hi: `नमस्ते! आपका स्वागत है। आपकी पिछली जांच के अनुसार आप ${names} के पात्र हो सकते हैं। दस्तावेज़, लाभ या आवेदन के बारे में पूछें — या "पात्रता जांचें" कहें।`,
      ta: `வணக்கம்! மீண்டும் வரவேற்கிறோம். உங்கள் கடைசி சரிபார்ப்பின்படி ${names} தகுதியாக இருக்கலாம். ஆவணங்கள், நன்மைகள் அல்லது விண்ணப்பம் கேளுங்கள்.`,
      mr: `नमस्कार! परत स्वागत आहे. तुमच्या मागील तपासणीनुसार ${names} साठी पात्र असू शकता. कागदपत्रे, लाभ किंवा अर्ज विचारा.`,
      bn: `নমস্কার! আবার স্বাগতম। আপনার শেষ যাচাই অনুযায়ী ${names}-এর জন্য যোগ্য হতে পারেন। নথি, সুবিধা বা আবেদন জিজ্ঞাসা করুন।`,
      te: `నమస్తే! తిరిగి స్వాగతం. మీ చివరి తనిఖీ ప్రకారం ${names} కోసం అర్హులు కావచ్చు. పత్రాలు, ప్రయోజనాలు లేదా దరఖాస్తు గురించి అడగండి.`,
    };
    return { text: texts[lang], citations: ["https://www.myscheme.gov.in"] };
  }

  if (personaLabel) {
    const top = personaSchemes(persona!, lang);
    const names = top.map((s) => s.name).join(", ");
    const texts: Record<LangCode, string> = {
      en: `Hello! I see you're a ${personaLabel}. I can help you find schemes like ${names}. Try "check my eligibility" or ask about any scheme by name.`,
      hi: `नमस्ते! आप एक ${personaLabel} हैं। मैं ${names} जैसी योजनाएं ढूंढने में मदद कर सकता हूँ। "पात्रता जांचें" कहें या किसी योजना का नाम पूछें।`,
      ta: `வணக்கம்! நீங்கள் ${personaLabel}. ${names} போன்ற திட்டங்களைக் கண்டுபிடிக்க உதவுகிறேன். "தகுதி சரிபார்ப்பு" என்று சொல்லுங்கள்.`,
      mr: `नमस्कार! तुम्ही ${personaLabel} आहात. ${names} सारख्या योजना शोधण्यात मदत करतो. "पात्रता तपासा" म्हणा.`,
      bn: `নমস্কার! আপনি একজন ${personaLabel}। ${names} এর মতো প্রকল্প খুঁজতে সাহায্য করি। "যোগ্যতা যাচাই" বলুন।`,
      te: `నమస్తే! మీరు ${personaLabel}. ${names} వంటి పథకాలు కనుగొనడంలో సహాయం చేస్తాను. "అర్హత తనిఖీ" అని చెప్పండి.`,
    };
    return { text: texts[lang], citations: top.map((s) => s.source) };
  }

  const texts: Record<LangCode, string> = {
    en: "Hello! I'm Sahay, your welfare scheme assistant. I can check eligibility, list schemes, explain documents, and guide you to apply — all in your language. What would you like help with today?",
    hi: "नमस्ते! मैं सहाय हूँ, आपका कल्याण योजना सहायक। पात्रता जांच, योजनाएं, दस्तावेज़ और आवेदन में मदद कर सकता हूँ। आज किस बारे में जानना चाहेंगे?",
    ta: "வணக்கம்! நான் Sahay, உங்கள் நலத்திட்ட உதவியாளர். தகுதி சரிபார்ப்பு, திட்டங்கள், ஆவணங்கள் மற்றும் விண்ணப்பத்தில் உதவுகிறேன். இன்று எதில் உதவி வேண்டும்?",
    mr: "नमस्कार! मी सहाय आहे. पात्रता, योजना, कागदपत्रे आणि अर्ज यात मदत करतो. आज कशात मदत हवी?",
    bn: "নমস্কার! আমি সহায়, আপনার কল্যাণ প্রকল্প সহায়ক। যোগ্যতা, প্রকল্প, নথি ও আবেদনে সাহায্য করি। আজ কী জানতে চান?",
    te: "నమస్తే! నేను సహాయ్, మీ సంక్షేమ పథక సహాయకుడిని. అర్హత, పథకాలు, పత్రాలు మరియు దరఖాస్తులో సహాయం చేస్తాను. ఈరోజు ఏమి తెలుసుకోవాలి?",
  };
  return { text: texts[lang], citations: [] };
}

function helpReply(lang: LangCode): { text: string; citations: string[] } {
  const texts: Record<LangCode, string> = {
    en: "Here's what I can do:\n• Check eligibility (say \"check my eligibility\")\n• Find schemes for your profile (farmer, gig worker, etc.)\n• List documents needed for any scheme\n• Explain benefits and how to apply\n• Share your matched schemes from past checks\n\nTry: \"Documents for PM-KISAN\" or \"Schemes for gig workers\"",
    hi: "मैं ये कर सकता हूँ:\n• पात्रता जांच (\"पात्रता जांचें\" कहें)\n• आपकी प्रोफ़ाइल के लिए योजनाएं\n• किसी योजना के दस्तावेज़\n• लाभ और आवेदन की जानकारी\n\nकोशिश करें: \"PM-KISAN दस्तावेज़\" या \"गिग वर्कर योजनाएं\"",
    ta: "நான் செய்யக்கூடியவை:\n• தகுதி சரிபார்ப்பு\n• உங்கள் சுயவிவரத்திற்கான திட்டங்கள்\n• ஆவண பட்டியல்\n• நன்மைகள் மற்றும் விண்ணப்பம்\n\nமுயற்சி: \"PM-KISAN ஆவணங்கள்\"",
    mr: "मी हे करू शकतो:\n• पात्रता तपासणी\n• तुमच्या प्रोफाइलसाठी योजना\n• कागदपत्र यादी\n• लाभ आणि अर्ज माहिती",
    bn: "আমি পারি:\n• যোগ্যতা যাচাই\n• আপনার প্রোফাইলের প্রকল্প\n• নথির তালিকা\n• সুবিধা ও আবেদন তথ্য",
    te: "నేను చేయగలను:\n• అర్హత తనిఖీ\n• మీ ప్రొఫైల్ పథకాలు\n• పత్రాల జాబితా\n• ప్రయోజనాలు మరియు దరఖాస్తు",
  };
  return { text: texts[lang], citations: ["https://www.myscheme.gov.in"] };
}

function schemeDetailReply(scheme: SchemeRecord, lang: LangCode, focus?: "document" | "benefit" | "apply" | "default"): { text: string; citations: string[] } {
  const desc = scheme.desc[lang] ?? scheme.desc.en;

  if (focus === "document") {
    const docs = scheme.documents[lang] ?? scheme.documents.en;
    const texts: Record<LangCode, string> = {
      en: `For **${scheme.name}** you'll need:\n${docs.map((d, i) => `${i + 1}. ${d}`).join("\n")}\n\nOpen the scheme page to download a printable checklist or send via SMS.`,
      hi: `**${scheme.name}** के लिए चाहिए:\n${docs.map((d, i) => `${i + 1}. ${d}`).join("\n")}\n\nचेकलिस्ट डाउनलोड या SMS के लिए योजना पेज खोलें।`,
      ta: `**${scheme.name}** க்கு தேவை:\n${docs.map((d, i) => `${i + 1}. ${d}`).join("\n")}`,
      mr: `**${scheme.name}** साठी:\n${docs.map((d, i) => `${i + 1}. ${d}`).join("\n")}`,
      bn: `**${scheme.name}** এর জন্য:\n${docs.map((d, i) => `${i + 1}. ${d}`).join("\n")}`,
      te: `**${scheme.name}** కోసం:\n${docs.map((d, i) => `${i + 1}. ${d}`).join("\n")}`,
    };
    return { text: texts[lang].replace(/\*\*/g, ""), citations: [scheme.source] };
  }

  if (focus === "benefit") {
    const benefits = scheme.benefits[lang] ?? scheme.benefits.en;
    const texts: Record<LangCode, string> = {
      en: `**${scheme.name}** benefits:\n${benefits.map((b) => `• ${b}`).join("\n")}\n\n${desc}`,
      hi: `**${scheme.name}** लाभ:\n${benefits.map((b) => `• ${b}`).join("\n")}\n\n${desc}`,
      ta: `**${scheme.name}** நன்மைகள்:\n${benefits.map((b) => `• ${b}`).join("\n")}`,
      mr: `**${scheme.name}** लाभ:\n${benefits.map((b) => `• ${b}`).join("\n")}`,
      bn: `**${scheme.name}** সুবিধা:\n${benefits.map((b) => `• ${b}`).join("\n")}`,
      te: `**${scheme.name}** ప్రయోజనాలు:\n${benefits.map((b) => `• ${b}`).join("\n")}`,
    };
    return { text: texts[lang].replace(/\*\*/g, ""), citations: [scheme.source] };
  }

  if (focus === "apply") {
    const steps = scheme.apply[lang] ?? scheme.apply.en;
    const texts: Record<LangCode, string> = {
      en: `How to apply for **${scheme.name}**:\n${steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}\n\nOfficial source: MyScheme.gov.in`,
      hi: `**${scheme.name}** के लिए आवेदन:\n${steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}`,
      ta: `**${scheme.name}** விண்ணப்பம்:\n${steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}`,
      mr: `**${scheme.name}** अर्ज:\n${steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}`,
      bn: `**${scheme.name}** আবেদন:\n${steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}`,
      te: `**${scheme.name}** దరఖాస్తు:\n${steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}`,
    };
    return { text: texts[lang].replace(/\*\*/g, ""), citations: [scheme.source] };
  }

  const texts: Record<LangCode, string> = {
    en: `${scheme.name}: ${desc}\n\nAsk me about documents, benefits, or how to apply for this scheme.`,
    hi: `${scheme.name}: ${desc}\n\nदस्तावेज़, लाभ या आवेदन के बारे में पूछें।`,
    ta: `${scheme.name}: ${desc}\n\nஆவணங்கள், நன்மைகள் அல்லது விண்ணப்பம் கேளுங்கள்.`,
    mr: `${scheme.name}: ${desc}\n\nकागदपत्रे, लाभ किंवा अर्ज विचारा.`,
    bn: `${scheme.name}: ${desc}\n\nনথি, সুবিধা বা আবেদন জিজ্ঞাসা করুন।`,
    te: `${scheme.name}: ${desc}\n\nపత్రాలు, ప్రయోజనాలు లేదా దరఖాస్తు అడగండి.`,
  };
  return { text: texts[lang], citations: [scheme.source] };
}

type ChatState = {
  step: "idle" | "ask_land" | "ask_income" | "ask_aadhaar" | "done";
  land?: string;
  income?: string;
  aadhaar?: string;
};

const chatStates = new Map<string, ChatState>();

export function getChatState(sessionId: string): ChatState {
  return chatStates.get(sessionId) ?? { step: "idle" };
}

export function setChatState(sessionId: string, state: ChatState): void {
  chatStates.set(sessionId, state);
}

export function generateRagReply(
  input: string,
  lang: LangCode,
  sessionId = "default",
): { text: string; citations: string[]; suggestEligibility?: boolean } {
  const session = loadSession();
  const persona = session.persona;
  const raw = input.trim();
  const q = normalizeQuery(raw);
  const state = getChatState(sessionId);

  // Greetings & small talk
  if (GREETING_RE.test(raw) || GREETING_RE.test(q)) {
    return greetingReply(lang, persona, session.matchedSchemeIds);
  }

  if (THANKS_RE.test(raw)) {
    const texts: Record<LangCode, string> = {
      en: "You're welcome! If you need anything else — schemes, documents, or eligibility — just ask.",
      hi: "आपका स्वागत है! योजना, दस्तावेज़ या पात्रता — कुछ भी पूछें।",
      ta: "வரவேற்கிறோம்! திட்டங்கள், ஆவணங்கள் அல்லது தகுதி — எதையும் கேளுங்கள்.",
      mr: "स्वागत आहे! योजना, कागदपत्रे किंवा पात्रता — विचारा.",
      bn: "স্বাগতম! প্রকল্প, নথি বা যোগ্যতা — যেকোনো কিছু জিজ্ঞাসা করুন।",
      te: "స్వాగతం! పథకాలు, పత్రాలు లేదా అర్హత — ఏదైనా అడగండి.",
    };
    return { text: texts[lang], citations: [] };
  }

  if (WHO_RE.test(raw) || WHO_RE.test(q)) {
    const texts: Record<LangCode, string> = {
      en: "I'm Sahay — a multilingual assistant that helps Indians discover welfare schemes they qualify for. I use verified data from MyScheme.gov.in and never make up scheme details.",
      hi: "मैं सहाय हूँ — भारतीयों को कल्याण योजनाएं खोजने में मदद करता हूँ। मेरे जवाब MyScheme.gov.in के सत्यापित डेटा पर आधारित हैं।",
      ta: "நான் Sahay — இந்தியர்கள் தகுதியான நலத்திட்டங்களைக் கண்டுபிடிக்க உதவுகிறேன். MyScheme.gov.in சரிபார்க்கப்பட்ட தரவைப் பயன்படுத்துகிறேன்.",
      mr: "मी सहाय आहे — नागरिकांना कल्याणकारी योजना शोधण्यात मदत करतो. MyScheme.gov.in वर आधारित माहिती.",
      bn: "আমি সহায় — ভারতীয়দের কল্যাণ প্রকল্প খুঁজতে সাহায্য করি। MyScheme.gov.in-এর যাচাইকৃত তথ্য ব্যবহার করি।",
      te: "నేను సహాయ్ — భారతీయులకు సంక్షేమ పథకాలు కనుగొనడంలో సహాయం చేస్తాను. MyScheme.gov.in ధృవీకరించిన డేటా ఉపయోగిస్తాను.",
    };
    return { text: texts[lang], citations: ["https://www.myscheme.gov.in"] };
  }

  if (HELP_RE.test(raw) || HELP_RE.test(q)) {
    return helpReply(lang);
  }

  if (MY_SCHEMES_RE.test(raw) || MY_SCHEMES_RE.test(q)) {
    if (session.matchedSchemeIds.length === 0) {
      const texts: Record<LangCode, string> = {
        en: "You haven't completed an eligibility check yet. Say \"check my eligibility\" or visit /eligibility — it takes about 60 seconds.",
        hi: "आपने अभी पात्रता जांच पूरी नहीं की। \"पात्रता जांचें\" कहें या /eligibility पर जाएं — लगभग 60 सेकंड।",
        ta: "நீங்கள் இன்னும் தகுதி சரிபார்ப்பு முடிக்கவில்லை. \"தகுதி சரிபார்ப்பு\" என்று சொல்லுங்கள்.",
        mr: "अद्याप पात्रता तपासणी पूर्ण केली नाही. \"पात्रता तपासा\" म्हणा.",
        bn: "এখনও যোগ্যতা যাচাই হয়নি। \"যোগ্যতা যাচাই\" বলুন।",
        te: "ఇంకా అర్హత తనిఖీ పూర్తి కాలేదు. \"అర్హత తనిఖీ\" అని చెప్పండి.",
      };
      return { text: texts[lang], citations: [], suggestEligibility: true };
    }
    const lines = session.matchedSchemeIds.map((id) => {
      const s = SCHEMES.find((sc) => sc.id === id);
      return s ? `• ${s.name}: ${s.desc[lang] ?? s.desc.en}` : `• ${id}`;
    });
    const texts: Record<LangCode, string> = {
      en: `Based on your eligibility check, you may qualify for:\n${lines.join("\n")}\n\nOpen /schemes for full details and document checklists.`,
      hi: `आपकी पात्रता जांच के अनुसार:\n${lines.join("\n")}\n\nपूरी जानकारी के लिए /schemes खोलें।`,
      ta: `உங்கள் தகுதி சரிபார்ப்பின்படி:\n${lines.join("\n")}`,
      mr: `तुमच्या पात्रता तपासणीनुसार:\n${lines.join("\n")}`,
      bn: `আপনার যোগ্যতা যাচাই অনুযায়ী:\n${lines.join("\n")}`,
      te: `మీ అర్హత తనిఖీ ప్రకారం:\n${lines.join("\n")}`,
    };
    return {
      text: texts[lang],
      citations: session.matchedSchemeIds.map((id) => SCHEMES.find((s) => s.id === id)?.source ?? "").filter(Boolean),
    };
  }

  if (LIST_SCHEMES_RE.test(raw) || LIST_SCHEMES_RE.test(q)) {
    const list = SCHEMES.map((s) => `• ${s.name} — ${s.tag[lang] ?? s.tag.en}`).join("\n");
    const texts: Record<LangCode, string> = {
      en: `I know ${SCHEMES.length} central schemes:\n${list}\n\nAsk about any by name, e.g. "Tell me about Ayushman Bharat".`,
      hi: `मुझे ${SCHEMES.length} केंद्रीय योजनाएं पता हैं:\n${list}\n\nनाम से पूछें, जैसे "अयुष्मान भारत बताएं"।`,
      ta: `${SCHEMES.length} மத்திய திட்டங்கள்:\n${list}`,
      mr: `${SCHEMES.length} केंद्रीय योजना:\n${list}`,
      bn: `${SCHEMES.length}টি কেন্দ্রীয় প্রকল্প:\n${list}`,
      te: `${SCHEMES.length} కేంద్ర పథకాలు:\n${list}`,
    };
    return { text: texts[lang], citations: ["https://www.myscheme.gov.in"] };
  }

  // Compressed eligibility flow inside chat
  if (q.includes("eligibility") || q.includes("check") || q.includes("qualify")) {
    if (state.step === "idle") {
      setChatState(sessionId, { step: "ask_land" });
      const prompts: Record<LangCode, string> = {
        en: "I'll check in 4 quick questions. Do you own agricultural land? (Yes / No)",
        hi: "मैं 4 छोटे सवालों में जांचूंगा। क्या आपके पास कृषि भूमि है? (हाँ / नहीं)",
        ta: "4 கேள்விகளில் சரிபார்க்கிறேன். விவசாய நிலம் உள்ளதா? (ஆம் / இல்லை)",
        mr: "4 प्रश्नांत तपासेन. शेतजमीन आहे का? (होय / नाही)",
        bn: "৪টি প্রশ্নে যাচাই করব। কৃষি জমি আছে? (হ্যাঁ / না)",
        te: "4 ప్రశ్నల్లో తనిఖీ చేస్తాను. వ్యవసాయ భూమి ఉందా? (అవును / లేదు)",
      };
      return { text: prompts[lang], citations: [] };
    }
  }

  if (state.step === "ask_land") {
    const land = /yes|हाँ|ஆம்|होय|হ্যাঁ|అవును/i.test(q) ? "yes" : "no";
    setChatState(sessionId, { step: "ask_income", land });
    const prompts: Record<LangCode, string> = {
      en: "Thanks. What is your annual family income? (Below ₹1L / ₹1L–₹3L / Above ₹3L)",
      hi: "धन्यवाद। वार्षिक पारिवारिक आय? (₹1L से कम / ₹1L–₹3L / ₹3L से अधिक)",
      ta: "நன்றி. வருடாந்திர குடும்ப வருமானம்? (₹1L க்கு கீழ் / ₹1L–₹3L / ₹3L க்கு மேல்)",
      mr: "धन्यवाद. वार्षिक उत्पन्न? (₹1L पेक्षा कमी / ₹1L–₹3L / ₹3L पेक्षा जास्त)",
      bn: "ধন্যবাদ। বার্ষিক আয়? (₹1L এর নিচে / ₹1L–₹3L / ₹3L এর উপরে)",
      te: "ధన్యవాదాలు. వార్షిక ఆదాయం? (₹1L కంటే తక్కువ / ₹1L–₹3L / ₹3L కంటే ఎక్కువ)",
    };
    return { text: prompts[lang], citations: [] };
  }

  if (state.step === "ask_income") {
    setChatState(sessionId, { ...state, step: "ask_aadhaar", income: q });
    const prompts: Record<LangCode, string> = {
      en: "Do you have an Aadhaar-linked bank account? (Yes / No)",
      hi: "क्या आधार से जुड़ा बैंक खाता है? (हाँ / नहीं)",
      ta: "ஆதார் இணைக்கப்பட்ட வங்கி கணக்கு உள்ளதா? (ஆம் / இல்லை)",
      mr: "आधार जोडलेले बँक खाते आहे का? (होय / नाही)",
      bn: "আধার সংযুক্ত ব্যাংক অ্যাকাউন্ট আছে? (হ্যাঁ / না)",
      te: "ఆధార్ లింక్ బ్యాంక్ ఖాతా ఉందా? (అవును / లేదు)",
    };
    return { text: prompts[lang], citations: [] };
  }

  if (state.step === "ask_aadhaar") {
    setChatState(sessionId, { ...state, step: "done" });
    const texts: Record<LangCode, string> = {
      en: "Done! For full matched results, visit /eligibility or /schemes. I only answer using MyScheme.gov.in grounded data.",
      hi: "पूर्ण! पूर्ण परिणाम के लिए /eligibility या /schemes पर जाएं।",
      ta: "முடிந்தது! முழு முடிவுகளுக்கு /schemes செல்லுங்கள்.",
      mr: "पूर्ण! संपूर्ण निकालासाठी /schemes भेट द्या.",
      bn: "সম্পন্ন! সম্পূর্ণ ফলাফলের জন্য /schemes খুলুন।",
      te: "పూర్తయింది! పూర్తి ఫలితాల కోసం /schemes కు వెళ్లండి.",
    };
    return { text: texts[lang], citations: ["https://www.myscheme.gov.in"], suggestEligibility: true };
  }

  // Direct scheme lookup by name
  const directScheme = findSchemeByQuery(q) ?? findSchemeByQuery(raw);
  if (directScheme) {
    const focus = q.includes("document")
      ? "document"
      : q.includes("benefit")
        ? "benefit"
        : q.includes("apply")
          ? "apply"
          : "default";
    return schemeDetailReply(directScheme, lang, focus);
  }

  // Persona-based recommendations
  if (persona && (q.includes("scheme") || q.includes("farmer") || q.includes("gig") || q.includes("worker") || q.includes("recommend"))) {
    const top = personaSchemes(persona, lang);
    const label = PERSONA_LABELS[persona][lang];
    const lines = top.map((s) => `• ${s.name}: ${s.desc[lang] ?? s.desc.en}`).join("\n");
    const texts: Record<LangCode, string> = {
      en: `As a ${label}, these schemes fit your profile best:\n${lines}\n\nWant details on any? Just name the scheme.`,
      hi: `${label} के रूप में ये योजनाएं सबसे उपयुक्त हैं:\n${lines}`,
      ta: `${label} ஆக இந்த திட்டங்கள் சிறந்தது:\n${lines}`,
      mr: `${label} म्हणून या योजना योग्य आहेत:\n${lines}`,
      bn: `${label} হিসেবে এই প্রকল্পগুলো উপযুক্ত:\n${lines}`,
      te: `${label} గా ఈ పథకాలు అత్యుత్తమం:\n${lines}`,
    };
    return { text: texts[lang], citations: top.map((s) => s.source) };
  }

  const hits = scoreScheme(q, persona);

  if (q.includes("document") && hits.length > 0) {
    const scheme = SCHEMES.find((s) => s.id === hits[0].id)!;
    return schemeDetailReply(scheme, lang, "document");
  }

  if (hits.length > 0) {
    const scheme = SCHEMES.find((s) => s.id === hits[0].id)!;
    return schemeDetailReply(scheme, lang, "default");
  }

  // Contextual fallback — still helpful
  const personaHint = persona ? PERSONA_LABELS[persona][lang] : null;
  const texts: Record<LangCode, string> = {
    en: personaHint
      ? `I'm not sure about that specific question, but as a ${personaHint} you can ask about PM-KISAN, Ayushman Bharat, e-Shram, and more. Try "help" to see what I can do, or "check my eligibility".`
      : "I'm not sure about that. Try asking about a scheme by name (e.g. PM-KISAN), say \"help\" for options, or \"check my eligibility\" to get personalized matches.",
    hi: personaHint
      ? `इस सवाल पर निश्चित नहीं हूँ, लेकिन ${personaHint} के रूप में PM-KISAN, अयुष्मान भारत, e-Shram के बारे में पूछ सकते हैं। "मदद" या "पात्रता जांचें" कहें।`
      : "समझ नहीं आया। योजना का नाम पूछें, \"मदद\" कहें, या \"पात्रता जांचें\"।",
    ta: personaHint
      ? `அந்த கேள்விக்கு உறுதியாக தெரியவில்லை. ${personaHint} ஆக PM-KISAN, Ayushman பற்றி கேளுங்கள்.`
      : "புரியவில்லை. திட்டப் பெயரைக் கேளுங்கள் அல்லது \"உதவி\" என்று சொல்லுங்கள்.",
    mr: "समजले नाही. योजनेचे नाव विचारा किंवा \"मदत\" म्हणा.",
    bn: "বুঝতে পারিনি। প্রকল্পের নাম জিজ্ঞাসা করুন বা \"সাহায্য\" বলুন।",
    te: "అర్థం కాలేదు. పథకం పేరు అడగండి లేదా \"సహాయం\" అని చెప్పండి.",
  };
  return { text: texts[lang], citations: [] };
}
