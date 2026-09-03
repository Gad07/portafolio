// ─── Configuración central del portafolio ─────────────────────
// Todo lo relacionado con tu identidad se define AQUÍ una sola vez.

// Usuario de GitHub (se usa en el dashboard, auth y auto-fetch).
// La comparación de login es case-insensitive, así que usa minúsculas.
export const GITHUB_USERNAME = 'gad07'

// Email de contacto público
export const CONTACT_EMAIL = 'gadpalma7@gmail.com'

// Habilita/deshabilita auto-fetch desde GitHub. Para usar proyectos locales (recommended): false
export const USE_GITHUB_REPOS = false

// Token de GitHub para repos privados. NO lo pongas en el cliente en producción.
// En local usa `import.meta.env.VITE_GITHUB_TOKEN`. En producción, mejor una función
// serverless (Netlify/Edge) que guarde el token en el servidor.
export const GITHUB_TOKEN = import.meta.env?.VITE_GITHUB_TOKEN || ''

