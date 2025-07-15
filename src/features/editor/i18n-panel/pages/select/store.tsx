import { createContext, PropsWithChildren, useContext, useState } from 'react'
import { createStore, StoreApi, useStore } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { toast } from 'sonner'
import { ns_dictionary } from 'src/messages/index'
import { LANGUAGES_VALUES } from 'src/i18n/config'

// ns = ['translation', 'common', 'globals']
// LANGUAGES_VALUES [ 'tr', 'en' ]
// export const ns_dictionary = [
//   { label: 'Çeviri', ns: ns[0] },
//   { label: 'Ortak', ns: ns[1] },
//   { label: 'Genel', ns: ns[2] },
// ]

interface DataState {}

type Props = PropsWithChildren & {}

export function SelectFileStoreI18n({ children }: Props) {
  const [store] = useState(() => createStore<DataState>()(immer((set, get) => ({}))))

  return <Context.Provider value={store as StoreApi<DataState>}>{children}</Context.Provider>
}

// Context and helper functions
type Context = StoreApi<DataState> | undefined
const Context = createContext<Context>(undefined)

export function useI18nSelect() {
  const context = useContext(Context)
  if (!context) {
    throw new Error('useI18nPanel must be used within a EditFileStoreI18n provider')
  }
  return useStore(context, (state) => state)
}
