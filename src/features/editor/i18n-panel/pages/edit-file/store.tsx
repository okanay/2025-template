import { createContext, PropsWithChildren, useContext, useState } from 'react'
import { createStore, StoreApi, useStore } from 'zustand'
import { immer } from 'zustand/middleware/immer'

interface DataState {}
type Props = PropsWithChildren & {}

export function EditFileStoreI18n({ children }: Props) {
  const [store] = useState(() => createStore<DataState>()(immer((set) => ({}))))

  return <Context.Provider value={store}>{children}</Context.Provider>
}

// Context and helper functions
type Context = StoreApi<DataState> | undefined
const Context = createContext<Context>(undefined)

export function useI18nPanel() {
  const context = useContext(Context)
  if (!context) {
    throw new Error('useI18nPanel must be used within a I18nPanelProvider')
  }

  return useStore(context, (state) => state)
}
