import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface TourItem {
  contentid: number
  contenttypeid: number
  title: string
  addr1?: string
  firstimage?: string
  overview?: string
  mapx?: number
  mapy?: number
}

interface AisearchState {
  tab: 'restaurant' | 'tour'
  imageUrl: string | null
  labels: string[]
  selectedLabel: string | null
  results: TourItem[]
  setTab: (tab: 'restaurant' | 'tour') => void
  setImageUrl: (url: string | null) => void
  setLabels: (labels: string[]) => void
  setSelectedLabel: (label: string | null) => void
  setResults: (results: TourItem[]) => void
  reset: () => void
}

export const useAiSearchStore = create<AisearchState>()(
  persist(
    (set) => ({
      tab: 'restaurant',
      imageUrl: null,
      labels: [],
      selectedLabel: null,
      results: [],
      setTab: (tab) => set({ tab }),
      setImageUrl: (url) => set({ imageUrl: url }),
      setLabels: (labels) => set({ labels }),
      setSelectedLabel: (label) => set({ selectedLabel: label }),
      setResults: (results) => set({ results }),
      reset: () =>
        set({
          tab: 'restaurant',
          imageUrl: null,
          labels: [],
          selectedLabel: null,
          results: [],
        }),
    }),
    {
      name: 'ai-search-storage',
    },
  ),
)
