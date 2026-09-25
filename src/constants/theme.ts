import { UserAccessibilityPreferences } from '../types/user';

export const COLORS = {
  ink: '#12131A',
  muted: '#6B7288',
  line: '#E6E8EF',
  brand: '#6D4AFF',
  brandLight: '#F0EFFF',
  brandBorder: '#E0D8FF',
  ok: '#0FA968',
  okBg: '#E7F9F0',
  paper: '#FAFAFB',
  cardBg: '#FFFFFF',
  danger: '#EF4444',
  dangerBg: '#FEE2E2',
  warning: '#F59E0B',
  darkBg: '#0F0F12',
  darkCard: '#1A1C22',
  darkLine: '#2A2E3A',
  darkMuted: '#9AA0B5',
  darkText: '#E8EAF1'
};

export const DEFAULT_PREFERENCES: UserAccessibilityPreferences = {
  fontFamily: 'inter',
  fontSize: 'medium',
  lineSpacing: 'relaxed',
  letterSpacing: 'normal',
  bionicReading: false,
  bionicFixation: 0.45,
  bionicOpacity: 0.55,
  readingRuler: false,
  focusMode: false,
  highContrast: false,
  darkMode: false,
  reducedMotion: false,
  focusTimerMinutes: 25,
  breakReminders: true,
  ttsRate: 0.95,
  ttsPitch: 1.0
};

export function getFontFamilyString(family: string): string {
  switch (family) {
    case 'lexend':
      return 'Lexend, Inter, sans-serif';
    case 'opendyslexic':
      return 'OpenDyslexic, sans-serif';
    case 'hyper':
      return 'Atkinson Hyperlegible, sans-serif';
    case 'verdana':
      return 'Verdana, Geneva, sans-serif';
    case 'inter':
    default:
      return 'Inter, system-ui, -apple-system, sans-serif';
  }
}

export function getFontSizePixels(size: string): number {
  switch (size) {
    case 'small':
      return 14;
    case 'large':
      return 18;
    case 'xl':
      return 21;
    case 'medium':
    default:
      return 16;
  }
}

export function getLineHeightMultiplier(spacing: string): number {
  switch (spacing) {
    case 'normal':
      return 1.4;
    case 'loose':
      return 2.0;
    case 'relaxed':
    default:
      return 1.7;
  }
}

export function getLetterSpacingPixels(spacing: string): number {
  return spacing === 'wide' ? 0.8 : 0;
}
