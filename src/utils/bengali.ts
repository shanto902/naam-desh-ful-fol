const BENGALI_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'] as const;

const BENGALI_MONTHS = [
  'জানুয়ারি',
  'ফেব্রুয়ারি',
  'মার্চ',
  'এপ্রিল',
  'মে',
  'জুন',
  'জুলাই',
  'আগস্ট',
  'সেপ্টেম্বর',
  'অক্টোবর',
  'নভেম্বর',
  'ডিসেম্বর',
] as const;

/**
 * Converts ASCII digits 0-9 into Bengali numerals ০-৯.
 */
export function toBengaliDigits(value: number | string): string {
  return String(value).replace(/\d/g, (digit) => BENGALI_DIGITS[Number(digit)]);
}

/**
 * Formats seconds as MM:SS in Bengali numerals (e.g. ৬০ -> ০১:০০).
 */
export function formatBengaliClock(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(safeSeconds / 60);
  const secs = safeSeconds % 60;
  const mm = String(mins).padStart(2, '0');
  const ss = String(secs).padStart(2, '0');
  return toBengaliDigits(`${mm}:${ss}`);
}

/**
 * Formats a human-readable Bengali ordinal rank (১ম, ২য়, ৩য়, ৪র্থ, ...).
 */
export function getBengaliOrdinal(rank: number): string {
  switch (rank) {
    case 1:
      return '১ম';
    case 2:
      return '২য়';
    case 3:
      return '৩য়';
    case 4:
      return '৪র্থ';
    case 5:
      return '৫ম';
    case 6:
      return '৬ষ্ঠ';
    default:
      return `${toBengaliDigits(rank)}তম`;
  }
}

/**
 * Formats an ISO date string into clear Bengali date and time without relying on OS locale quirks.
 */
export function formatBengaliDateTime(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return 'অজানা সময়';
  }

  const day = toBengaliDigits(date.getDate());
  const month = BENGALI_MONTHS[date.getMonth()];
  const year = toBengaliDigits(date.getFullYear());

  const hour24 = date.getHours();
  const minute = String(date.getMinutes()).padStart(2, '0');

  let period = 'রাত';
  if (hour24 >= 5 && hour24 < 12) {
    period = 'সকাল';
  } else if (hour24 >= 12 && hour24 < 16) {
    period = 'দুপুর';
  } else if (hour24 >= 16 && hour24 < 18) {
    period = 'বিকাল';
  } else if (hour24 >= 18 && hour24 < 20) {
    period = 'সন্ধ্যা';
  }

  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  const timePart = `${period} ${toBengaliDigits(hour12)}:${toBengaliDigits(minute)}`;

  return `${day} ${month} ${year}, ${timePart}`;
}
