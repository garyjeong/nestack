import { createMMKV } from 'react-native-mmkv'

export const storage = createMMKV()

export const StorageKeys = {
  AUTH: 'nestack-auth',
  THEME: 'nestack-theme',
  BIOMETRIC: 'nestack-biometric',
  ONBOARDED: 'nestack-onboarded',
} as const

export function getItem<T>(key: string): T | null {
  const value = storage.getString(key)
  if (!value) return null
  try {
    return JSON.parse(value) as T
  } catch {
    return null
  }
}

export function setItem(key: string, value: unknown): void {
  storage.set(key, JSON.stringify(value))
}

export function removeItem(key: string): void {
  storage.remove(key)
}
