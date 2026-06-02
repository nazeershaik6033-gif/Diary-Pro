// Indian public holidays + major festivals
// Fixed dates (MM-DD) — appear every year
export const FIXED_HOLIDAYS: Record<string, string> = {
  '01-01': "New Year's Day 🎉",
  '01-26': 'Republic Day 🇮🇳',
  '04-14': 'Ambedkar Jayanti',
  '08-15': 'Independence Day 🇮🇳',
  '09-05': "Teacher's Day",
  '10-02': 'Gandhi Jayanti',
  '12-25': 'Christmas 🎄',
  '12-31': "New Year's Eve",
}

// Variable dates (YYYY-MM-DD) — lunar/religious festivals
export const VARIABLE_HOLIDAYS: Record<string, string> = {
  '2025-02-26': 'Maha Shivratri',
  '2025-03-14': 'Holi 🌈',
  '2025-03-31': 'Eid ul-Fitr ☪️',
  '2025-04-06': 'Ram Navami',
  '2025-04-14': 'Baisakhi',
  '2025-04-18': 'Good Friday ✝️',
  '2025-06-07': 'Eid ul-Adha ☪️',
  '2025-08-16': 'Janmashtami',
  '2025-08-27': 'Onam',
  '2025-10-02': 'Dussehra',
  '2025-10-20': 'Diwali 🪔',
  '2025-10-21': 'Diwali 🪔',
  '2025-11-05': 'Guru Nanak Jayanti',
  '2026-02-15': 'Maha Shivratri',
  '2026-03-03': 'Holi 🌈',
  '2026-03-20': 'Eid ul-Fitr ☪️',
  '2026-04-03': 'Good Friday ✝️',
  '2026-04-23': 'Ram Navami',
  '2026-05-27': 'Eid ul-Adha ☪️',
  '2026-10-22': 'Dussehra',
  '2026-11-08': 'Diwali 🪔',
  '2026-11-09': 'Diwali 🪔',
  '2026-11-25': 'Guru Nanak Jayanti',
}

/** Returns holiday name for a given date string (YYYY-MM-DD), or null */
export function getHoliday(dateStr: string): string | null {
  if (VARIABLE_HOLIDAYS[dateStr]) return VARIABLE_HOLIDAYS[dateStr]
  const mmdd = dateStr.slice(5) // 'MM-DD'
  return FIXED_HOLIDAYS[mmdd] ?? null
}
