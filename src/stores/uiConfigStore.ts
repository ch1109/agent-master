import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { mockPages } from '@/data/uiConfigMockData'

export type UIPageStatus = 'configured' | 'pending'

export interface UIPageConfig {
  id: string
  name: string
  englishName: string
  description: string
  status: UIPageStatus
  updatedAt: string
  pageId?: string
  thumbnail?: string
  screenshot?: string | null
  supportedIntents?: string[]
  buttons?: { label: string; action: string }[]
  aiRules?: string
  aiGoals?: string
  aiNotes?: string
}

interface UIConfigState {
  pages: UIPageConfig[]
  lastSavedPageId: string | null
  addPage: (page: Omit<UIPageConfig, 'id' | 'updatedAt' | 'status'> & { id?: string; status?: UIPageStatus; updatedAt?: string }) => string
  updatePage: (id: string, updates: Partial<UIPageConfig>) => void
  getPageById: (id: string) => UIPageConfig | undefined
  deletePage: (id: string) => void
  reset: () => void
}

const formatDate = () => new Date().toISOString().slice(0, 10)

const defaultPages: UIPageConfig[] = mockPages.map(page => ({
  ...page,
  screenshot: page.thumbnail || null,
}))

export const useUIConfigStore = create<UIConfigState>()(
  persist(
    (set, get) => ({
      pages: defaultPages,
      lastSavedPageId: null,

      addPage: (page) => {
        const id = page.id || `ui_${Date.now()}`
        const newPage: UIPageConfig = {
          id,
          name: page.name,
          englishName: page.englishName,
          description: page.description,
          status: page.status || 'configured',
          updatedAt: page.updatedAt || formatDate(),
          pageId: page.pageId,
          thumbnail: page.thumbnail || page.screenshot || null,
          screenshot: page.screenshot || page.thumbnail || null,
          supportedIntents: page.supportedIntents || [],
          buttons: page.buttons || [],
          aiRules: page.aiRules || '',
          aiGoals: page.aiGoals || '',
          aiNotes: page.aiNotes || '',
        }

        set(state => ({
          pages: [newPage, ...state.pages.filter(p => p.id !== id)],
          lastSavedPageId: id,
        }))

        return id
      },

      updatePage: (id, updates) => {
        set(state => {
          if (!state.pages.some(p => p.id === id)) {
            return state
          }

          return {
            pages: state.pages.map(p =>
              p.id === id
                ? {
                    ...p,
                    ...updates,
                    thumbnail: updates.screenshot || updates.thumbnail || p.thumbnail,
                    screenshot: updates.screenshot ?? p.screenshot ?? updates.thumbnail ?? null,
                    updatedAt: updates.updatedAt || formatDate(),
                  }
                : p
            ),
            lastSavedPageId: id,
          }
        })
      },

      getPageById: (id) => get().pages.find(p => p.id === id),

      deletePage: (id) => {
        set(state => {
          const remaining = state.pages.filter(p => p.id !== id)
          return {
            pages: remaining,
            lastSavedPageId: state.lastSavedPageId === id ? null : state.lastSavedPageId,
          }
        })
      },

      reset: () => set({
        pages: defaultPages,
        lastSavedPageId: null,
      }),
    }),
    {
      name: 'ui-config-store',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

export default useUIConfigStore
