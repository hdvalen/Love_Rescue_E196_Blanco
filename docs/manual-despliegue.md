# Manual Técnico de Despliegue — Love Rescue (AdoptaMe)

> **Versión:** 1.0.0  
> **Última actualización:** Junio 2026

---

## Índice

1. [Requisitos del Sistema](#1-requisitos-del-sistema)
2. [Instalación Local](#2-instalación-local)
3. [Despliegue Gratuito](#3-despliegue-gratuito)
4. [Variables de Entorno](#4-variables-de-entorno)
5. [Problemas Comunes](#5-problemas-comunes)
6. [Checklist de Producción](#6-checklist-de-producción)

---

## 1. Requisitos del Sistema

| Requisito | Versión Mínima | Propósito |
|-----------|---------------|-----------|
| **Node.js** | 20.x LTS | Ejecutar backend y build frontend |
| **npm** | 10.x | Gestión de dependencias |
| **MySQL** | 8.0 | Base de datos principal |
| **Docker** (opcional) | 24.x | Despliegue contenerizado |
| **Git** | 2.x | Control de versiones |

### Verificar instalaciones

```bash
node --version   # v20.x o superior
npm --version    # 10.x o superior
mysql --version  # 8.0.x
docker --version # (opcional) 24.x
```

---

## 2. Instalación Local

### 2.1 Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd Love_Rescue_E196_Blanco
```

### 2.2 Configurar la Base de Datos

**Opción A: Usando los archivos SQL**

```bash
# Entrar a MySQL
mysql -u root -p

# Crear la base de datos
CREATE DATABASE IF NOT EXISTS adopcion_mascotas CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

# Salir de MySQL
exit

# Importar schema y seed
mysql -u root -p adopcion_mascotas < database/schema.sql
mysql -u root -p adopcion_mascotas < database/seed.sql
```

**Opción B: Usando Sequelize sync**

El backend sincroniza los modelos automáticamente al iniciar (`server.js`). Solo necesitas crear la base de datos vacía.

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS adopcion_mascotas CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;"
```

> **Importante**: `sequelize.sync()` no crea migraciones. En producción, se recomienda deshabilitar sync y usar scripts SQL controlados.

### 2.3 Configurar variables de entorno (Backend)

```bash
cd backend-adopcion-de-mascotas
cp .env.example .env
```

Editar `.env` con tus datos locales:

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_NAME=adopcion_mascotas
DB_USER=root
DB_PASSWORD=admin

JWT_SECRET=<generar con: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">
JWT_EXPIRES=1d

FRONTEND_URL=http://localhost:8080

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=adoptame.noreply@gmail.com
SMTP_PASS=<app-password>
SMTP_FROM="AdoptaMe <adoptame.noreply@gmail.com>"

LOG_LEVEL=info
```

### 2.4 Configurar variables de entorno (Frontend)

```bash
cd fronted-adopcion-de-mascotas
cp .env.example .env
```

Editar `.env`:

```env
VITE_API_URL=http://localhost:3000/api
```

### 2.5 Instalar dependencias

```bash
# Backend
cd backend-adopcion-de-mascotas
npm install

# Frontend
cd fronted-adopcion-de-mascotas
npm install
```

### 2.6 Iniciar el proyecto

**Terminal 1 — Backend:**

```bash
cd backend-adopcion-de-mascotas
npm run dev
```

El servidor iniciará en `http://localhost:3000`. Verás:
- `✅ Base de datos conectada`
- `✅ Modelo Rol sincronizado` (y todos los modelos)
- `🚀 Servidor ejecutándose en puerto 3000`

**Terminal 2 — Frontend:**

```bash
cd fronted-adopcion-de-mascotas
npm run dev
```

La aplicación abrirá en `http://localhost:8080`.

### 2.7 Verificar instalación

```bash
# Health check del backend
curl http://localhost:3000/health
# Respuesta esperada: {"status":"ok","db":"connected",...}

# Endpoint público
curl http://localhost:3000/
# Respuesta esperada: {"message":"API Adopción de Mascotas funcionando 🚀"}
```

---

## 3. Despliegue Gratuito

> ⚠️ **ADVERTENCIA**: Las siguientes secciones describen **plataformas recomendadas** para el despliegue.  
> **No se encontró configuración de estas plataformas en el código fuente del proyecto.**  
> Los pasos son una guía basada en la arquitectura del proyecto, no en configuraciones existentes.

### 3.1 Frontend — Vercel

Vercel es la mejor opción gratuita para el frontend React con Vite.

#### Pasos:

1. **Crear cuenta** en [vercel.com](https://vercel.com) (GitHub login)
2. **Importar repositorio** desde GitHub
3. **Configurar proyecto:**

| Configuración | Valor |
|---------------|-------|
| **Framework** | Vite |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |
| **Root Directory** | `fronted-adopcion-de-mascotas` |

4. **Variables de entorno en Vercel:**

| Variable | Valor |
|----------|-------|
| `VITE_API_URL` | `https://<tu-backend>.railway.app/api` (o la URL de tu backend) |

5. **Deploy**: Vercel detecta automáticamente los pushes a `main`.

> **Nota**: Vercel es gratuito para proyectos personales con 100 GB de ancho de banda/mes y builds ilimitados.

### 3.2 Backend — Railway

> ⚠️ **RECOMENDACIÓN FUTURA**: Railway no está configurado en el proyecto actual.

Railway es la mejor opción gratuita para el backend Node.js con MySQL.

#### Justificación de la elección:

| Plataforma | Pros | Contras |
|------------|------|---------|
| **Railway** ✅ | MySQL nativo gratuito, despliegue simple, dominio .railway.app, 500h/mes gratis | Límite de proyectos |
| **Render** | Gratuito, pero se duerme tras inactividad (lento al despertar) | Sin MySQL nativo gratuito |
| **Fly.io** | Bueno pero requiere tarjeta de crédito | Más complejo |
| **Cyclic.sh** | Gratuito pero limitado | Sin MySQL |

Railway ofrece MySQL como servicio integrado y el backend Node.js se despliega con un solo comando.

#### Pasos:

1. **Crear cuenta** en [railway.app](https://railway.app) (GitHub login)
2. **Crear nuevo proyecto** → "Deploy from GitHub repo"
3. **Seleccionar** el directorio `backend-adopcion-de-mascotas`
4. **Agregar MySQL** → "New" → "Database" → "MySQL"
5. **Configurar variables de entorno** en Railway:

```
NODE_ENV=production
PORT=3000
DB_HOST=<railway-provided-mysql-host>
DB_PORT=3306
DB_NAME=railway
DB_USER=<railway-provided-user>
DB_PASSWORD=<railway-provided-password>
JWT_SECRET=<generar con crypto>
JWT_EXPIRES=1d
FRONTEND_URL=https://<tu-frontend>.vercel.app
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=adoptame.noreply@gmail.com
SMTP_PASS=<app-password>
SMTP_FROM="AdoptaMe <adoptame.noreply@gmail.com>"
LOG_LEVEL=info
```

6. **Build Command** (Railway lo detecta automáticamente): `npm ci --only=production`

7. **Start Command**: `node src/server.js`

8. **Importar schema.sql**: Conéctate al MySQL de Railway desde tu MySQL Workbench o consola:

```bash
mysql -h <railway-host> -u <user> -p<password> --ssl-mode=REQUIRED railway < database/schema.sql
mysql -h <railway-host> -u <user> -p<password> --ssl-mode=REQUIRED railway < database/seed.sql
```

> **Alternativa gratuita**: También puedes usar **Aiven** para MySQL gratuito (hasta 5GB) y conectar Railway backend a Aiven MySQL.

### 3.3 Base de Datos — Opciones Gratuitas

| Plataforma | Capa Gratuita | Configuración |
|------------|---------------|---------------|
| **Railway MySQL** ✅ | 1GB storage, 100 conexiones | Integrado directamente con Railway |
| **Aiven MySQL** | 5GB, hasta 3 servicios gratis | SSL requerido, conexión externa |
| **PlanetScale** | 1GB storage, 1 billion row reads/mes | Sin foreign keys (diferente a MySQL tradicional) |
| **TiDB Serverless** | Gratuito, compatible MySQL | Limitado en throughput |

**Recomendación**: Usar **Railway MySQL** si el backend también está en Railway. Si no, **Aiven** es la mejor alternativa gratuita standalone.

### 3.4 Configuración Nginx (Docker)

Si despliegas con Docker, el `nginx.conf` ya está configurado para:

```nginx
# Sirve archivos estáticos del frontend
location / {
    try_files $uri $uri/ /index.html;
}

# Proxy reverso al backend
location /api/ {
    proxy_pass http://backend:3000/api/;
}

# Proxy reverso para uploads
location /uploads/ {
    proxy_pass http://backend:3000/uploads/;
}
```

---

## 4. Variables de Entorno

### Backend (`backend-adopcion-de-mascotas/.env`)

| Variable | Descripción | Obligatoria | Valor por defecto |
|----------|-------------|-------------|-------------------|
| `PORT` | Puerto del servidor Express | Sí | `3000` |
| `NODE_ENV` | Entorno (development/production) | Sí | `development` |
| `DB_HOST` | Host de MySQL | Sí | `localhost` |
| `DB_PORT` | Puerto de MySQL | Sí | `3306` |
| `DB_NAME` | Nombre de la base de datos | Sí | `adopcion_mascotas` |
| `DB_USER` | Usuario MySQL | Sí | `root` |
| `DB_PASSWORD` | Contraseña MySQL | Sí | — |
| `JWT_SECRET` | Clave secreta para firmar JWT | Sí | — |
| `JWT_EXPIRES` | Tiempo de expiración del JWT | Sí | `1d` |
| `FRONTEND_URL` | URL del frontend (CORS y enlaces email) | Sí | `http://localhost:8080` |
| `SMTP_HOST` | Host del servidor SMTP | Sí | `smtp.gmail.com` |
| `SMTP_PORT` | Puerto SMTP | Sí | `587` |
| `SMTP_SECURE` | Usar TLS (true/false) | Sí | `false` |
| `SMTP_USER` | Usuario SMTP (email completo) | Sí | — |
| `SMTP_PASS` | Contraseña o App Password SMTP | Sí | — |
| `SMTP_FROM` | Dirección remitente en correos | Sí | — |
| `LOG_LEVEL` | Nivel de logging (debug/info/warn/error) | No | `info` |

### Frontend (`fronted-adopcion-de-mascotas/.env`)

| Variable | Descripción | Obligatoria | Valor por defecto |
|----------|-------------|-------------|-------------------|
| `VITE_API_URL` | URL base de la API backend | Sí | `http://localhost:3000/api` |

---

## 5. Problemas Comunes

### 5.1 CORS

**Síntoma**: El frontend no puede hacer peticiones al backend. Error en consola del navegador: `has been blocked by CORS policy`.

**Causa**: El `FRONTEND_URL` en backend `.env` no coincide con la URL desde la que se sirve el frontend.

**Solución**:
```env
# En backend .env
FRONTEND_URL=http://localhost:8080
# O la URL de Vercel/dominio personalizado
FRONTEND_URL=https://love-rescue.vercel.app
```

**Código relevante** (`app.js:37-54`): El backend tiene una whitelist de orígenes permitidos:
```js
const allowedOrigins = [
    'http://localhost:8080',
    'http://localhost:3000',
    process.env.FRONTEND_URL
].filter(Boolean);
```

### 5.2 Variables de entorno faltantes

**Síntoma**: Error `Cannot read properties of undefined (reading 'JWT_SECRET')` o similar.

**Solución**: Verificar que `.env` existe y tiene todas las variables listadas en la sección 4.

```bash
# Verificar que .env existe
ls -la backend-adopcion-de-mascotas/.env

# Verificar contenido
cat backend-adopcion-de-mascotas/.env
```

### 5.3 Conexión MySQL

**Síntoma**: `❌ Error: connect ECONNREFUSED 127.0.0.1:3306` o `SequelizeConnectionError`.

**Causas comunes**:
1. MySQL no está corriendo
2. Credenciales incorrectas en `.env`
3. Puerto incorrecto
4. MySQL no acepta conexiones TCP (solo socket)

**Soluciones**:

```bash
# Verificar que MySQL está corriendo
# Windows:
net start | findstr MySQL

# Linux/Mac:
sudo systemctl status mysql

# Verificar conexión directa
mysql -u root -p -h localhost -P 3306 -e "SELECT 1"
```

### 5.4 JWT

**Síntoma**: Error `Token inválido` o `jwt malformed`.

**Causas**:
1. Token expirado
2. `JWT_SECRET` diferente entre sesiones
3. Token manipulado

**Solución**: El frontend maneja refresh automático en `client.ts`. Si el problema persiste:

```bash
# Generar nuevo JWT_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Código relevante**: El backend solo acepta algoritmo HS256:
```js
// auth.middleware.js
const payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
```

### 5.5 Deploy Vercel — Rutas no encontradas

**Síntoma**: Error 404 al recargar una ruta que no es `/`.

**Solución**: Vercel con Vite maneja SPA automáticamente, pero si usas configuración manual, asegúrate de que el `vercel.json` incluya:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

> **Nota**: No se encontró `vercel.json` en el proyecto. Si aparece error 404 en rutas como `/favoritos` o `/perfil`, agrega el archivo.

### 5.6 Deploy Railway — Backend no inicia

**Síntoma**: Railway muestra errores de inicio.

**Soluciones**:
1. Verificar que el `start` script en `package.json` es `node src/server.js`
2. Asegurar que `NODE_ENV=production`
3. Railway asigna el puerto automáticamente via `PORT`, no hardcodear
4. Conectar MySQL de Railway (crear servicio de base de datos)

---

## 6. Checklist de Producción

Antes de liberar a producción, verificar:

### Base de Datos
- [ ] MySQL 8.0 está corriendo y accesible
- [ ] Schema importado correctamente
- [ ] Seed data cargada (opcional)
- [ ] Usuarios y contraseñas de DB seguros
- [ ] Conexión SSL configurada (si es remoto)

### Backend
- [ ] `NODE_ENV=production`
- [ ] `JWT_SECRET` generado con crypto (64 bytes hex)
- [ ] `JWT_SECRET` no está hardcodeado ni en el código fuente
- [ ] `FRONTEND_URL` apunta a la URL real de producción
- [ ] CORS configurado correctamente
- [ ] Helmet security headers activos
- [ ] Rate limiting configurado
- [ ] Winston logging activo (archivos rotativos)
- [ ] PM2 configurado (cluster mode, max restarts)
- [ ] Sin sync() de Sequelize en producción (deshabilitar `alter`/`force`)
- [ ] Puerto dinámico (process.env.PORT)

### Frontend
- [ ] `VITE_API_URL` apunta al backend de producción
- [ ] Build exitoso: `npm run build` genera `dist/`
- [ ] Rutas SPA funcionan (sin 404 en recarga)
- [ ] Variables de entorno en Vercel configuradas
- [ ] Modo oscuro/claro funciona
- [ ] Imágenes se cargan correctamente

### Docker
- [ ] Backend Dockerfile: multi-stage, usuario no-root, puerto 3000
- [ ] Frontend Dockerfile: nginx alpine, proxy reverso configurado
- [ ] .dockerignore excluye node_modules, .env, logs
- [ ] nginx.conf redirige /api/ y /uploads/ al backend

### Seguridad
- [ ] Contraseñas hasheadas con bcrypt (salt rounds ≥ 10)
- [ ] JWT con algoritmo HS256 y expiración ≤ 1 día
- [ ] Refresh tokens rotados en cada uso
- [ ] Rate limiting activo (login: 5/15min, API: 500/15min)
- [ ] Helmet: XSS, noSniff, hidePoweredBy, HSTS en producción
- [ ] CORS solo orígenes permitidos
- [ ] No hay credenciales en el código fuente
- [ ] `EMAIL_NOT_VERIFIED` bloquea login
- [ ] Validación Zod en todos los endpoints críticos

### Monitoreo
- [ ] Health endpoint (`/health`) responde ok
- [ ] Logs de error se escriben
- [ ] PM2 monit: memoria, CPU, restarts

### Email
- [ ] SMTP configurado correctamente
- [ ] Verificación de email funciona
- [ ] Recuperación de contraseña funciona
- [ ] Notificaciones de solicitudes funcionan
- [ ] App Password de Gmail configurado (no contraseña normal)

### Pruebas finales
- [ ] Registro de nuevo usuario
- [ ] Verificación de email
- [ ] Login
- [ ] Creación de fundación (rol FUNDACION)
- [ ] Publicación de mascota
- [ ] Búsqueda y filtros de mascotas
- [ ] Solicitud de adopción (rol ADOPTANTE)
- [ ] Flujo completo: Pendiente → Evaluación → Aprobada → Contrato → Adoptada
- [ ] Subida y revisión de documentos
- [ ] Agenda y confirmación de citas
- [ ] Seguimiento post-adopción
- [ ] Notificaciones
- [ ] Reportes (admin)
- [ ] Reportes Excel descargables

---

## 7. Matriz de Trazabilidad — Manual de Despliegue

| Sección | Afirmación | Archivo fuente | Evidencia |
|---------|-----------|---------------|-----------|
| §1 Requisitos | Node.js 20+ | `backend/Dockerfile` línea 1 | `FROM node:20-alpine` |
| §1 Requisitos | MySQL 8.0 | `database/schema.sql` línea 5 | `Server version 8.0.46` |
| §2 Instalación | Base de datos `adopcion_mascotas` | `backend/.env` línea 5 | `DB_NAME=adopcion_mascotas` |
| §2 Instalación | Script schema.sql | `database/schema.sql` | Dump completo de 18 tablas |
| §2 Instalación | Script seed.sql | `database/seed.sql` | Datos de ejemplo |
| §2 Instalación | Sequelize sync | `backend/src/server.js` líneas 37-85 | `await Rol.sync()`, `await User.sync()`, etc. |
| §2 Instalación | Puerto backend 3000 | `backend/.env` línea 1 | `PORT=3000` |
| §2 Instalación | Puerto frontend 8080 | `fronted/vite.config.ts` línea 12 | `port: 8080` |
| §2 Verificación | Health endpoint | `backend/src/app.js` líneas 166-187 | `app.get('/health', ...)` |
| §3.4 Nginx | Proxy /api/ y /uploads/ | `fronted/nginx.conf` líneas 9-23 | `proxy_pass http://backend:3000/api/` |
| §4 Variables Backend | 17 variables | `backend/.env.example` líneas 1-31 | `.env.example` completo |
| §4 Variables Frontend | 1 variable | `fronted/.env.example` línea 1 | `VITE_API_URL=http://localhost:3000/api` |
| §5.1 CORS | Orígenes permitidos | `backend/src/app.js` líneas 37-54 | `allowedOrigins = ['http://localhost:8080', 'http://localhost:3000', process.env.FRONTEND_URL]` |
| §5.4 JWT | Algoritmo HS256 | `backend/src/utils/jwt.js` línea 16 | `algorithm: 'HS256'` |
| §5.4 JWT | Refresh token | `backend/src/modules/auth/services/auth.service.js` | `refreshToken = crypto.randomBytes(32).toString('hex')` |
| — Verificación email | `server.js` | `backend/src/server.js` línea 31 | `await sequelize.authenticate()` |
| — Mensajes de logs | `server.js` | `backend/src/server.js` líneas 33, 88 | `Base de datos conectada`, `Servidor ejecutándose en puerto ${PORT}` |

### Leyenda

| Símbolo | Significado |
|---------|-------------|
| ✓ | Información confirmada en el código fuente |
| ❌ | No encontrado en el código fuente |
| ⚠️ | Recomendación futura, no implementada actualmente |

### Elementos no encontrados en el código

| Elemento | Estado |
|----------|--------|
| `docker-compose.yml` | ❌ No existe |
| `vercel.json` | ❌ No existe |
| `railway.json` o `Dockerfile.railway` | ❌ No existe |
| `.github/workflows/*` (CI/CD) | ❌ No existe |
| Configuración de Render / Fly.io | ❌ No existe |
| Sistema de migraciones (ej. Sequelize CLI) | ❌ No existe |
| `.nvmrc` o `engines` en package.json | ❌ No existe |

---

> **Nota**: Este manual fue generado a partir del análisis exhaustivo del código fuente del proyecto Love Rescue E196 Blanco.  
> Las URLs de servicios externos (Vercel, Railway) son **recomendaciones futuras**, no configuraciones existentes en el proyecto.  
> No se encontró configuración específica de estas plataformas en el código.  
> Ver `docs/diagramas/devops-actual.png` y `docs/diagramas/devops-recomendado.png` para los diagramas correspondientes.
