export const DEFAULT_PARTNER_PHOTO = 'https://lh3.googleusercontent.com/a/ACg8ocK0AYpGxnKztZRnu1ufPFVBqPOpynVO9H_nDeVLDUjItSIbfHw=s96-c';
export const DEFAULT_USER_PHOTO = 'https://lh3.googleusercontent.com/a/ACg8ocJcenbddAH2w3KzzQHzl7_5ba69OFBCfw8OiZl5m9gditCGtD0=s96-c';

/**
 * Maps full display names to short nicknames.
 * Since this app is just for Jay & Kiss, we keep it simple.
 */
const NICKNAME_MAP = {
  'jay fullsnack dev': 'Jay',
  'jay': 'Jay',
  'jay (demo user)': 'Jay',
  'kisstine aira palluto': 'Kisstine',
  'kisstine aira': 'Kisstine',
  'kisstine': 'Kisstine',
  'kiss': 'Kiss',
};

/**
 * Returns a short nickname for a given display name.
 * Falls back to the first word of the name if no mapping found.
 */
export function getNickname(fullName) {
  if (!fullName || fullName === 'Partner') return 'Kisstine';
  const key = fullName.trim().toLowerCase();
  if (NICKNAME_MAP[key]) return NICKNAME_MAP[key];
  // Fallback: use the first word
  return fullName.trim().split(/\s+/)[0];
}

