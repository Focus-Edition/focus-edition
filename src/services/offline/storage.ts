import AsyncStorage from '@react-native-async-storage/async-storage';
import { Edition } from '../../types/mission';
import { UserAccessibilityPreferences, UserProfile, OfflineActionQueueItem } from '../../types/user';

const STORAGE_KEYS = {
  EDITIONS: 'fe_offline_editions_v1',
  USER_PROFILE: 'fe_offline_profile_v1',
  PREFERENCES: 'fe_offline_prefs_v1',
  QUEUE: 'fe_offline_action_queue_v1'
};

// Memory fallback for Node test environments or when AsyncStorage is unavailable
const memoryStorage: Record<string, string> = {};

async function getItem(key: string): Promise<string | null> {
  try {
    if (AsyncStorage && typeof AsyncStorage.getItem === 'function') {
      const val = await AsyncStorage.getItem(key);
      if (val !== null) return val;
    }
  } catch {}
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem(key);
  }
  return memoryStorage[key] || null;
}

async function setItem(key: string, value: string): Promise<void> {
  try {
    if (AsyncStorage && typeof AsyncStorage.setItem === 'function') {
      await AsyncStorage.setItem(key, value);
    }
  } catch {}
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(key, value);
  }
  memoryStorage[key] = value;
}

export async function loadOfflineEditions(): Promise<Edition[]> {
  const raw = await getItem(STORAGE_KEYS.EDITIONS);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function saveOfflineEditions(editions: Edition[]): Promise<void> {
  await setItem(STORAGE_KEYS.EDITIONS, JSON.stringify(editions));
}

export async function loadOfflinePreferences(defaults: UserAccessibilityPreferences): Promise<UserAccessibilityPreferences> {
  const raw = await getItem(STORAGE_KEYS.PREFERENCES);
  if (!raw) return defaults;
  try {
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return defaults;
  }
}

export async function saveOfflinePreferences(prefs: UserAccessibilityPreferences): Promise<void> {
  await setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(prefs));
}

export async function enqueueOfflineAction(action: OfflineActionQueueItem['action'], payload: any): Promise<void> {
  const raw = await getItem(STORAGE_KEYS.QUEUE);
  const queue: OfflineActionQueueItem[] = raw ? JSON.parse(raw) : [];
  queue.push({
    id: `queue_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    action,
    payload,
    createdAt: new Date().toISOString(),
    synced: false
  });
  await setItem(STORAGE_KEYS.QUEUE, JSON.stringify(queue));
}

export async function getOfflineQueue(): Promise<OfflineActionQueueItem[]> {
  const raw = await getItem(STORAGE_KEYS.QUEUE);
  return raw ? JSON.parse(raw) : [];
}

export async function clearOfflineQueue(): Promise<void> {
  await setItem(STORAGE_KEYS.QUEUE, JSON.stringify([]));
}
