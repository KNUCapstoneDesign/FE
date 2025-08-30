// src/store/useAuthStore.ts

import { create } from 'zustand'

type AuthStore = {
  isAuthenticated: boolean
  token: string | null
  login: (user: { name: string; email: string; phone: string; token: string; userId: number }) => void
  logout: () => void
  email: string
  name: string
  phone: string
  hydrated: boolean
  loadFromLocalStorage: () => void
  userId: number
  loginTimestamp: number | null
}

export const useAuthStore = create<AuthStore>((set) => ({
  isAuthenticated: false,
  token: null,
  email: '',
  name: '',
  phone: '',
  hydrated: false,
  userId: 0,
  loginTimestamp: null,

  login: ({ name, email, phone, token, userId }) => {
    const loginTimestamp = Date.now()
    localStorage.setItem('auth', JSON.stringify({ name, email, phone, token, userId, loginTimestamp }))
    set({ isAuthenticated: true, name, email, phone, token, userId, loginTimestamp })
  },

  logout: () => {
    localStorage.removeItem('auth')
    set({ isAuthenticated: false, name: '', email: '', phone: '', token: null, userId: 0, loginTimestamp: null })
  },

  loadFromLocalStorage: () => {
    const authData = localStorage.getItem('auth')
    if (authData) {
      const { name, email, phone, token, userId, loginTimestamp } = JSON.parse(authData)
      set({ isAuthenticated: true, name, email, phone, token, userId, loginTimestamp, hydrated: true })
    } else {
      set({ hydrated: true })
    }
  },
}))

if (typeof window !== 'undefined') {
  useAuthStore.getState().loadFromLocalStorage()
}