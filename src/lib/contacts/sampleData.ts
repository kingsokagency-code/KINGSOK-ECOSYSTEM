/**
 * KINGSOK Sample Contact Dataset Generator
 * Generates realistic Nigerian contact data (up to 5,000+ contacts) for testing and instant demoing.
 */

const FIRST_NAMES = [
  'Chinedu', 'Ngozi', 'Emeka', 'Chioma', 'Ifeanyi', 'Blessing', 'Somtochukwu', 'Uchenna',
  'Kelechi', 'Amarachi', 'Obinna', 'Chiamaka', 'Tochukwu', 'Chidera', 'Onyinyechi', 'Chukwudi',
  'Babatunde', 'Olumide', 'Adebayo', 'Folake', 'Temitope', 'Damilola', 'Ayomide', 'Titilope',
  'Amina', 'Ibrahim', 'Fatima', 'Mustapha', 'Zainab', 'Abubakar', 'Halima', 'Usman',
  'Osas', 'Efe', 'Eromosele', 'Idara', 'Aniekeme', 'Bassey', 'Itoro', 'Edidiong',
];

const LAST_NAMES = [
  'Okonkwo', 'Eze', 'Nwosu', 'Okeke', 'Chukwu', 'Umeh', 'Obi', 'Nwachukwu',
  'Adeleke', 'Ogunleye', 'Balogun', 'Olawale', 'Adeyemi', 'Bakare', 'Ojo', 'Fashola',
  'Bello', 'Danladi', 'Shehu', 'Garba', 'Yusuf', 'Aliyu', 'Gambo', 'Suleiman',
  'Igwe', 'Onuorah', 'Mbah', 'Okafor', 'Anene', 'Nnamani', 'Agu', 'Ani',
  'Etim', 'Akpan', 'Edet', 'Effiong', 'Udoh', 'Asuquo', 'Essien', 'Henshaw',
];

const NETWORK_PREFIXES = [
  '0803', '0806', '0813', '0816', '0810', '0814', '0903', '0906', '0913', '0916', // MTN
  '0802', '0808', '0812', '0701', '0708', '0901', '0902', '0904', '0907', '0912', // Airtel
  '0805', '0807', '0811', '0815', '0705', '0905', '0915',                         // Glo
  '0809', '0817', '0818', '0908', '0909',                                         // 9mobile
];

const LODGES_NOTES = [
  'UNN Hilltop Lodge inquiry',
  'Ofulonu self-contain seeker',
  'Odim gate room vacancy',
  'Green House 2-bedroom flat',
  'Behind Flat single room',
  'Total axis student hostel',
  'UNN Post-UTME screening candidate',
  'Clearance guidelines requested',
  'Direct entry transition student',
  'Final year graduating student',
];

/**
 * Deterministic pseudo-random number generator for reproducible test batches
 */
function pseudoRandom(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * Generate a realistic CSV string representing an Android / Google Contacts export.
 */
export function generateRealisticContactCsv(count = 5000): string {
  const rand = pseudoRandom(12345);
  const rows: string[] = [];

  // Google Contacts standard export headers
  rows.push('Name,Given Name,Family Name,Phone 1 - Type,Phone 1 - Value,Notes,Consent Status');

  const basePhones: string[] = [];

  for (let i = 0; i < count; i++) {
    const fn = FIRST_NAMES[Math.floor(rand() * FIRST_NAMES.length)];
    const ln = LAST_NAMES[Math.floor(rand() * LAST_NAMES.length)];
    const fullName = `${fn} ${ln}`;
    const note = LODGES_NOTES[Math.floor(rand() * LODGES_NOTES.length)];

    let rawPhone = '';
    let consent = 'unknown';

    // ~3% invalid/malformed records
    if (i % 35 === 0) {
      const invalidTypes = [
        '0803123',                     // Too short
        '12345',                       // Malformed
        'Unknown Phone',               // Alphabetic
        '05012345678',                 // Invalid Nigerian mobile prefix
        '+234 (0) 803 12',             // Incomplete
        '2.34803E+05',                 // Corrupted short float
      ];
      rawPhone = invalidTypes[Math.floor(rand() * invalidTypes.length)];
    }
    // ~5% duplicates (reuse earlier phone number but possibly with different formatting or casing)
    else if (i > 50 && i % 20 === 0 && basePhones.length > 0) {
      const prevPhone = basePhones[Math.floor(rand() * Math.min(basePhones.length, 100))];
      // Format variation of the same number
      if (prevPhone.startsWith('0')) {
        rawPhone = `+234 ${prevPhone.slice(1, 4)} ${prevPhone.slice(4, 7)} ${prevPhone.slice(7)}`;
      } else {
        rawPhone = prevPhone;
      }
    }
    // Standard valid Nigerian numbers with diverse realistic representations
    else {
      const prefix = NETWORK_PREFIXES[Math.floor(rand() * NETWORK_PREFIXES.length)];
      const suffix = String(Math.floor(rand() * 10000000)).padStart(7, '0');
      const standard11 = prefix + suffix;
      basePhones.push(standard11);

      const formatStyle = Math.floor(rand() * 6);
      switch (formatStyle) {
        case 0:
          rawPhone = standard11; // 08031234567
          break;
        case 1:
          rawPhone = `+234 ${standard11.slice(1, 4)} ${standard11.slice(4, 7)} ${standard11.slice(7)}`; // +234 803 123 4567
          break;
        case 2:
          rawPhone = `+234${standard11.slice(1)}`; // +2348031234567
          break;
        case 3:
          rawPhone = `234${standard11.slice(1)}`; // 2348031234567
          break;
        case 4:
          rawPhone = `+234 (0) ${standard11.slice(1, 4)}-${standard11.slice(4, 7)}-${standard11.slice(7)}`; // +234 (0) 803-123-4567
          break;
        case 5:
        default:
          rawPhone = `${standard11.slice(0, 4)} ${standard11.slice(4, 7)} ${standard11.slice(7)}`; // 0803 123 4567
          break;
      }
    }

    // Consent distribution: ~80% unknown (raw contacts), ~15% opted in, ~5% opted out
    const consentDice = rand();
    if (consentDice > 0.95) {
      consent = 'opted_out';
    } else if (consentDice > 0.80) {
      consent = 'opted_in';
    } else {
      consent = 'unknown';
    }

    // Escape fields
    const safeName = `"${fullName.replace(/"/g, '""')}"`;
    const safeFn = `"${fn.replace(/"/g, '""')}"`;
    const safeLn = `"${ln.replace(/"/g, '""')}"`;
    const safePhone = `"${rawPhone.replace(/"/g, '""')}"`;
    const safeNote = `"${note.replace(/"/g, '""')}"`;

    rows.push(`${safeName},${safeFn},${safeLn},Mobile,${safePhone},${safeNote},${consent}`);
  }

  return rows.join('\r\n');
}
