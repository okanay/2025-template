import { createServerFn } from '@tanstack/react-start'
import { getCookie } from '@tanstack/react-start/server'
import { createContext, PropsWithChildren, useContext, useState } from 'react'
import { createStore, StoreApi, useStore } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import Cookies from 'js-cookie'

declare global {
  type Theme = 'light' | 'dark' | 'system'
}

interface DataState {
  theme: Theme
  setTheme: (theme: Theme) => void
  clearTheme: () => void
}

type Props = PropsWithChildren & {
  initialTheme?: Theme
}

export const THEME_SET: Theme[] = ['light', 'dark', 'system']
export const THEME_DEFAULT = 'system'
export const THEME_COOKIE_KEY = 'theme'
export const THEME_COOKIE_DURATION = 365 * 24 * 60 * 60 * 1000

export function ThemeStore({ children, initialTheme }: Props) {
  const [store] = useState(() =>
    createStore<DataState>()(
      immer((set, get) => ({
        theme: initialTheme || THEME_DEFAULT,
        setTheme: (theme) => {
          // 1.0 : Check if the theme is already set to the desired theme
          if (theme === get().theme) return

          // 2.0 : Check if the theme is valid
          if (!THEME_SET.includes(theme)) return

          // 3.0 : Change <html> class to new theme.
          document.documentElement.classList.remove('light', 'dark')
          document.documentElement.classList.add(theme)

          // 4.0 : Update the theme in the store
          set({ theme })

          // 5.0 : Update the theme in the cookie
          Cookies.set(THEME_COOKIE_KEY, theme, { expires: THEME_COOKIE_DURATION })
        },
        clearTheme: () => {
          // 1.0 : Remove the class attribute from <html>.
          document.documentElement.removeAttribute('class')

          // 2.0 : Update the theme in the store
          set({ theme: THEME_DEFAULT })

          // 3.0 : Update the theme in the cookie
          Cookies.remove(THEME_COOKIE_KEY)
        },
      })),
    ),
  )

  return <ThemeContext.Provider value={store}>{children}</ThemeContext.Provider>
}

export const getPreferedTheme = createServerFn({ method: 'GET' }).handler(async () => {
  const themeInCookie = getCookie(THEME_COOKIE_KEY)

  if (themeInCookie) {
    const isPreferedThemeSafe = THEME_SET.find((t) => t === themeInCookie)

    if (isPreferedThemeSafe) return isPreferedThemeSafe
  }

  return THEME_DEFAULT
})

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useAuth hook must be used within an AuthProvider')
  }
  return useStore(context, (state) => state)
}

// Theme Not Importend Types
type Context = StoreApi<DataState> | undefined
const ThemeContext = createContext<Context>(undefined)
