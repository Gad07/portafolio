# Portafolio (React + Vite)

Portafolio formal e innovador en escala de grises (blanco/negro/gris) con secciones: Inicio, Sobre mí, Proyectos y Contáctame.

## Configuración inicial

1. Copia el archivo de entorno:

   ```bash
   cp .env.example .env
   ```

   Llena los valores reales de Firebase (si aún no tienes el proyecto, créalo en
   [Firebase Console](https://console.firebase.google.com/) y copia tu config).

2. Instala dependencias:

   ```bash
   npm install
   ```

3. Entorno de desarrollo:

   ```bash
   npm run dev
   ```

4. Compilar producción:

   ```bash
   npm run build
   npm run preview
   ```

> **IMPORTANTE**: Nunca subas `.env` a git (ya está en `.gitignore`).

## ⚠️ Seguridad — léelo antes de publicar

En un SPA (React + Vite) todas las claves de Firebase son visibles en el navegador,
así que **la protección real de tu base de datos son las Firestore Security Rules**.

### Activar reglas de Firestore (obligatorio)

1. Instala el CLI: `npm i -g firebase-tools`
2. `firebase login`
3. `firebase use portafolio-gadiel`
4. **Edita `firestore.rules`** y reemplaza `REEMPLAZA_CON_TU_UID` por tu UID de Firebase
   (Firebase Console → Authentication → Users → tu usuario → "User UID").
5. Despliega: `firebase deploy --only firestore:rules`

Sin estas reglas activas, cualquiera podría leer o borrar tus proyectos desde el panel.

### Token de GitHub

El dashboard puede incluir repos privados con un Personal Access Token (PAT).
En producción **no lo guardes en `localStorage` ni en variables de entorno del cliente**
(riesgo de XSS). Lo correcto es usar una función serverless (Netlify/Edge Functions)
que mantenga el token en el servidor.

## Personaliza

- Tu identidad (usuario de GitHub, email) está centralizada en `src/shared/config.js`
  — edítala una sola vez y se aplica en todo el sitio (nav, dashboard, login, contacto).
- Edita `src/pages/Home.jsx`, `src/pages/SobreMi.jsx` y `src/shared/projects.js` con tu
  información. Los proyectos también se cargan desde Firebase (`projects` collection)
  mediante el panel de administración en `/admin`.
- Cambia `tucorreo@ejemplo.com` en `src/pages/Contacto.jsx` por tu correo real.
- Ajusta estilo en `src/styles/global.css`.

### Agregar imágenes a proyectos
- Coloca archivos en `src/assets` y luego añade imports y la propiedad `image` y
  `gallery` en `src/shared/projects.js`.
- Ejemplo:
   import myImg from '../assets/proj1.png'
   {
      id: 'p4',
      title: 'Mi proyecto',
      description: 'Descripción',
      image: myImg,
      gallery: [myImg],
      repo: 'https://github.com/tu-usuario/tu-repo'
   }


