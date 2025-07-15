import { createContext, PropsWithChildren, useContext, useState, useEffect } from 'react'
import { createStore, StoreApi, useStore } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { toast } from 'sonner'

const API_URL = import.meta.env.VITE_APP_BACKEND_URL + '/public/i18n'

type DraftStatus = 'none' | 'has-changes' | 'loading'

interface FileChange {
  lang: string
  ns: string
  path: string
  status: string // "added", "modified", "deleted"
}

interface DataState {
  // State
  draftStatus: DraftStatus
  changedFiles: FileChange[]
  isLoading: boolean
  isPublishing: boolean
  isRestarting: boolean
  error: string | null

  // Actions
  checkDraftStatus: () => Promise<void>
  publishChanges: () => Promise<void>
  restartChanges: () => Promise<void>
}

type Props = PropsWithChildren & {}

export function SelectFileStoreI18n({ children }: Props) {
  const [store] = useState(() =>
    createStore<DataState>()(
      immer((set, get) => ({
        // Initial state
        draftStatus: 'none',
        changedFiles: [],
        isLoading: false,
        isPublishing: false,
        isRestarting: false,
        error: null,

        // Check draft status
        checkDraftStatus: async () => {
          set((state) => {
            state.draftStatus = 'loading'
            state.error = null
          })

          try {
            const response = await fetch(API_URL + '/draft-status', {
              method: 'GET',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
            })

            if (response.ok) {
              const data = await response.json()
              set((state) => {
                state.draftStatus = data.hasChanges ? 'has-changes' : 'none'
                state.changedFiles = data.changedFiles || []
              })
            } else {
              // API hatası varsa, muhtemelen draft yok
              set((state) => {
                state.draftStatus = 'none'
                state.changedFiles = []
              })
            }
          } catch (err) {
            set((state) => {
              state.draftStatus = 'none'
              state.error = 'Draft durumu kontrol edilemedi'
            })
            console.error('Draft status check failed:', err)
          }
        },

        // Publish changes
        publishChanges: async () => {
          set((state) => {
            state.isPublishing = true
            state.error = null
          })

          try {
            const response = await fetch(API_URL + '/publish-document', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
            })

            if (response.ok) {
              set((state) => {
                state.draftStatus = 'none'
                state.isPublishing = false
              })
              toast.success('Değişiklikler başarıyla yayınlandı!')
            } else {
              throw new Error('Yayınlama işlemi başarısız')
            }
          } catch (err) {
            set((state) => {
              state.isPublishing = false
              state.error = err instanceof Error ? err.message : 'Bilinmeyen hata'
            })
            toast.error(
              'Yayınlama hatası: ' + (err instanceof Error ? err.message : 'Bilinmeyen hata'),
            )
          }
        },

        // Restart changes (delete draft)
        restartChanges: async () => {
          set((state) => {
            state.isRestarting = true
            state.error = null
          })

          try {
            const response = await fetch(API_URL + '/restart-change', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
            })

            if (response.ok) {
              set((state) => {
                state.draftStatus = 'none'
                state.isRestarting = false
              })
              toast.success('Değişiklikler geri alındı!')
              window.location.reload()
            } else {
              throw new Error('Geri alma işlemi başarısız')
            }
          } catch (err) {
            set((state) => {
              state.isRestarting = false
              state.error = err instanceof Error ? err.message : 'Bilinmeyen hata'
            })
            toast.error(
              'Geri alma hatası: ' + (err instanceof Error ? err.message : 'Bilinmeyen hata'),
            )
          }
        },
      })),
    ),
  )

  // Auto-check draft status on mount
  useEffect(() => {
    const { checkDraftStatus } = store.getState()
    checkDraftStatus()
  }, [store])

  return <Context.Provider value={store}>{children}</Context.Provider>
}

// Context and helper functions
type Context = StoreApi<DataState> | undefined
const Context = createContext<Context>(undefined)

export function useI18nSelect() {
  const context = useContext(Context)
  if (!context) {
    throw new Error('useI18nSelect must be used within a SelectFileStoreI18n provider')
  }
  return useStore(context, (state) => state)
}
