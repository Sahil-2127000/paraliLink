/**
 * Landing page copy in English and Punjabi. Statistics come from the
 * ParaliLink Hacknauts 2.0 deck (slides 2 and 4). Do not add figures that are
 * not sourced. Keep both languages in step when editing.
 */

const ROLE_IMAGES = {
  farmer: { image: '/images/farmer-paddy.webp', imageAlt: 'A farmer on a tractor working a flooded paddy field' },
  buyer: { image: '/images/harvest-edge.webp', imageAlt: 'A green paddy field beside a golden harvested field' },
  baler: { image: '/images/baler-field.webp', imageAlt: 'A tractor baling straw on a harvested field' },
}

export const CONTENT = {
  en: {
    nav: { process: 'Process', system: 'The system', who: 'Who it’s for', faq: 'FAQ' },
    ui: { signIn: 'Sign in', getStarted: 'Get started', openApp: 'Open my app', menu: 'Menu', close: 'Close', skip: 'Skip to content' },
    cta: { sell: 'List my straw', buy: 'Buy in bulk' },
    hero: {
      title: ['Sell the straw.', 'Don’t burn it.'],
      tagline: 'ਪਰਾਲੀ ਸਾੜੋ ਨਹੀਂ, ਵੇਚੋ।', // the other language, as a small line
      taglineLang: 'pa',
      body: 'ParaliLink groups nearby small farms into one pickup, sells the straw to boilers, pellet and biogas plants, and books the baler. The farmer is paid by UPI when the straw leaves the field.',
    },
    ticker: [
      { value: '180–200 lakh t', label: 'paddy straw a year' },
      { value: '31.72 lakh ha', label: 'under paddy, 2025' },
      { value: '5,085', label: 'farm fires in 2025' },
      { value: '41 lakh t', label: 'straw for boilers by 2025' },
      { value: '37', label: 'pellet plants, 34 more coming' },
    ],
    statement: {
      before: 'Between paddy harvest and wheat sowing, a farmer gets only a few weeks.',
      after: 'The straw is bulky, buyers won’t come for a small farm, and a matchstick is cheaper than a baler.',
      accent: 'So the fields burn.',
    },
    figures: [
      { value: 31.72, decimals: 2, unit: 'lakh ha', label: 'under paddy in Punjab (2025)' },
      { value: 41, unit: 'lakh t', label: 'straw used by industrial boilers (2025, projected), up from 8.8' },
      { value: 37, unit: 'plants', label: 'pellet plants in Punjab, with 34 more being set up' },
      { value: 5085, unit: 'fires', label: 'farm fires still reported in 2025' },
    ],
    process: {
      title: ['How the straw ', 'moves'],
      intro: 'One flow connects the farmer, the buyer and the baler. Nobody chases anybody, and every step leaves a record.',
      steps: [
        { who: 'Farmer', title: 'List the straw', body: 'Drop a pin on the field, enter acres and harvest date. In Punjabi, in under a minute.' },
        { who: 'System', title: 'Cluster nearby farms', body: 'Farms close together that harvest the same week become one pickup.' },
        { who: 'Buyer', title: 'Order in bulk', body: 'Boilers and pellet plants pick a cluster on the live map and pay.' },
        { who: 'Baler', title: 'Pick up on route', body: 'The nearest free baler and truck follow the cluster route.' },
        { who: 'Farmer', title: 'Verified, then paid', body: 'An OTP confirms pickup and weight. UPI pays the farmer.' },
      ],
    },
    system: {
      title: ['One trip,', 'many farms.'],
      intro: 'Farms within a few kilometres that harvest in the same week are grouped into a single pickup cluster. That is what makes a small farm worth a baler’s trip.',
      features: [
        { mark: 'A.', title: 'Smart farm clustering', body: 'Groups farms by distance and harvest date so every pickup pays off.' },
        { mark: 'B.', title: 'Harvest calendar', body: 'Buyers see straw supply weeks before it is cut and plan purchases.' },
        { mark: 'C.', title: 'Carbon impact count', body: 'A live tally of straw saved and CO₂ avoided, for everyone to see.' },
        { mark: 'D.', title: 'Punjabi-first screens', body: 'Big buttons, read-aloud, minimal typing. Village agents can list for farmers.' },
      ],
      map: {
        caption: 'Real map of Bhawanigarh, Sangrur. Farm positions are examples.',
        farm: 'Farm',
        cluster: 'Pickup cluster',
        replay: 'Replay ↺',
        loading: 'Loading map…',
        offline: 'Map unavailable offline',
        clusterLabel: (i, farms) => `Cluster ${'ABC'[i]} · ${farms} farms`,
      },
    },
    roles: {
      title: ['Three people. ', 'One field.'],
      list: [
        {
          id: 'farmer',
          number: '(i)',
          title: 'Farmers',
          corner: 'ਕਿਸਾਨ',
          pitch: 'Earn from straw instead of paying to clear the field.',
          points: ['Simple Punjabi screens', 'Pickup booked before harvest', 'UPI payment after OTP check'],
          cta: 'List my straw',
        },
        {
          id: 'buyer',
          number: '(ii)',
          title: 'Industries',
          corner: 'ਖਰੀਦਦਾਰ',
          pitch: 'Steady, traceable biomass for boilers, pellet, biogas and paper mills.',
          points: ['Live map of ready clusters', 'Supply calendar weeks ahead', 'One delivered price per tonne'],
          cta: 'See supply',
        },
        {
          id: 'baler',
          number: '(iii)',
          title: 'Baler owners',
          corner: 'ਬੇਲਰ ਮਾਲਕ',
          pitch: 'Get booked automatically, paid for every km and every tonne.',
          points: ['Jobs near your base', 'See your pay before you accept', 'Fuel advance on every job'],
          cta: 'Find jobs',
        },
      ],
    },
    faq: {
      title: ['Questions,', 'answered.'],
      intro: 'The short version of how selling straw on ParaliLink works.',
      items: [
        {
          q: 'What does ParaliLink do?',
          a: 'It connects farmers who have baled paddy straw with industries that burn or process it: boilers, pellet, biogas and paper plants. Nearby farms are grouped so one truck trip is worth it.',
        },
        {
          q: 'Who bales my straw?',
          a: 'You arrange it. Call a baler you already know, or book a registered baler near your field in the app. You agree the day and pay the baler directly.',
        },
        {
          q: 'How much will I get?',
          a: 'One fixed price per tonne of baled straw, the same across Punjab. The app shows it, with an estimate for your field, before you list.',
        },
        {
          q: 'When do I get paid?',
          a: 'An advance of 25% of the estimate when an industry books your straw. The rest, on the weighed tonnes, within 7 days of pickup.',
        },
        {
          q: 'How is my straw weighed?',
          a: 'The industry sends its own truck. At your field their staff weigh the bales, check the 6-digit code from your app, and give you a slip.',
        },
        {
          q: 'Is there a fee?',
          a: 'No. ParaliLink charges nothing during the pilot.',
        },
        {
          q: 'I don’t use a smartphone much. Can I still sell?',
          a: 'Yes. The app works in Punjabi, reads screens aloud and needs very little typing. A village agent can also list your straw for you.',
        },
      ],
    },
    closing: {
      title: ['Book the baler', ['before', ' the clock'], 'starts.'],
      tagline: 'ਵਾਢੀ ਤੋਂ ਪਹਿਲਾਂ ਬੁਕਿੰਗ ਕਰੋ।',
      taglineLang: 'pa',
      body: 'Pre-booking opens before harvest, so your pickup is lined up the week your field is cut.',
    },
    footer: {
      about: 'A paddy straw marketplace for Punjab. Built by Team Kalam, Guru Nanak Dev Engineering College, Ludhiana.',
      tagline: 'ਪਰਾਲੀ ਸਾੜੋ ਨਹੀਂ, ਵੇਚੋ।',
      taglineLang: 'pa',
      explore: 'Explore',
      join: 'Join',
      joinLinks: ['Farmers', 'Industries', 'Baler owners'],
    },
    notFound: { title: ['Field ', 'not found.'], body: 'This page doesn’t exist or has moved.', back: 'Back to home' },
  },

  pa: {
    nav: { process: 'ਕਿਵੇਂ ਕੰਮ ਕਰਦਾ ਹੈ', system: 'ਸਿਸਟਮ', who: 'ਕਿਸ ਲਈ', faq: 'ਸਵਾਲ-ਜਵਾਬ' },
    ui: { signIn: 'ਸਾਈਨ ਇਨ', getStarted: 'ਸ਼ੁਰੂ ਕਰੋ', openApp: 'ਮੇਰੀ ਐਪ ਖੋਲ੍ਹੋ', menu: 'ਮੀਨੂ', close: 'ਬੰਦ ਕਰੋ', skip: 'ਮੁੱਖ ਹਿੱਸੇ ’ਤੇ ਜਾਓ' },
    cta: { sell: 'ਮੇਰੀ ਪਰਾਲੀ ਵੇਚੋ', buy: 'ਥੋਕ ਵਿੱਚ ਖਰੀਦੋ' },
    hero: {
      title: ['ਪਰਾਲੀ ਵੇਚੋ।', 'ਸਾੜੋ ਨਹੀਂ।'],
      tagline: null,
      body: 'ਪਰਾਲੀਲਿੰਕ ਨੇੜਲੇ ਛੋਟੇ ਖੇਤਾਂ ਨੂੰ ਇੱਕ ਪਿਕਅੱਪ ਵਿੱਚ ਜੋੜਦਾ ਹੈ, ਪਰਾਲੀ ਬੋਇਲਰਾਂ, ਪੈਲੇਟ ਅਤੇ ਬਾਇਓਗੈਸ ਪਲਾਂਟਾਂ ਨੂੰ ਵੇਚਦਾ ਹੈ, ਅਤੇ ਬੇਲਰ ਬੁੱਕ ਕਰਦਾ ਹੈ। ਪਰਾਲੀ ਖੇਤ ਤੋਂ ਚੁੱਕੀ ਜਾਂਦੇ ਹੀ ਕਿਸਾਨ ਨੂੰ UPI ਰਾਹੀਂ ਪੈਸੇ ਮਿਲਦੇ ਹਨ।',
    },
    ticker: [
      { value: '180–200 ਲੱਖ ਟਨ', label: 'ਹਰ ਸਾਲ ਝੋਨੇ ਦੀ ਪਰਾਲੀ' },
      { value: '31.72 ਲੱਖ ਹੈਕਟੇਅਰ', label: 'ਝੋਨੇ ਹੇਠ ਰਕਬਾ, 2025' },
      { value: '5,085', label: 'ਖੇਤਾਂ ਵਿੱਚ ਅੱਗਾਂ, 2025' },
      { value: '41 ਲੱਖ ਟਨ', label: '2025 ਤੱਕ ਬੋਇਲਰਾਂ ਲਈ ਪਰਾਲੀ' },
      { value: '37', label: 'ਪੈਲੇਟ ਪਲਾਂਟ, 34 ਹੋਰ ਆ ਰਹੇ' },
    ],
    statement: {
      before: 'ਝੋਨੇ ਦੀ ਵਾਢੀ ਅਤੇ ਕਣਕ ਦੀ ਬਿਜਾਈ ਵਿਚਕਾਰ ਕਿਸਾਨ ਕੋਲ ਸਿਰਫ਼ ਕੁਝ ਹਫ਼ਤੇ ਹੁੰਦੇ ਹਨ।',
      after: 'ਪਰਾਲੀ ਭਾਰੀ ਹੁੰਦੀ ਹੈ, ਛੋਟੇ ਖੇਤ ਲਈ ਖਰੀਦਦਾਰ ਨਹੀਂ ਆਉਂਦੇ, ਅਤੇ ਬੇਲਰ ਨਾਲੋਂ ਤੀਲੀ ਸਸਤੀ ਪੈਂਦੀ ਹੈ।',
      accent: 'ਇਸ ਲਈ ਖੇਤ ਸੜਦੇ ਹਨ।',
    },
    figures: [
      { value: 31.72, decimals: 2, unit: 'ਲੱਖ ਹੈਕਟੇਅਰ', label: 'ਪੰਜਾਬ ਵਿੱਚ ਝੋਨੇ ਹੇਠ ਰਕਬਾ (2025)' },
      { value: 41, unit: 'ਲੱਖ ਟਨ', label: 'ਉਦਯੋਗਿਕ ਬੋਇਲਰਾਂ ਵਿੱਚ ਵਰਤੀ ਪਰਾਲੀ (2025, ਅਨੁਮਾਨ), 8.8 ਤੋਂ ਵੱਧ ਕੇ' },
      { value: 37, unit: 'ਪਲਾਂਟ', label: 'ਪੰਜਾਬ ਵਿੱਚ ਪੈਲੇਟ ਪਲਾਂਟ, 34 ਹੋਰ ਲੱਗ ਰਹੇ ਹਨ' },
      { value: 5085, unit: 'ਅੱਗਾਂ', label: '2025 ਵਿੱਚ ਵੀ ਖੇਤਾਂ ਵਿੱਚ ਅੱਗ ਦੇ ਮਾਮਲੇ' },
    ],
    process: {
      title: ['ਪਰਾਲੀ ਕਿਵੇਂ ', 'ਜਾਂਦੀ ਹੈ'],
      intro: 'ਇੱਕੋ ਪ੍ਰਬੰਧ ਕਿਸਾਨ, ਖਰੀਦਦਾਰ ਅਤੇ ਬੇਲਰ ਨੂੰ ਜੋੜਦਾ ਹੈ। ਕਿਸੇ ਨੂੰ ਕਿਸੇ ਦੇ ਪਿੱਛੇ ਨਹੀਂ ਭੱਜਣਾ ਪੈਂਦਾ, ਅਤੇ ਹਰ ਕਦਮ ਦਾ ਰਿਕਾਰਡ ਰਹਿੰਦਾ ਹੈ।',
      steps: [
        { who: 'ਕਿਸਾਨ', title: 'ਪਰਾਲੀ ਦਰਜ ਕਰੋ', body: 'ਨਕਸ਼ੇ ’ਤੇ ਖੇਤ ਚੁਣੋ, ਏਕੜ ਅਤੇ ਵਾਢੀ ਦੀ ਤਾਰੀਖ ਭਰੋ। ਪੰਜਾਬੀ ਵਿੱਚ, ਇੱਕ ਮਿੰਟ ਤੋਂ ਘੱਟ ਸਮੇਂ ਵਿੱਚ।' },
        { who: 'ਸਿਸਟਮ', title: 'ਨੇੜਲੇ ਖੇਤਾਂ ਦਾ ਸਮੂਹ', body: 'ਨੇੜੇ-ਨੇੜੇ ਦੇ ਖੇਤ, ਜਿਨ੍ਹਾਂ ਦੀ ਵਾਢੀ ਇੱਕੋ ਹਫ਼ਤੇ ਹੁੰਦੀ ਹੈ, ਇੱਕ ਪਿਕਅੱਪ ਬਣ ਜਾਂਦੇ ਹਨ।' },
        { who: 'ਖਰੀਦਦਾਰ', title: 'ਥੋਕ ਵਿੱਚ ਆਰਡਰ', body: 'ਬੋਇਲਰ ਅਤੇ ਪੈਲੇਟ ਪਲਾਂਟ ਲਾਈਵ ਨਕਸ਼ੇ ਤੋਂ ਸਮੂਹ ਚੁਣ ਕੇ ਭੁਗਤਾਨ ਕਰਦੇ ਹਨ।' },
        { who: 'ਬੇਲਰ', title: 'ਰੂਟ ’ਤੇ ਚੁਕਾਈ', body: 'ਸਭ ਤੋਂ ਨੇੜਲਾ ਖਾਲੀ ਬੇਲਰ ਅਤੇ ਟਰੱਕ ਸਮੂਹ ਦੇ ਰੂਟ ’ਤੇ ਚੱਲਦੇ ਹਨ।' },
        { who: 'ਕਿਸਾਨ', title: 'ਪਹਿਲਾਂ ਜਾਂਚ, ਫਿਰ ਪੈਸੇ', body: 'OTP ਨਾਲ ਚੁਕਾਈ ਅਤੇ ਵਜ਼ਨ ਦੀ ਪੁਸ਼ਟੀ ਹੁੰਦੀ ਹੈ। ਕਿਸਾਨ ਨੂੰ UPI ਰਾਹੀਂ ਪੈਸੇ ਮਿਲਦੇ ਹਨ।' },
      ],
    },
    system: {
      title: ['ਇੱਕ ਗੇੜਾ,', 'ਕਈ ਖੇਤ।'],
      intro: 'ਕੁਝ ਕਿਲੋਮੀਟਰ ਦੇ ਅੰਦਰ ਦੇ ਖੇਤ, ਜਿਨ੍ਹਾਂ ਦੀ ਵਾਢੀ ਇੱਕੋ ਹਫ਼ਤੇ ਹੁੰਦੀ ਹੈ, ਇੱਕ ਪਿਕਅੱਪ ਸਮੂਹ ਵਿੱਚ ਜੋੜੇ ਜਾਂਦੇ ਹਨ। ਇਸੇ ਨਾਲ ਛੋਟਾ ਖੇਤ ਵੀ ਬੇਲਰ ਦੇ ਗੇੜੇ ਦੇ ਲਾਇਕ ਬਣਦਾ ਹੈ।',
      features: [
        { mark: 'ੳ.', title: 'ਖੇਤਾਂ ਦੇ ਸਮਝਦਾਰ ਸਮੂਹ', body: 'ਦੂਰੀ ਅਤੇ ਵਾਢੀ ਦੀ ਤਾਰੀਖ ਮੁਤਾਬਕ ਖੇਤ ਜੋੜਦਾ ਹੈ, ਤਾਂ ਜੋ ਹਰ ਪਿਕਅੱਪ ਲਾਹੇਵੰਦ ਹੋਵੇ।' },
        { mark: 'ਅ.', title: 'ਵਾਢੀ ਕੈਲੰਡਰ', body: 'ਖਰੀਦਦਾਰ ਪਰਾਲੀ ਕੱਟਣ ਤੋਂ ਹਫ਼ਤੇ ਪਹਿਲਾਂ ਸਪਲਾਈ ਦੇਖ ਕੇ ਖਰੀਦ ਦੀ ਯੋਜਨਾ ਬਣਾਉਂਦੇ ਹਨ।' },
        { mark: 'ੲ.', title: 'ਕਾਰਬਨ ਅਸਰ ਦਾ ਹਿਸਾਬ', body: 'ਬਚਾਈ ਪਰਾਲੀ ਅਤੇ ਘਟੀ CO₂ ਦਾ ਲਾਈਵ ਹਿਸਾਬ, ਸਭ ਦੇ ਦੇਖਣ ਲਈ।' },
        { mark: 'ਸ.', title: 'ਪੰਜਾਬੀ ਵਿੱਚ ਸਕ੍ਰੀਨਾਂ', body: 'ਵੱਡੇ ਬਟਨ, ਪੜ੍ਹ ਕੇ ਸੁਣਾਉਣ ਦੀ ਸਹੂਲਤ, ਘੱਟ ਟਾਈਪਿੰਗ। ਪਿੰਡ ਦੇ ਏਜੰਟ ਕਿਸਾਨਾਂ ਲਈ ਪਰਾਲੀ ਦਰਜ ਕਰ ਸਕਦੇ ਹਨ।' },
      ],
      map: {
        caption: 'ਭਵਾਨੀਗੜ੍ਹ, ਸੰਗਰੂਰ ਦਾ ਅਸਲ ਨਕਸ਼ਾ। ਖੇਤਾਂ ਦੀਆਂ ਥਾਵਾਂ ਸਿਰਫ਼ ਉਦਾਹਰਨ ਹਨ।',
        farm: 'ਖੇਤ',
        cluster: 'ਪਿਕਅੱਪ ਸਮੂਹ',
        replay: 'ਦੁਬਾਰਾ ਚਲਾਓ ↺',
        loading: 'ਨਕਸ਼ਾ ਖੁੱਲ੍ਹ ਰਿਹਾ ਹੈ…',
        offline: 'ਇੰਟਰਨੈੱਟ ਤੋਂ ਬਿਨਾਂ ਨਕਸ਼ਾ ਨਹੀਂ ਖੁੱਲ੍ਹਦਾ',
        clusterLabel: (i, farms) => `ਸਮੂਹ ${['ੳ', 'ਅ', 'ੲ'][i]} · ${farms} ਖੇਤ`,
      },
    },
    roles: {
      title: ['ਤਿੰਨ ਲੋਕ। ', 'ਇੱਕ ਖੇਤ।'],
      list: [
        {
          id: 'farmer',
          number: '(i)',
          title: 'ਕਿਸਾਨ',
          corner: null,
          pitch: 'ਖੇਤ ਸਾਫ਼ ਕਰਵਾਉਣ ’ਤੇ ਪੈਸੇ ਖਰਚਣ ਦੀ ਬਜਾਏ ਪਰਾਲੀ ਤੋਂ ਕਮਾਓ।',
          points: ['ਆਸਾਨ ਪੰਜਾਬੀ ਸਕ੍ਰੀਨਾਂ', 'ਵਾਢੀ ਤੋਂ ਪਹਿਲਾਂ ਪਿਕਅੱਪ ਬੁੱਕ', 'OTP ਜਾਂਚ ਤੋਂ ਬਾਅਦ UPI ਭੁਗਤਾਨ'],
          cta: 'ਮੇਰੀ ਪਰਾਲੀ ਵੇਚੋ',
        },
        {
          id: 'buyer',
          number: '(ii)',
          title: 'ਉਦਯੋਗ',
          corner: null,
          pitch: 'ਬੋਇਲਰ, ਪੈਲੇਟ, ਬਾਇਓਗੈਸ ਅਤੇ ਪੇਪਰ ਮਿੱਲਾਂ ਲਈ ਲਗਾਤਾਰ ਅਤੇ ਭਰੋਸੇਯੋਗ ਬਾਇਓਮਾਸ।',
          points: ['ਤਿਆਰ ਸਮੂਹਾਂ ਦਾ ਲਾਈਵ ਨਕਸ਼ਾ', 'ਹਫ਼ਤੇ ਪਹਿਲਾਂ ਸਪਲਾਈ ਕੈਲੰਡਰ', 'ਪ੍ਰਤੀ ਟਨ ਇੱਕੋ ਕੀਮਤ, ਪਲਾਂਟ ਤੱਕ ਪਹੁੰਚ ਸਮੇਤ'],
          cta: 'ਸਪਲਾਈ ਦੇਖੋ',
        },
        {
          id: 'baler',
          number: '(iii)',
          title: 'ਬੇਲਰ ਮਾਲਕ',
          corner: null,
          pitch: 'ਆਪਣੇ ਆਪ ਬੁਕਿੰਗ, ਹਰ ਕਿਲੋਮੀਟਰ ਅਤੇ ਹਰ ਟਨ ਦੇ ਪੈਸੇ।',
          points: ['ਤੁਹਾਡੇ ਟਿਕਾਣੇ ਦੇ ਨੇੜੇ ਕੰਮ', 'ਹਾਂ ਕਹਿਣ ਤੋਂ ਪਹਿਲਾਂ ਕਮਾਈ ਦੇਖੋ', 'ਹਰ ਕੰਮ ’ਤੇ ਡੀਜ਼ਲ ਲਈ ਪੇਸ਼ਗੀ'],
          cta: 'ਕੰਮ ਲੱਭੋ',
        },
      ],
    },
    faq: {
      title: ['ਤੁਹਾਡੇ ਸਵਾਲ,', 'ਸਾਡੇ ਜਵਾਬ।'],
      intro: 'ਪਰਾਲੀਲਿੰਕ ’ਤੇ ਪਰਾਲੀ ਵੇਚਣਾ ਕਿਵੇਂ ਕੰਮ ਕਰਦਾ ਹੈ, ਥੋੜ੍ਹੇ ਸ਼ਬਦਾਂ ਵਿੱਚ।',
      items: [
        {
          q: 'ਪਰਾਲੀਲਿੰਕ ਕੀ ਕਰਦਾ ਹੈ?',
          a: 'ਇਹ ਗੱਠਾਂ ਵਾਲੀ ਝੋਨੇ ਦੀ ਪਰਾਲੀ ਵਾਲੇ ਕਿਸਾਨਾਂ ਨੂੰ ਉਨ੍ਹਾਂ ਫ਼ੈਕਟਰੀਆਂ ਨਾਲ ਜੋੜਦਾ ਹੈ ਜੋ ਇਸਨੂੰ ਵਰਤਦੀਆਂ ਹਨ: ਬੋਇਲਰ, ਪੈਲੇਟ, ਬਾਇਓਗੈਸ ਅਤੇ ਪੇਪਰ ਪਲਾਂਟ। ਨੇੜਲੇ ਖੇਤ ਇਕੱਠੇ ਜੋੜੇ ਜਾਂਦੇ ਹਨ ਤਾਂ ਜੋ ਟਰੱਕ ਦਾ ਇੱਕ ਗੇੜਾ ਲਾਹੇਵੰਦ ਹੋਵੇ।',
        },
        {
          q: 'ਮੇਰੀ ਪਰਾਲੀ ਦੀਆਂ ਗੱਠਾਂ ਕੌਣ ਬਣਾਏਗਾ?',
          a: 'ਇਹ ਤੁਸੀਂ ਤੈਅ ਕਰਦੇ ਹੋ। ਆਪਣੇ ਜਾਣੂ ਬੇਲਰ ਨੂੰ ਫ਼ੋਨ ਕਰੋ, ਜਾਂ ਐਪ ਵਿੱਚ ਖੇਤ ਦੇ ਨੇੜੇ ਰਜਿਸਟਰਡ ਬੇਲਰ ਬੁੱਕ ਕਰੋ। ਦਿਨ ਤੈਅ ਕਰੋ ਅਤੇ ਬੇਲਰ ਨੂੰ ਪੈਸੇ ਸਿੱਧੇ ਦਿਓ।',
        },
        {
          q: 'ਮੈਨੂੰ ਕਿੰਨੇ ਪੈਸੇ ਮਿਲਣਗੇ?',
          a: 'ਗੱਠਾਂ ਵਾਲੀ ਪਰਾਲੀ ਦਾ ਪ੍ਰਤੀ ਟਨ ਇੱਕ ਪੱਕਾ ਰੇਟ, ਪੂਰੇ ਪੰਜਾਬ ਵਿੱਚ ਇੱਕੋ। ਪਰਾਲੀ ਪਾਉਣ ਤੋਂ ਪਹਿਲਾਂ ਐਪ ਤੁਹਾਡੇ ਖੇਤ ਦਾ ਅੰਦਾਜ਼ਾ ਦਿਖਾ ਦਿੰਦੀ ਹੈ।',
        },
        {
          q: 'ਪੈਸੇ ਕਦੋਂ ਮਿਲਣਗੇ?',
          a: 'ਜਦੋਂ ਕੋਈ ਫ਼ੈਕਟਰੀ ਤੁਹਾਡੀ ਪਰਾਲੀ ਬੁੱਕ ਕਰਦੀ ਹੈ, ਅੰਦਾਜ਼ੇ ਦਾ 25% ਪੇਸ਼ਗੀ। ਬਾਕੀ ਤੋਲੇ ਗਏ ਟਨਾਂ ’ਤੇ, ਚੁਕਾਈ ਤੋਂ 7 ਦਿਨਾਂ ਦੇ ਅੰਦਰ।',
        },
        {
          q: 'ਮੇਰੀ ਪਰਾਲੀ ਕਿਵੇਂ ਤੋਲੀ ਜਾਵੇਗੀ?',
          a: 'ਫ਼ੈਕਟਰੀ ਆਪਣਾ ਟਰੱਕ ਭੇਜਦੀ ਹੈ। ਤੁਹਾਡੇ ਖੇਤ ’ਤੇ ਉਨ੍ਹਾਂ ਦਾ ਸਟਾਫ਼ ਗੱਠਾਂ ਤੋਲਦਾ ਹੈ, ਤੁਹਾਡੀ ਐਪ ਵਾਲਾ 6 ਅੰਕਾਂ ਦਾ ਕੋਡ ਚੈੱਕ ਕਰਦਾ ਹੈ, ਅਤੇ ਤੁਹਾਨੂੰ ਪਰਚੀ ਦਿੰਦਾ ਹੈ।',
        },
        {
          q: 'ਕੀ ਕੋਈ ਫ਼ੀਸ ਹੈ?',
          a: 'ਨਹੀਂ। ਪਾਇਲਟ ਦੌਰਾਨ ਪਰਾਲੀਲਿੰਕ ਕੋਈ ਫ਼ੀਸ ਨਹੀਂ ਲੈਂਦਾ।',
        },
        {
          q: 'ਮੈਂ ਸਮਾਰਟਫ਼ੋਨ ਘੱਟ ਵਰਤਦਾ ਹਾਂ। ਕੀ ਫਿਰ ਵੀ ਵੇਚ ਸਕਦਾ ਹਾਂ?',
          a: 'ਹਾਂ। ਐਪ ਪੰਜਾਬੀ ਵਿੱਚ ਹੈ, ਸਕ੍ਰੀਨ ਪੜ੍ਹ ਕੇ ਸੁਣਾਉਂਦੀ ਹੈ ਅਤੇ ਬਹੁਤ ਘੱਟ ਟਾਈਪ ਕਰਨਾ ਪੈਂਦਾ ਹੈ। ਪਿੰਡ ਦਾ ਏਜੰਟ ਵੀ ਤੁਹਾਡੀ ਪਰਾਲੀ ਪਾ ਸਕਦਾ ਹੈ।',
        },
      ],
    },
    closing: {
      title: ['ਘੜੀ ਚੱਲਣ ਤੋਂ', ['ਪਹਿਲਾਂ', ' ਬੇਲਰ'], 'ਬੁੱਕ ਕਰੋ।'],
      tagline: null,
      body: 'ਵਾਢੀ ਤੋਂ ਪਹਿਲਾਂ ਬੁਕਿੰਗ ਖੁੱਲ੍ਹ ਜਾਂਦੀ ਹੈ, ਤਾਂ ਜੋ ਜਿਸ ਹਫ਼ਤੇ ਤੁਹਾਡਾ ਖੇਤ ਕੱਟਿਆ ਜਾਵੇ, ਉਸੇ ਹਫ਼ਤੇ ਪਿਕਅੱਪ ਤਿਆਰ ਹੋਵੇ।',
    },
    footer: {
      about: 'ਪੰਜਾਬ ਲਈ ਝੋਨੇ ਦੀ ਪਰਾਲੀ ਦੀ ਮੰਡੀ। ਟੀਮ ਕਲਾਮ, ਗੁਰੂ ਨਾਨਕ ਦੇਵ ਇੰਜੀਨੀਅਰਿੰਗ ਕਾਲਜ, ਲੁਧਿਆਣਾ ਵੱਲੋਂ ਬਣਾਇਆ।',
      tagline: null,
      explore: 'ਦੇਖੋ',
      join: 'ਜੁੜੋ',
      joinLinks: ['ਕਿਸਾਨ', 'ਉਦਯੋਗ', 'ਬੇਲਰ ਮਾਲਕ'],
    },
    notFound: { title: ['ਖੇਤ ', 'ਨਹੀਂ ਮਿਲਿਆ।'], body: 'ਇਹ ਪੰਨਾ ਮੌਜੂਦ ਨਹੀਂ ਜਾਂ ਹਟਾ ਦਿੱਤਾ ਗਿਆ ਹੈ।', back: 'ਮੁੱਖ ਪੰਨੇ ’ਤੇ ਜਾਓ' },
  },
}

// Images are the same in both languages.
for (const lang of Object.values(CONTENT)) {
  lang.roles.list = lang.roles.list.map((r) => ({ ...r, ...ROLE_IMAGES[r.id] }))
}
