export type ThemeMode = 'dark' | 'light'

const STORAGE_KEY = 'devajala-theme'

const theme = ref<ThemeMode>('dark')

function apply(mode: ThemeMode) {
  if (typeof document === 'undefined') return
  document.documentElement.setAttribute('data-theme', mode)
}

export function useTheme() {
  function init() {
    if (typeof window === 'undefined') return
    let stored: string | null = null
    try {
      stored = window.localStorage.getItem(STORAGE_KEY)
    } catch {
      // localStorage unavailable (private mode, blocked storage) — fall back to system preference
    }
    const prefersLight = window.matchMedia?.('(prefers-color-scheme: light)').matches
    theme.value = stored === 'light' || stored === 'dark' ? stored : (prefersLight ? 'light' : 'dark')
    apply(theme.value)
  }

  function toggle() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
    apply(theme.value)
    try {
      window.localStorage.setItem(STORAGE_KEY, theme.value)
    } catch {
      // ignore persistence failures
    }
  }

  return { theme, init, toggle }
}
