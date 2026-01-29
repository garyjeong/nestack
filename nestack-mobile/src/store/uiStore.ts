import { create } from 'zustand'
import { Appearance } from 'react-native'

interface UIState {
  navigationReady: boolean
  bottomSheetOpen: boolean
  isDarkMode: boolean
}

interface UIActions {
  setNavigationReady: (ready: boolean) => void
  setBottomSheetOpen: (open: boolean) => void
  toggleDarkMode: () => void
  setDarkMode: (dark: boolean) => void
}

type UIStore = UIState & UIActions

export const useUIStore = create<UIStore>()((set) => ({
  navigationReady: false,
  bottomSheetOpen: false,
  isDarkMode: Appearance.getColorScheme() === 'dark',

  setNavigationReady: (ready) => set({ navigationReady: ready }),
  setBottomSheetOpen: (open) => set({ bottomSheetOpen: open }),
  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
  setDarkMode: (dark) => set({ isDarkMode: dark }),
}))
