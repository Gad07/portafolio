# Portafolio (React + Vite)

Portafolio formal e innovador en escala de grises (blanco/negro/gris) con secciones: Inicio, Sobre mí, Proyectos y Contáctame.

## Ejecutar

1. Instala dependencias:

   ```bash
   npm install
   ```

2. Entorno de desarrollo:

   ```bash
   npm run dev
   ```

3. Compilar producción:

   ```bash
   npm run build
   npm run preview
   ```

## Personaliza

- Edita `src/pages/Home.jsx`, `src/pages/SobreMi.jsx` y `src/shared/projects.js` con tu información.
- Edita `src/pages/Home.jsx`, `src/pages/SobreMi.jsx` y `src/shared/projects.js` con tu información. Los proyectos se cargan desde `src/shared/projects.js` por defecto. Para usar repos de GitHub en lugar del JSON, habilita `USE_GITHUB_REPOS = true` en `src/shared/config.js`.
- Cambia `tucorreo@ejemplo.com` en `src/pages/Contacto.jsx` por tu correo real.
- Ajusta estilo en `src/styles/global.css`.

Agregar imágenes a proyectos
- Coloca archivos en `src/assets` y luego añade imports y la propiedad `image` y `gallery` en `src/shared/projects.js`.
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

