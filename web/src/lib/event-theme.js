import { FALLBACK_ACTIVATION_CONFIG } from '../features/activation/lib/frame-presets.js'

export function resolveEventTheme(theme = {}) {
  return {
    ...FALLBACK_ACTIVATION_CONFIG.theme,
    ...(theme || {}),
  }
}

export function applyEventTheme(eventConfigOrTheme) {
  const root = document.documentElement
  const theme = resolveEventTheme(
    eventConfigOrTheme?.theme ? eventConfigOrTheme.theme : eventConfigOrTheme,
  )

  root.style.setProperty('--event-accent', theme.accent)
  root.style.setProperty('--event-accent-soft', theme.accentSoft)
  root.style.setProperty('--event-accent-contrast', theme.accentContrast)
  root.style.setProperty('--event-accent-border', theme.accentBorder)
  root.style.setProperty('--event-accent-muted', theme.accentMuted)
  root.style.setProperty('--event-accent-shadow', theme.accentShadow)
  root.style.setProperty('--event-shell-top', theme.shellTop)
  root.style.setProperty('--event-shell-bottom', theme.shellBottom)
  root.style.setProperty('--event-ambient', theme.ambient)
}
