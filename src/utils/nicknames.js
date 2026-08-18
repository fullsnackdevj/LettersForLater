/**
 * Maps full display names to short nicknames.
 * Since this app is just for Jay & Kiss, we keep it simple.
 */
const NICKNAME_MAP = {
  'jay fullsnack dev': 'Jay',
  'jay': 'Jay',
  'jay (demo user)': 'Jay',
  'kisstine aira': 'Kiss',
  'kisstine': 'Kiss',
  'kiss': 'Kiss',
};

/**
 * Returns a short nickname for a given display name.
 * Falls back to the first word of the name if no mapping found.
 */
export function getNickname(fullName) {
  if (!fullName) return 'You';
  const key = fullName.trim().toLowerCase();
  if (NICKNAME_MAP[key]) return NICKNAME_MAP[key];
  // Fallback: use the first word
  return fullName.trim().split(/\s+/)[0];
}
