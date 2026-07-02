# rpj-short-and-qr

Aplicación web interna para la **Red de Pastoral Juvenil (RPJ)** destinada a la creación rápida y administración de enlaces acortados (slugs aleatorios y personalizados) y la generación en tiempo real de códigos QR corporativos personalizables.

El proyecto está diseñado para funcionar de manera **100% gratuita** en entornos de producción mediante el uso de **Astro (SSR)**, **React**, **Tailwind CSS v4**, **Drizzle ORM** y **Turso (SQLite en el Edge)**, desplegado de manera directa en **Vercel**.

---

## Características Principales

- 🔐 **Autenticación con Google**: Restricción estricta de dominios de correo electrónico. Únicamente permite el acceso y administración a usuarios con cuenta corporativa `@rpj.es`.
- 🔗 **Acortador Flexible**: Permite generar enlaces cortos aleatorios de 6 caracteres o definir alias personalizados rápidos comprobando colisiones.
- 🎨 **Personalizador de Códigos QR**:
  - Cambio en vivo del color del código QR (Negro, Verde RPJ `#94C700`, Azul RPJ `#80CAE3` o Azul Oscuro).
  - Selector de color de fondo (incluye la opción transparente para fines de diseño).
  - Inclusión opcional de la marca corporativa de la RPJ en el centro del código QR (usando el nivel de corrección de errores `H` para asegurar lectura correcta).
  - Descarga del QR resultante en formato PNG de alta resolución.
- 📊 **Panel de Administración (Dashboard)**:
  - Listado de los enlaces creados recientemente por el usuario.
  - Contador de clics acumulados por cada enlace.
  - Herramientas en línea para editar la URL de destino o el alias corto, y borrar enlaces permanentemente.
- 🌓 **Tema Adaptativo**: Alternancia fluida entre tema claro y tema oscuro sincronizado con la configuración de tu sistema y guardando la preferencia del usuario en `localStorage`.

---

## Tecnologías Utilizadas

- **Frontend & Routing**: [Astro (SSR mode)](https://astro.build/) + [React](https://react.dev/) + [Lucide Icons](https://lucide.dev/)
- **Estilos**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Base de Datos**: [Turso Database](https://turso.tech/) (SQLite en el Edge)
- **ORM (Modelado)**: [Drizzle ORM](https://orm.drizzle.team/)
- **Alojamiento**: [Vercel](https://vercel.com/) (Serverless & Static Hosting)

---

## Estructura de Directorios

```text
├── drizzle/              # Archivos generados y migraciones de base de datos
├── public/               # Recursos estáticos (Logotipo oficial logo.webp)
├── src/
│   ├── components/       # Componentes de React (Dashboard, ThemeToggle)
│   ├── db/               # Inicialización del cliente Turso y esquema Drizzle
│   ├── layouts/          # Plantilla principal HTML y lógica anti-flash de temas
│   ├── pages/            # Rutas de Astro (Vistas y endpoints de API)
│   │   ├── api/          # Endpoints de login, callback Google OAuth y links
│   │   └── [code].astro  # Endpoint dinámico para redirección y click-counting
│   ├── styles/           # Estilos globales de Tailwind CSS v4
│   ├── auth.ts           # Utilidades para sesión basadas en JWT y cookies
│   ├── env.d.ts          # Declaración de tipados para Astro
│   └── middleware.ts     # Filtro de protección de rutas y sesión
├── astro.config.mjs      # Configuración de Astro con SSR Vercel Adapter
├── drizzle.config.ts     # Configuración para migraciones en Turso
└── package.json          # Dependencias y scripts de ejecución
```

---

## Configuración del Entorno de Desarrollo Local

### 1. Requisitos Previos

Asegúrate de contar con [Node.js v22+](https://nodejs.org/) y [pnpm](https://pnpm.io/) instalados en tu sistema.

### 2. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto basándote en la plantilla `.env.example`:

```env
# Conexión Turso Database
TURSO_DATABASE_URL=libsql://rpj-short-and-qr-redpastoraljuvenil.aws-eu-west-1.turso.io
TURSO_AUTH_TOKEN=tu_token_de_turso

# Credenciales Google OAuth
GOOGLE_CLIENT_ID=tu_cliente_id_de_google
GOOGLE_CLIENT_SECRET=tu_secreto_de_google

# Clave de firma para tokens de sesión JWT
JWT_SECRET=tu_frase_secreta_jwt
```

*Nota: Para que el flujo de Login con Google funcione en local, debes agregar la URI `http://localhost:4321/api/auth/callback` dentro de las credenciales autorizadas en tu consola de Google Cloud Developer.*

### 3. Instalar Dependencias

```bash
pnpm install
```

### 4. Empujar Esquema a la Base de Datos (Turso)

```bash
pnpm drizzle-kit push
```

### 5. Iniciar Servidor de Desarrollo

```bash
pnpm run dev
```

El servidor local se levantará en: **`http://localhost:4321`**

---

## Despliegue en Producción (Vercel)

El proyecto está preconfigurado para compilarse y desplegarse automáticamente al conectar tu repositorio de GitHub a tu cuenta de Vercel.

### 1. Variables de Entorno a Configurar en Vercel

Configura las variables descritas arriba dentro del panel del proyecto en Vercel: **Settings** > **Environment Variables** (marca el entorno `Production`).

### 2. URI de Redirección Autorizado en Google Cloud Console

Para que el inicio de sesión funcione con tu dominio definitivo, ve a las credenciales de tu consola de Google y añade en **URIs de redireccionamiento autorizados**:
- `https://link.rpj.es/api/auth/callback`

### 3. Vincular Dominio Personalizado

1. En el panel de Vercel de tu proyecto, ve a **Settings** > **Domains**.
2. Agrega tu dominio personalizado: `link.rpj.es`.
3. Sigue las instrucciones de Vercel para apuntar los registros CNAME o A de tus DNS. Vercel emitirá y renovará los certificados SSL gratuitos de forma automática.
