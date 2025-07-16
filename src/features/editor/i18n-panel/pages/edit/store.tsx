import { createContext, PropsWithChildren, useContext, useState } from 'react'
import { createStore, StoreApi, useStore } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { toast } from 'sonner'
import type { I18nPayload } from 'src/messages/schema'

const API_URL = import.meta.env.VITE_APP_BACKEND_URL + '/public/content'

interface FileData {
  content: I18nPayload
  sha: string
  branch: string
}

interface DataState {
  // File data
  fileData: FileData | null
  i18nData: I18nPayload

  // UI State
  viewMode: 'ui' | 'json'
  isZen: boolean
  jsonEditText: string
  jsonError: string | null

  // API State
  isLoading: boolean
  isSaving: boolean
  error: string | null

  // Actions
  loadFile: (lang: string, ns: string) => Promise<void>
  saveFile: (lang: string, ns: string, message?: string) => Promise<void>
  updateField: (path: (string | number)[], newValue: any) => void
  setViewMode: (mode: 'ui' | 'json') => void
  setZenMode: (zen: boolean) => void
  setJsonText: (text: string) => void
  saveJsonChanges: () => void
  resetJsonText: () => void
  syncJsonFromData: () => void
}

type Props = PropsWithChildren & {}

export function EditFileStoreI18n({ children }: Props) {
  const [store] = useState(() =>
    createStore<DataState>()(
      immer((set, get) => ({
        // Initial state
        fileData: null,
        i18nData: {},
        viewMode: 'ui',
        isZen: true,
        jsonEditText: '',
        jsonError: null,
        isLoading: false,
        isSaving: false,
        error: null,

        // Load file from backend
        loadFile: async (lang: string, ns: string) => {
          set((state) => {
            state.isLoading = true
            state.error = null
          })

          try {
            const filePath = `src/messages/${lang}/${ns}.json`
            const response = await fetch(API_URL + `/i18n?path=${encodeURIComponent(filePath)}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
            })

            if (!response.ok) {
              throw new Error('Dosya yüklenemedi')
            }

            const data = await response.json()

            // Parse JSON content
            const parsedContent = JSON.parse(data.content)

            set((state) => {
              state.fileData = {
                content: parsedContent,
                sha: data.sha,
                branch: data.branch,
              }
              state.i18nData = parsedContent
              state.jsonEditText = data.content
              state.isLoading = false
            })

            toast.success(`${lang}/${ns}.json dosyası yüklendi`)
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Bilinmeyen hata'

            set((state) => {
              state.error = errorMessage
              state.isLoading = false
            })

            toast.error(`Dosya yükleme hatası: ${errorMessage}`)
          }
        },

        // Save file to backend
        saveFile: async (lang: string, ns: string, message?: string) => {
          const state = get()
          if (!state.fileData) {
            toast.error('Dosya bilgisi bulunamadı')
            return
          }

          set((draft) => {
            draft.isSaving = true
          })

          try {
            const filePath = `src/messages/${lang}/${ns}.json`
            const saveData = {
              category: 'i18n',
              path: filePath,
              content: JSON.stringify(state.i18nData, null, 2),
              sha: state.fileData.sha,
              message: message || `feat(i18n): update ${lang}/${ns}`,
            }

            const response = await fetch(API_URL + '/i18n/save', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
              body: JSON.stringify(saveData),
            })

            if (!response.ok) {
              throw new Error('Kaydetme işlemi başarısız')
            }

            const result = await response.json()

            set((draft) => {
              draft.isSaving = false
              // Yeni SHA'yı güncelle
              if (draft.fileData && result.sha) {
                draft.fileData.sha = result.sha
              }
              // Branch bilgisini de güncelle
              if (draft.fileData && result.branch) {
                draft.fileData.branch = result.branch
              }
            })

            toast.success('Dosya başarıyla kaydedildi!')
          } catch (err) {
            set((draft) => {
              draft.isSaving = false
            })

            const errorMessage = err instanceof Error ? err.message : 'Bilinmeyen hata'
            toast.error(`Kaydetme hatası: ${errorMessage}`)
            throw err
          }
        },

        // Update field value
        updateField: (path: (string | number)[], newValue: any) => {
          set((state) => {
            let currentLevel: any = state.i18nData
            for (let i = 0; i < path.length - 1; i++) {
              currentLevel = currentLevel[path[i]]
            }
            currentLevel[path[path.length - 1]] = newValue
          })
        },

        // Set view mode
        setViewMode: (mode: 'ui' | 'json') => {
          set((state) => {
            state.viewMode = mode

            // Sync JSON text when switching away from JSON mode
            if (mode !== 'json') {
              state.jsonEditText = JSON.stringify(state.i18nData, null, 2)
            }
          })
        },

        // Set zen mode
        setZenMode: (zen: boolean) => {
          set((state) => {
            state.isZen = zen
          })
        },

        // Set JSON text
        setJsonText: (text: string) => {
          set((state) => {
            state.jsonEditText = text
            state.jsonError = null
          })
        },

        // Save JSON changes to i18nData
        saveJsonChanges: () => {
          const state = get()

          try {
            const fullDataObject = JSON.parse(JSON.stringify(state.i18nData))
            const contentOnlyObject = JSON.parse(state.jsonEditText)

            // Recursive merge function
            const mergeContent = (target: any, source: any) => {
              for (const key in source) {
                if (target.hasOwnProperty(key) && !key.startsWith('_')) {
                  if (
                    typeof source[key] === 'object' &&
                    source[key] !== null &&
                    !Array.isArray(source[key])
                  ) {
                    mergeContent(target[key], source[key])
                  } else {
                    target[key] = source[key]
                  }
                }
              }
            }

            mergeContent(fullDataObject, contentOnlyObject)

            set((draft) => {
              draft.i18nData = fullDataObject
              draft.jsonError = null
              draft.viewMode = 'ui'
            })

            toast.success('JSON değişiklikleri uygulandı')
          } catch (e: any) {
            set((draft) => {
              draft.jsonError = `Geçersiz JSON: ${e.message}`
            })
            toast.error('JSON formatında hata var')
          }
        },

        // Reset JSON text
        resetJsonText: () => {
          const state = get()
          const dataToReset = state.isZen ? stripMetaRecursively(state.i18nData) : state.i18nData

          set((draft) => {
            draft.jsonEditText = JSON.stringify(dataToReset, null, 2)
            draft.jsonError = null
          })
        },

        // Sync JSON text from current data
        syncJsonFromData: () => {
          set((state) => {
            state.jsonEditText = JSON.stringify(state.i18nData, null, 2)
          })
        },
      })),
    ),
  )

  return <Context.Provider value={store as StoreApi<DataState>}>{children}</Context.Provider>
}

// Helper function (moved from json-mode component)
export function stripMetaRecursively(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(stripMetaRecursively)
  }
  if (obj !== null && typeof obj === 'object') {
    const newObj: Record<string, any> = {}
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key) && !key.startsWith('_')) {
        newObj[key] = stripMetaRecursively(obj[key])
      }
    }
    return newObj
  }
  return obj
}

// Context and helper functions
type Context = StoreApi<DataState> | undefined
const Context = createContext<Context>(undefined)

export function useI18nPanel() {
  const context = useContext(Context)
  if (!context) {
    throw new Error('useI18nPanel must be used within a EditFileStoreI18n provider')
  }
  return useStore(context, (state) => state)
}
