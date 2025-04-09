import { create } from 'zustand'

type AuthStore = {
  isAuthenticated: boolean
  token: string | null
  login: (token: string) => void
  logout: () => void
  email: string
  name: string
  password: string
}

export const useAuthStore = create<AuthStore>((set) => ({
  isAuthenticated: false,
  token: null,
  login: (token) => set({ isAuthenticated: true, token }),
  logout: () => set({ isAuthenticated: false, token: null }),
  email: '',
  password: '',
  name: ''
}))
