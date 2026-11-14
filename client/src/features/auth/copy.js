/**
 * Sign-in wording in Punjabi and English. The chosen language is shown
 * large; English is shown underneath as a helper unless English was chosen.
 */
export const LANGUAGE_OPTIONS = [
  { id: 'pa', native: 'ਪੰਜਾਬੀ', english: 'Punjabi', speech: 'pa-IN' },
  { id: 'en', native: 'English', english: 'English', speech: 'en-IN' },
]

export const COPY = {
  language: { pa: 'ਭਾਸ਼ਾ ਚੁਣੋ', en: 'Choose language' },
  phone: { pa: 'ਤੁਹਾਡਾ ਮੋਬਾਈਲ ਨੰਬਰ', en: 'Your mobile number' },
  phoneHelp: {
    pa: 'ਕੋਈ ਪਾਸਵਰਡ ਨਹੀਂ। ਅਸੀਂ SMS ਰਾਹੀਂ 6 ਅੰਕਾਂ ਦਾ ਕੋਡ ਭੇਜਾਂਗੇ।',
    en: 'No password. We send a 6-digit code by SMS.',
  },
  otp: { pa: 'ਕੋਡ ਲਿਖੋ', en: 'Enter the code' },
  profile: { pa: 'ਤੁਸੀਂ ਕੌਣ ਹੋ?', en: 'Who are you?' },
  name: { pa: 'ਤੁਹਾਡਾ ਨਾਂ', en: 'Your name' },
  continue: { pa: 'ਅੱਗੇ', en: 'Continue' },
  sendCode: { pa: 'ਕੋਡ ਭੇਜੋ', en: 'Send code' },
  verify: { pa: 'ਪੱਕਾ ਕਰੋ', en: 'Verify' },
  start: { pa: 'ਸ਼ੁਰੂ ਕਰੋ', en: 'Get started' },
  listen: { pa: 'ਸੁਣੋ', en: 'Listen' },
}

export const ROLE_OPTIONS = [
  {
    id: 'farmer',
    label: { pa: 'ਕਿਸਾਨ', en: 'Farmer' },
    hint: 'I want to sell straw',
    image: '/images/farmer-paddy.webp',
  },
  {
    id: 'buyer',
    label: { pa: 'ਖਰੀਦਦਾਰ', en: 'Buyer' },
    hint: 'I buy straw for my plant',
    image: '/images/harvest-edge.webp',
  },
  {
    id: 'baler',
    label: { pa: 'ਬੇਲਰ ਮਾਲਕ', en: 'Baler owner' },
    hint: 'I own a baler',
    image: '/images/baler-field.webp',
  },
]

export function speechLang(language) {
  return LANGUAGE_OPTIONS.find((l) => l.id === language)?.speech ?? 'pa-IN'
}
