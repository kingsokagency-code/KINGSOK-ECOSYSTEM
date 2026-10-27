import fs from 'fs';
import { parseCsvRaw } from '../src/lib/contacts/csvParser';
import { extractCleanStudentFirstName } from '../src/lib/contacts/unnFilter';

const unnKeywords = [
  /\b0'?2[789]\b/i, /\b0'?3[012]\b/i, /\bns\b/i, /\bnew\s*students?\b/i, /\bfreshers?\b/i,
  /\bcust\b/i, /\bprop\b/i, /\blodge\b/i, /\btour(\s*1?\.?0?)?\b/i, /\bvalor\b/i, /\brep\b/i,
  /\bagen[cg]y\b/i, /\bunn\b/i, /\bunec\b/i, /\bcampus\b/i, /\bhall\b/i,
  /\belectrical\b/i, /\belectronic\b/i, /\belect\b/i, /\bmech(anical)?\b/i, /\bcivil\b/i,
  /\bmetallurgy\b/i, /\bmetullurgy\b/i, /\bagric(ulture)?\b/i, /\bagronomy\b/i,
  /\bmedsurg\b/i, /\bmed\s*surg\b/i, /\bmedicine\b/i, /\bmed\b/i, /\bsurgery\b/i, /\bnursing\b/i,
  /\bnurs\b/i, /\bpharmacy\b/i, /\bpharm\b/i, /\banatomy\b/i, /\bphysiology\b/i, /\bdentistry\b/i,
  /\bmed(ical)?\s*lab\b/i, /\bmls\b/i, /\bslt\b/i, /\bradiography\b/i, /\blaw\b/i,
  /\bcomp(uter)?\s*sci\b/i, /\bsoftware\b/i, /\bcyber\b/i, /\bgeology\b/i, /\bphysics\b/i,
  /\bchemistry\b/i, /\bmaths?\b/i, /\bzoology\b/i, /\bbotany\b/i, /\bbiochem\b/i,
  /\bmicrobio(logy)?\b/i, /\bstatistics\b/i, /\becon(omics)?\b/i, /\bpol(itical)?(\s*sci)?\b/i,
  /\bmass\s*comm\b/i, /\bpub(lic)?\s*admin\b/i, /\bsociology\b/i, /\bpsychology\b/i, /\bphilosophy\b/i,
  /\bacct\b/i, /\baccount(ing|ancy)?\b/i, /\bbanking\b/i, /\bfinance\b/i, /\bmarketing\b/i,
  /\bmanagement\b/i, /\btheatre\b/i, /\bmusic\b/i, /\blinguistics\b/i, /\bigbo\b/i, /\bfrench\b/i,
  /\benglish\b/i, /\bhistory\b/i, /\barchitecture\b/i, /\bestate\b/i, /\bsurveying\b/i, /\burban\b/i,
  /\bedu(cation)?\b/i
];

/**
 * Intelligent First Name Cleaner for Nigerian Student Contacts
 * Strips out:
 * - Tags: PROP, CuSt, Lodge, Rep, Valor, Agency, Agent, Tour, 029, 0'29, Fresher, NS, New Student
 * - Department names: Electrical, MedSurg, Civil, Mech, Nursing, Pharmacy, Law, SLT, MLS, etc.
 * - Special symbols/emojis: • ~ ✨ 🤍 £ ♠️ 😘 🥰 💖
 */
export function cleanStudentFirstName(rawName: string): string {
  // 1. Remove emojis and decorative unicode symbols
  let clean = rawName
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
    .replace(/[•~✨🤍£♠️😘🥰💖+_\-*#@!?()\[\]{}:;\\\/|<>="`]/g, ' ')
    .trim();

  // 2. Tokenize words
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length === 0) return 'there';

  // Words that are purely department / tag / cohort tokens to discard
  const noiseTokens = new Set([
    'prop', 'cust', 'lodge', 'rep', 'valor', 'agency', 'agent', 'tour', 'tour1.0',
    '029', "0'29", '030', "0'30", '028', "0'28", 'fresher', 'freshers', 'ns', 'new', 'student', 'students',
    'nns', 'unn', 'unec', 'work', 'book', 'dos', 'dog', 'claude',
    // Departments
    'electrical', 'electronic', 'elect', 'civil', 'mech', 'mechanical', 'metallurgy', 'metullurgy',
    'agric', 'agriculture', 'agronomy', 'medsurg', 'med', 'surg', 'medicine', 'surgery',
    'nursing', 'nurs', 'pharmacy', 'pharm', 'anatomy', 'physiology', 'dentistry',
    'mls', 'slt', 'radiography', 'rehab', 'law', 'computer', 'science', 'sci', 'software',
    'geology', 'physics', 'chemistry', 'math', 'maths', 'zoology', 'botany', 'biochem',
    'microbio', 'statistics', 'economics', 'econ', 'political', 'pol', 'mass', 'comm',
    'public', 'administration', 'admin', 'pub', 'sociology', 'psychology', 'philosophy',
    'acct', 'accounting', 'accountancy', 'banking', 'finance', 'marketing', 'management',
    'theatre', 'music', 'linguistics', 'igbo', 'french', 'english', 'history', 'architecture',
    'estate', 'surveying', 'urban', 'education', 'edu', 'foreign', 'lang', 'cbs', 'mcb',
    'human', 'engineering', 'eng', 'lab', 'rehab', 'tourism'
  ]);

  // Find the first word that is an actual human name (not in noiseTokens, length >= 2, only letters)
  for (const w of words) {
    const lower = w.toLowerCase().replace(/[^a-z]/g, '');
    if (lower.length >= 2 && !noiseTokens.has(lower)) {
      // Capitalize properly
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    }
  }

  // Fallback to first word if none found
  return words[0] || 'there';
}

const samples = [
  "Ada Geology Fresher",
  "•Somtoo Chukwu• Music 0'29",
  "Rep Agric 0'29 ~~PRAIS£",
  "✨ Amarachi ✨ Human Anatomy",
  "🤍 Faith Prop",
  "£Fidelis£ Lodge ",
  "Adimchi Mech ",
  "Afoma Pharmacy",
  "Martin Med Rehab  Agala",
  "Agu Chibueze Elect Fresher",
  "Agubata Civil DOG",
  "Akalugo Chijioke Electronics",
  "Akunne Andrea Valor +",
  "Akunne David Public Administration Fresher",
  "Prop Amara ECHELU",
  "Amara♠️ Book Civil",
  "amarachi blessing SLT Fresher",
  "Amarachi Civil Engineering",
  "Ambivert Med Surg 0'29",
  "Gift 0'29 Med Lab 😘😘🥰💖💖 Ami",
  "Ani Mmesoma Elect Fresher",
  "Nursing 0'29 Ann David",
  "Anthony CBS Fresher",
  "Anthony Electrical",
  "Anthony Med Surg NNS",
  "Rep Aries",
  "MLS ARINZE MMESOMA DANIELLA",
  "Lab 0'29 Armstrong Med"
];

console.log('=== TESTING SMART FIRST NAME EXTRACTION ===\n');
for (const s of samples) {
  console.log(`[Raw Name]: "${s}"\n  -> [Greeting]: "Hello ${cleanStudentFirstName(s)}!"\n`);
}
