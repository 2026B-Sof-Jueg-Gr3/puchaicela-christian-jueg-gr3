# Atrapa las Estrellas

Un juego de plataformas arcade creado con Phaser 3 y TypeScript. El arte de pegatinas (protagonista, plataformas, estrellas y enemigos) se dibuja con gráficos de Phaser, y la música y los efectos se sintetizan con Web Audio: no se necesitan imágenes, sonidos ni servicios externos.

## Requisitos

- Node.js 20.19+ o 22.12+ y npm.
- Un navegador moderno con soporte para Canvas y Web Audio.

## Instalar y ejecutar

```bash
npm install
npm run dev
```

Abre la dirección local que muestre Vite (normalmente `http://localhost:5173/`).

## Comprobar y compilar

```bash
npm run typecheck
npm run build
```

Vite escribe el sitio de producción en `dist/`. El comando de compilación ejecuta primero TypeScript en modo estricto.

## Controles

- Escritorio: ← / → o A / D para moverse; ↑, W o Espacio para saltar; Esc o el botón II para pausar.
- Táctil: botones grandes en pantalla para moverse y saltar.
- Recoge las ocho estrellas de cada nivel; evita los bichitos y no caigas. Hay tres vidas y cinco niveles. El récord se guarda en `localStorage`.
- El menú ofrece instrucciones, y las pantallas de pausa y resultados tienen botones funcionales para reanudar, volver al menú y volver a jugar.

La música empieza después de iniciar una partida, cuando el navegador permite audio. No hay archivos de recursos que descargar.

## Publicar en GitHub Pages

El flujo `.github/workflows/deploy.yml` compila y publica el juego al hacer push a `main` o ejecutarse manualmente. En el repositorio, ve a **Settings → Pages** y selecciona **GitHub Actions** como fuente. La base de Vite está configurada para el repositorio `puchaicela-christian-jueg-gr3`; actualiza `vite.config.ts` si cambia el nombre del repositorio.

## Solución de problemas

- Si npm avisa de una versión antigua de Node, instala Node.js 22 LTS y vuelve a ejecutar `npm install`.
- Si los cambios parecen no aparecer, detén y vuelve a iniciar `npm run dev`, o recarga el navegador sin caché.
- Si GitHub Pages muestra 404, confirma que el flujo terminó correctamente y que la fuente de Pages es **GitHub Actions**.
- Si no se oye la música, haz clic en **Jugar** y comprueba el volumen del navegador y del dispositivo.
