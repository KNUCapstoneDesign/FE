import { create } from 'zustand'

type AuthStore = {
  isAuthenticated: boolean
  token: string | null
  login: (token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  isAuthenticated: false,
  token: null,
  login: (token) => set({ isAuthenticated: true, token }),
  logout: () => set({ isAuthenticated: false, token: null }),
}))
