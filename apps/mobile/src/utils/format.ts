import { Colors } from '../theme';

export const formatRoomCode = (code: string): string => {
  return code.toUpperCase().trim();
};

export const sanitizeNickname = (nickname: string): string => {
  return nickname.replace(/[^a-zA-Z0-9]/g, '').slice(0, 50);
};

export const capitalizeFirst = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const getScoreStyle = (
  score: number,
): { label: string; color: string; bgColor: string } => {
  if (score >= 10)
    return { label: '10 pts', color: Colors.success, bgColor: Colors.successDim };
  if (score >= 5)
    return { label: '5 pts', color: Colors.warning, bgColor: '#7A3E10' };
  return { label: '0 pts', color: Colors.textMuted, bgColor: Colors.surfaceLight };
};

export const getOrdinal = (n: number): string => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

export const getPodiumEmoji = (position: number): string => {
  switch (position) {
    case 1:
      return '🥇';
    case 2:
      return '🥈';
    case 3:
      return '🥉';
    default:
      return `#${position}`;
  }
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 1) + '…';
};
