# Walkthrough - Acortador de Enlaces y Códigos QR para RPJ

Hemos desarrollado y verificado la compilación del proyecto utilizando **Astro (modo SSR)**, **Tailwind CSS v4**, **React**, **Drizzle ORM** y **Turso (SQLite)** listo para desplegar en **Vercel** de manera 100% gratuita.

---

## Cambios Realizados

1. **Configuración General del Proyecto**:
   - Inicializado el proyecto Astro minimal e instalado dependencias mediante `pnpm`.
   - Añadida la integración oficial de Tailwind CSS, React y el adaptador de Vercel en modo servidor (`output: 'server'`).
   - Creadas tipificaciones personalizadas para `Astro.locals` en `env.d.ts`.

2. **Modelado y Conectividad con la Base de Datos**:
   - `src/db/schema.ts`: Definición de las tablas `users` (usuarios de Google) y `urls` (enlaces acortados con contador de clics).
   - `src/db/index.ts`: Cliente de conexión robusto con Turso/libSQL adaptado para compilar sin variables de entorno en build-time.
   - `drizzle.config.ts`: Configuración para realizar migraciones contra la base de datos de Turso.

3. **Seguridad y Flujo de Autenticación**:
   - `src/auth.ts`: Utilidades JWT para cookies de sesión seguras (`session_token`).
   - `src/middleware.ts`: Intercepta las solicitudes protegidas y verifica que el usuario esté autenticado.
   - `src/pages/api/auth/login.ts` y `src/pages/api/auth/callback.ts`: Flujo completo de Google OAuth. **Verificación estricta** de correos finalizados con el dominio `@rpj.es`. Si el dominio no coincide, devuelve un error controlado y deniega la sesión.
   - `src/pages/api/auth/logout.ts`: Endpoint para borrar la cookie de sesión de manera segura.

4. **Lógica de Enlaces y Redirecciones**:
   - `src/pages/api/shorten.ts`: Endpoints `POST` (para acortar un enlace generando un slug de 6 caracteres aleatorios o uno personalizado comprobando colisiones) y `GET` (para listar el historial del usuario autenticado).
   - `src/pages/[code].astro`: Ruta dinámica global de redirección súper rápida que incrementa el contador de clics en la base de datos Turso y redirige con código `307` a la URL original.

5. **Aesthetics & Frontend Premium (UI)**:
   - `src/layouts/Layout.astro`: Contenedor base de la aplicación con un diseño de fondo sofisticado y gradientes luminosos en modo oscuro, con la paleta corporativa de RPJ (verde `#94C700` y azul `#80CAE3`).
   - `src/components/Dashboard.tsx`: Panel principal interactivo en React. Permite:
     - Ingresar URLs originales con validaciones y slugs personalizados opcionales.
     - Mostrar inmediatamente el resultado con visualización y descarga directa en PNG del Código QR dinámico generado en local.
     - Copiar rápidamente las URLs generadas mediante un botón interactivo.
     - Listar el historial de enlaces del usuario mostrando de forma visual el total de clics registrados.
     - Previsualizar en una caja modal (lightbox) de gran tamaño los QR y descargarlos en alta resolución.
   - `src/pages/index.astro`: Muestra el botón de "Iniciar sesión con Google" a usuarios anónimos o el dashboard completo a usuarios autenticados.
   - `src/pages/404.astro`: Vista 404 personalizada y estilizada si se intenta acceder a un enlace corto que no existe.

---

## Verificación

El proyecto se ha compilado con éxito mediante:
```bash
pnpm run build
```
Generando de forma correcta el bundle SSR para Vercel en la carpeta `.vercel/output`.

---

## Próximos Pasos para Producción (Instrucciones)

Para poner la aplicación online de manera **100% gratuita**, sigue estos pasos:

### 1. Crear Base de Datos en Turso
1. Instala el CLI de Turso o regístrate en [Turso.tech](https://turso.tech/).
2. Crea una base de datos gratuita:
   ```bash
   turso db create rpj-shortener
   ```
3. Obtén la URL y el token de conexión:
   ```bash
   turso db show rpj-shortener --show-urls-only
   turso db tokens create rpj-shortener
   ```
4. Ejecuta las migraciones en tu local para preparar el esquema de tablas en Turso:
   ```bash
   pnpm drizzle-kit push
   ```

### 2. Configurar Google Cloud Console (Google OAuth)
1. Ve a [Google Cloud Console](https://console.cloud.google.com/).
2. Crea un proyecto y configura la pantalla de consentimiento de OAuth con tipo de usuario **Externo**.
3. En la sección de credenciales, crea un **ID de cliente de OAuth** de tipo *Aplicación Web*.
4. Configura los URIs de redirección autorizados:
   - Local: `http://localhost:4321/api/auth/callback`
   - Producción: `https://tu-proyecto.vercel.app/api/auth/callback`

### 3. Desplegar en Vercel
1. Conecta tu repositorio de GitHub a tu cuenta gratuita de Vercel.
2. Añade las siguientes **Variables de Entorno** en la configuración del proyecto en Vercel:
   - `TURSO_DATABASE_URL` (URL de tu DB de Turso)
   - `TURSO_AUTH_TOKEN` (Token de autenticación de Turso)
   - `GOOGLE_CLIENT_ID` (Google Client ID obtenido en el paso 2)
   - `GOOGLE_CLIENT_SECRET` (Google Client Secret obtenido en el paso 2)
   - `JWT_SECRET` (Una cadena aleatoria larga y segura para encriptar los tokens de sesión)
3. ¡Haz clic en **Deploy** y listo!
