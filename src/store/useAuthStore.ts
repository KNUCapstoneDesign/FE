import { create } from 'zustand'

type AuthStore = {
  isAuthenticated: boolean
  token: string | null
  login: (user: { name: string; email: string; phone: string; token: string }) => void;
  logout: () => void
  email: string
  name: string
  phone: string
  hydrated: boolean
  loadFromLocalStorage: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  isAuthenticated: false,
  token: null,
  email: '',
  name: '',
  phone: '',
  hydrated: false,

  // 로그인 함수 - 로컬 스토리지에 사용자 정보 저장
  login: ({ name, email, phone, token }) => {
    localStorage.setItem('auth', JSON.stringify({ name, email, phone, token }))
    set({ isAuthenticated: true, name, email, phone, token })
  },

  // 로그아웃 함수 - 로컬 스토리지에서 정보 삭제
  logout: () => {
    localStorage.removeItem('auth')
    set({ isAuthenticated: false, name: '', email: '', phone: '', token: null })
  },

  // 로컬 스토리지에서 로그인 상태 복원 (페이지 새로고침 시)
  loadFromLocalStorage: () => {
    const authData = localStorage.getItem('auth')
    if (authData) {
      const { name, email, phone, token } = JSON.parse(authData)
      set({ isAuthenticated: true, name, email, phone, token, hydrated: true })
    } else {
      set({ hydrated: true })
    }
  }
}))

// 페이지가 로드될 때 로컬 스토리지에서 사용자 정보 복원
if (typeof window !== 'undefined') {
  useAuthStore.getState().loadFromLocalStorage()
}