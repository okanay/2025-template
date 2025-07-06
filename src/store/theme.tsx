import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react'
import { createStore, StoreApi, useStore } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import Cookies from 'js-cookie'
import { getCookie } from '@tanstack/react-start/server'
import { createServerFn } from '@tanstack/react-start'

declare global {
  type Theme = 'light' | 'dark' | 'system'
}

interface DataState {
  theme: Theme
  setTheme: (theme: Theme) => void
}

type Props = PropsWithChildren & {
  initialTheme: Theme
}

export const THEME_SET: Theme[] = ['light', 'dark', 'system']
export const THEME_DEFAULT: Theme = 'system'
export const THEME_COOKIE_KEY = 'theme'
export const THEME_COOKIE_DURATION = 365

export function ThemeStore({ children, initialTheme }: Props) {
  const [store] = useState(() =>
    createStore<DataState>()(
      immer((set) => ({
        theme: initialTheme,
        setTheme: (theme) => {
          if (!THEME_SET.includes(theme)) return

          set({ theme })

          if (theme === 'system') {
            Cookies.remove(THEME_COOKIE_KEY)
            localStorage.removeItem('theme')
            document.documentElement.removeAttribute('data-theme')
            document.documentElement.removeAttribute('class')

            const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
            const systemTheme = prefersDarkMode ? 'dark' : 'light'
            document.documentElement.setAttribute('data-theme', systemTheme)
            document.documentElement.className = systemTheme
          } else {
            Cookies.set(THEME_COOKIE_KEY, theme, { expires: THEME_COOKIE_DURATION })
            localStorage.setItem('theme', theme)
            document.documentElement.setAttribute('data-theme', theme)
            document.documentElement.className = theme
          }
        },
      })),
    ),
  )

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const updateTheme = () => {
      const currentTheme = store.getState().theme
      const rootElement = document.documentElement

      rootElement.removeAttribute('data-theme')
      rootElement.removeAttribute('class')

      if (currentTheme === 'system') {
        const systemTheme = mediaQuery.matches ? 'dark' : 'light'
        rootElement.setAttribute('data-theme', systemTheme)
        rootElement.className = systemTheme
      } else {
        rootElement.setAttribute('data-theme', currentTheme)
        rootElement.className = currentTheme
      }
    }

    // Apply the theme on initial load and whenever the theme state changes
    updateTheme()

    mediaQuery.addEventListener('change', updateTheme)
    return () => {
      mediaQuery.removeEventListener('change', updateTheme)
    }
  }, [])

  return <ThemeContext.Provider value={store}>{children}</ThemeContext.Provider>
}

export const getPreferedTheme = createServerFn({ method: 'GET' }).handler(async () => {
  const themeFromCookie = getCookie(THEME_COOKIE_KEY) as Theme | undefined

  if (themeFromCookie && THEME_SET.includes(themeFromCookie)) {
    return themeFromCookie
  }

  // The server cannot detect the OS preference, so it defaults to 'system' if no cookie is found.
  return THEME_DEFAULT
})

// Context and helper functions
type Context = StoreApi<DataState> | undefined
const ThemeContext = createContext<Context>(undefined)

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return useStore(context, (state) => state)
}
