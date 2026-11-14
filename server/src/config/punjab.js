/** Punjab's 23 districts (pilot region). Keep in sync with client/src/features/farmer/constants.js. */
export const PUNJAB_DISTRICTS = [
  'Amritsar',
  'Barnala',
  'Bathinda',
  'Faridkot',
  'Fatehgarh Sahib',
  'Fazilka',
  'Ferozepur',
  'Gurdaspur',
  'Hoshiarpur',
  'Jalandhar',
  'Kapurthala',
  'Ludhiana',
  'Malerkotla',
  'Mansa',
  'Moga',
  'Pathankot',
  'Patiala',
  'Rupnagar',
  'SAS Nagar (Mohali)',
  'SBS Nagar (Nawanshahr)',
  'Sangrur',
  'Sri Muktsar Sahib',
  'Tarn Taran',
]

/** Rough bounding box around Punjab, used to reject pins dropped far outside the state. */
export const PUNJAB_BOUNDS = { minLat: 29.5, maxLat: 32.6, minLng: 73.8, maxLng: 77.0 }
