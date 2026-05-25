const KHMER_SCRIPT = /[\u1780-\u17FF\u19E0-\u19FF]/;

const EXACT_TRANSLATIONS: Record<string, string> = {
  "request timed out - please try again": "សំណើអស់ពេលកំណត់ - សូមព្យាយាមម្តងទៀត",
  "សំណើអស់ពេលកំណត់ - សូមព្យាយាមម្តងទៀត": "សំណើអស់ពេលកំណត់ - សូមព្យាយាមម្តងទៀត",
  "invalid login credentials": "ព័ត៌មានចូលគណនីមិនត្រឹមត្រូវ។ សូមពិនិត្យអ៊ីមែល និងពាក្យសម្ងាត់។",
  "email not confirmed": "អ៊ីមែលមិនទាន់បានបញ្ជាក់។ សូមពិនិត្យប្រអប់សាររបស់អ្នក។",
  "user already registered": "អ៊ីមែលនេះមានគណនីរួចហើយ។ សូមចូលគណនីឬប្រើអ៊ីមែលផ្សេង។",
  "signup requires a valid password": "ពាក្យសម្ងាត់មិនត្រឹមត្រូវ។ សូមប្រើពាក្យសម្ងាត់ដែលមានយ៉ាងហោចណាស់ ៨ តួអក្សរ។",
  "password should be at least 6 characters": "ពាក្យសម្ងាត់ត្រូវមានយ៉ាងហោចណាស់ ៦ តួអក្សរ។",
  "too many requests": "សំណើច្រើនពេក។ សូមរង់ចាំបន្តិចហើយព្យាយាមម្តងទៀត។",
  "network error": "បញ្ហាបណ្តាញ។ សូមពិនិត្យការតភ្ជាប់អ៊ីនធឺណិត។",
  "failed to fetch": "មិនអាចភ្ជាប់ទៅម៉ាស៊ីនមេបានទេ។ សូមពិនិត្យការតភ្ជាប់របស់អ្នក។",
  "not found": "មិនរកឃើញទិន្នន័យដែលស្នើ។",
  "unauthorized": "អ្នកមិនមានសិទ្ធិចូលប្រើទេ។",
  "forbidden": "អ្នកមិនមានសិទ្ធិធ្វើសកម្មភាពនេះទេ។",
  "internal server error": "មានកំហុសនៅលើម៉ាស៊ីនមេ។ សូមព្យាយាមម្តងទៀតនៅពេលក្រោយ។",
};

const PATTERN_TRANSLATIONS: Array<{ test: RegExp; translate: (match: RegExpMatchArray) => string }> = [
  {
    test: /^http\s+(\d+)$/i,
    translate: (m) => `មានកំហុស (${m[1]})។ សូមព្យាយាមម្តងទៀត។`,
  },
  {
    test: /^failed to load/i,
    translate: () => "ផ្ទុកទិន្នន័យមិនជោគជ័យ។",
  },
  {
    test: /^failed to fetch/i,
    translate: () => "ផ្ទុកទិន្នន័យមិនជោគជ័យ។",
  },
  {
    test: /invalid file type/i,
    translate: () => "ប្រភេទឯកសារមិនត្រឹមត្រូវ។",
  },
  {
    test: /must be less than/i,
    translate: () => "ទំហំឯកសារធំពេកពេក។ សូមជ្រើសរើសឯកសារតូចជាង។",
  },
];

const GENERIC_ERROR = "មានកំហុសមិនបានរំពឹងទុក។ សូមព្យាយាមម្តងទៀត។";

function normalizeKey(message: string): string {
  return message.trim().replace(/\s+/g, " ");
}

function isMostlyLatin(text: string): boolean {
  const latin = (text.match(/[A-Za-z]/g) ?? []).length;
  const khmer = (text.match(KHMER_SCRIPT) ?? []).length;
  return latin > khmer * 2;
}

/**
 * Converts English API/runtime messages to Khmer for toast display.
 * Already-Khmer strings are returned unchanged.
 */
export function translateToastMessage(message: string): string {
  const trimmed = normalizeKey(message);
  if (!trimmed) return GENERIC_ERROR;
  if (KHMER_SCRIPT.test(trimmed) && !isMostlyLatin(trimmed)) {
    return trimmed;
  }

  const exact = EXACT_TRANSLATIONS[trimmed.toLowerCase()];
  if (exact) return exact;

  for (const { test, translate } of PATTERN_TRANSLATIONS) {
    const match = trimmed.match(test);
    if (match) return translate(match);
  }

  if (isMostlyLatin(trimmed)) {
    return GENERIC_ERROR;
  }

  return trimmed;
}
