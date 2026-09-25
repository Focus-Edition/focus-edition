import { UserProfile } from '../../types/user';
import { isSupabaseConfigured, supabase } from './client';

export const DEMO_USER: UserProfile = {
  id: 'u_demo_alex',
  email: 'alex@focus-edition.app',
  name: 'Alex Avery',
  avatarInitials: 'AA',
  isDemoUser: true,
  allowAiProcessing: false, // OFF by default
  subscriptionTier: 'pro',
  subscriptionStatus: 'active',
  testModeSubscription: true,
  createdAt: '2026-09-10'
};

let currentUser: UserProfile | null = DEMO_USER;

export async function signInDemoUser(): Promise<UserProfile> {
  currentUser = { ...DEMO_USER };
  return currentUser;
}

export async function signInWithEmail(email: string, password?: string): Promise<UserProfile> {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: password || 'demo1234'
    });
    if (error) throw error;

    const user = data.user;
    currentUser = {
      id: user.id,
      email: user.email || email,
      name: user.user_metadata?.name || email.split('@')[0],
      avatarInitials: (user.user_metadata?.name || email.slice(0, 2)).slice(0, 2).toUpperCase(),
      allowAiProcessing: user.user_metadata?.allow_ai || false,
      subscriptionTier: user.user_metadata?.tier || 'free',
      subscriptionStatus: user.user_metadata?.sub_status || 'active',
      testModeSubscription: false,
      createdAt: user.created_at || new Date().toISOString()
    };
    return currentUser;
  }

  // Local / Demo mode fallback
  currentUser = {
    id: `u_${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
    email,
    name: email.split('@')[0],
    avatarInitials: email.slice(0, 2).toUpperCase(),
    allowAiProcessing: false,
    subscriptionTier: 'free',
    subscriptionStatus: 'active',
    testModeSubscription: false,
    createdAt: new Date().toISOString()
  };
  return currentUser;
}

export async function signUpWithEmail(email: string, password: string, name: string): Promise<UserProfile> {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, allow_ai: false }
      }
    });
    if (error) throw error;
    const user = data.user!;
    currentUser = {
      id: user.id,
      email: user.email || email,
      name,
      avatarInitials: name.slice(0, 2).toUpperCase(),
      allowAiProcessing: false,
      subscriptionTier: 'free',
      subscriptionStatus: 'trial',
      testModeSubscription: false,
      createdAt: new Date().toISOString()
    };
    return currentUser;
  }

  currentUser = {
    id: `u_${Date.now()}`,
    email,
    name,
    avatarInitials: name.slice(0, 2).toUpperCase(),
    allowAiProcessing: false,
    subscriptionTier: 'free',
    subscriptionStatus: 'trial',
    testModeSubscription: false,
    createdAt: new Date().toISOString()
  };
  return currentUser;
}

export async function signOut(): Promise<void> {
  if (isSupabaseConfigured()) {
    await supabase.auth.signOut();
  }
  currentUser = null;
}

export function getCurrentUser(): UserProfile | null {
  return currentUser;
}

export function setAllowAiProcessing(allowed: boolean): void {
  if (currentUser) {
    currentUser.allowAiProcessing = allowed;
  }
}
