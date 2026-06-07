# Guía de Instalación Paso a Paso

## Prerequisitos

- **Node.js** v18+ → https://nodejs.org
- **MySQL** 8.0+ → https://dev.mysql.com/downloads/
- **Git** → https://git-scm.com
- **Clave API de Google Gemini** → https://aistudio.google.com/app/apikey

---

## Instalación Local (Sin Docker)

### 1. Clonar el repositorio

```bash
git clone <URL-DEL-REPO>
cd MarsPy
```

### 2. Configurar MySQL

Crea la base de datos:

```sql
CREATE DATABASE marspy CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'marspy'@'localhost' IDENTIFIED BY 'tu_password';
GRANT ALL PRIVILEGES ON marspy.* TO 'marspy'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Instalar y configurar el Backend

```bash
cd backend
npm install
```

Crea el archivo `.env`:
```bash
cp .env.example .env
```

Edita `backend/.env`:
```env
PORT=3001
DB_HOST=localhost
DB_PORT=3306
DB_NAME=marspy
DB_USER=marspy
DB_PASSWORD=tu_password
JWT_SECRET=cambia_esto_en_produccion
NODE_ENV=development
```

Ejecuta las migraciones y el seeder:
Las migraciones hace que el modelo definido en Typescript se sincronize con las tablas en la base de datos, algo que hace
el ORM Sequelize elegido automáticamente.
El seeder crea los registros iniciales en la base de datos para tener un juego cargado. Ese juego se ha definido en el fichero 
src/seeders/seed.ts
```bash
npm run db:migrate
npm run db:seed
```

Inicia el servidor:
```bash
npm run dev
```

Verifica: http://localhost:3001/api/health → `{"status":"ok"}`

### 4. Instalar y configurar el Frontend

```bash
cd ../frontend
npm install
```

Crea el archivo `.env`:
```bash
cp .env.example .env
```

Edita `frontend/.env` (por velocidad recomendamos usar modelos ligeros como el gemini-1.5-flash):
```env
VITE_API_URL=http://localhost:3001/api
VITE_GEMINI_API_KEY=AIza...TU_CLAVE_REAL_AQUI
VITE_GEMINI_MODEL=gemini-1.5-flash
```

Inicia el frontend:
```bash
npm run dev
```

Abre: http://localhost:5173

---

## Instalación con Docker Compose

```bash
# Copia y edita el .env de cada parte (ver arriba)
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# Edita ambos archivos...

# Arranca todo
docker-compose up -d

# Ejecuta las migraciones desde el entorno de producción.
docker exec marspy-backend npm run db:migrate:prod
docker exec marspy-backend npm run db:seed:prod
```

Abre: http://localhost:5173

---

## Añadir Imágenes de Fondo y Badges

Coloca tus imágenes en:
- `backend/assets/backgrounds/` — Fondos de cada nivel (1920x1080 recomendado)
- `backend/assets/badges/` — Insignias (128x128 PNG con transparencia)

Los nombres de archivo deben coincidir con los configurados en la BD.
Ver `backend/assets/README.md` para la lista completa.

Si no se tienen insignias badges generadas, se pueden generar unas básicas automaticamente con este script
que generará ficheros de imágenes vectoriales svg:
```bash
node scripts/generate-placeholders.js
```
Luego actualiza las rutas en el seeder para usar `.svg` en vez de `.png`.

---

## Añadir o Modificar Niveles

Edita `backend/src/seeders/seed.ts` y añade objetos al array `levels`:

```typescript
{
  levelNumber: 6,           // Número único del nivel
  title: 'Mi Nuevo Nivel',
  scenarioDescription: `## Descripción con **markdown**`,
  initialCode: `# Código inicial\nprint("hello")`,
  backgroundImage: '/backgrounds/Nivel6_ejemplo.jpg',
  aiPromptTemplate: `Eres HAL... HISTORIAL: {{HISTORY}} ...`,  // Usa {{HISTORY}} y {{ATTEMPT_NUMBER}}
  isLast: false,            // Si se trata del último nivel, y una vez superado el juego termina.
  threshold: 14,            // Puntuación mínima para ir al nivel "alto"
  nextLevelIfPass: 8,       // Si score >= threshold
  nextLevelIfFail: 7,       // Si score < threshold
  badgeThresholdImage: '/badges/Insignia_n6_excelente.png', // Insignia ganada al pasar el nivel con puntos por encima del umbral
  badgeThresholdName: 'Mi Insignia Excelente', // Nombre de la insignia por superar por encima del umbral el nivel
  badgeCompletionImage: '/badges/Insignia_n6.png', // Insignia ganada al completar el nivel
  badgeCompletionName: 'Mi Insignia', // Nombre de la insignia ganada al completar el nivel
}
```

Vuelve a ejecutar el seeder:
```bash
npm run db:seed
```

---

## Ejemplo básico de la estructura del Árbol de Niveles

```
Nivel 0 (Intro)
    └── Nivel 1 (Bucle for)
           ├── Score ≥ 12 → Nivel 3 (Funciones, más difícil)
           └── Score < 12 → Nivel 2 (Corrección, más fácil)
                    └── Nivel 4 (en ambos casos)
                           └── Nivel 5 (Final)
                                  └── Nivel 200 (Victoria)
```

---

## Variables de Entorno - Referencia Completa

### Backend

| Variable | Descripción | Defecto |
|----------|-------------|---------|
| `PORT` | Puerto del servidor | `3001` |
| `DB_HOST` | Host MySQL | `localhost` |
| `DB_PORT` | Puerto MySQL | `3306` |
| `DB_NAME` | Nombre de la BD | `marspy` |
| `DB_USER` | Usuario MySQL | `root` |
| `DB_PASSWORD` | Contraseña MySQL | — |
| `JWT_SECRET` | Clave JWT (no usada aún, futura auth) | — |
| `NODE_ENV` | Entorno | `development` |
| `FRONTEND_URL` | URL del frontend para CORS | `*` |
| `GEMINI_API_KEY` | API Key de las llamadas a Gemini AI | `API Key` |
| `GEMINI_MODEL`| Modelo a usar. | `gemini-3-flash-preview`|

### Frontend

| Variable | Descripción |
|----------|-------------|
| `VITE_API_URL` | URL base de la API backend |
| `VITE_ACCESS_PASSWORD`| Password basica de acceso al juego. | `tu_password_basica_de_acceso`|

---

## Solución de Problemas

**Error: "Cannot connect to database"**
→ Verifica que MySQL esté corriendo y las credenciales en `.env` sean correctas.

**Error: "VITE_GEMINI_API_KEY not configured"**
→ Añade tu clave real de Gemini en `frontend/.env` y reinicia el servidor de desarrollo.

**Python no ejecuta (Skulpt no disponible)**
→ Skulpt se carga desde Internet, desde un CDN. Verifica tu conexión a internet o que `index.html` tenga los scripts de Skulpt.

**Error 404 en `/api/levels/0`**
→ Ejecuta `npm run db:seed` en el backend para cargar los niveles iniciales.

**Los badges no se muestran**
→ Añade imágenes a `backend/assets/badges/` con los nombres correctos (ver README).
