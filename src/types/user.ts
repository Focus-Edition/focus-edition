export type FontFamilyOption = 'system' | 'inter' | 'lexend' | 'opendyslexic' | 'hyper' | 'verdana';
export type FontSizeOption = 'small' | 'medium' | 'large' | 'xl';
export type LineSpacingOption = 'normal' | 'relaxed' | 'loose';
export type LetterSpacingOption = 'normal' | 'wide';

export interface UserAccessibilityPreferences {
  fontFamily: FontFamilyOption;
  fontSize: FontSizeOption;
  lineSpacing: LineSpacingOption;
  letterSpacing: LetterSpacingOption;
  bionicReading: boolean;
  bionicFixation: number; // 0.2 to 0.7 (default 0.45)
  bionicOpacity: number;  // 0.3 to 0.9 (default 0.55)
  readingRuler: boolean;
  focusMode: boolean;
  highContrast: boolean;
  darkMode: boolean;
  reducedMotion: boolean;
  focusTimerMinutes: number; // 15, 25, 35, 50
  breakReminders: boolean;
  ttsRate: number; // 0.75 to 1.5 (default 0.95)
  ttsPitch: number;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatarInitials: string;
  isDemoUser?: boolean;
  allowAiProcessing: boolean; // CRITICAL: defaults to false! Never send private docs to AI without explicit opt-in
  subscriptionTier: 'free' | 'pro';
  subscriptionStatus: 'active' | 'trial' | 'canceled' | 'none';
  testModeSubscription: boolean;
  createdAt: string;
}

export interface OfflineActionQueueItem {
  id: string;
  action: 'toggle_mission' | 'save_quiz_score' | 'save_card_review' | 'create_edition' | 'delete_edition';
  payload: any;
  createdAt: string;
  synced: boolean;
}
