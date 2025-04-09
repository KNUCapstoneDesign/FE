import { create } from 'zustand'

type AuthStore = {
  isAuthenticated: boolean
  token: string | null
  login: (user: { name: string; email: string; phone: string; token: string }) => void;
  logout: () => void
  email: string
  name: string
  password: string
  phone: string
}

export const useAuthStore = create<AuthStore>((set) => ({
  isAuthenticated: false,
  token: null,
  login: ({ name, email, phone, token }) => set({ name, email, phone, token }),
  logout: () => {set({ isAuthenticated: false ,name: '', email: '', phone: '', token: '' });
    localStorage.removeItem('auth')},
  email: '',
  password: '',
  name: '',
  phone: ''
}))