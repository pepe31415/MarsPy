# 🚀 MarsPy - Juego Educativo de Programación apoyado con IA

Un juego educativo tipo breakout donde cada nivel presenta un reto de programación en Python, evaluado por una IA (Gemini) como tutor socrático.

## Stack Tecnológico

- **Frontend**: Vue 3 + TypeScript + Vuetify 3 + Pinia
- **Backend**: Node.js + TypeScript + Express
- **Base de datos**: MySQL + Sequelize ORM
- **IA**: Google Gemini API
- **Python runtime**: Skulpt (en el navegador)

## Estructura del Proyecto

```
breakout-code-game/
├── backend/          # API REST con Express + TypeScript
├── frontend/         # Vue 3 + Vuetify SPA
├── docker-compose.yml
└── README.md
```

## Requisitos Previos

- Node.js >= 18
- MySQL >= 8.0
- Clave API de Google Gemini

## Instalación Rápida

### 1. Clonar y configurar variables de entorno

```bash
git clone <repo-url>
cd breakout-code-game
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
# Edita .env con tus credenciales
npm run db:migrate
npm run db:seed
npm run dev
```

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Edita .env con la URL del backend y tu clave Gemini
npm run dev
```

## Variables de Entorno

### Backend (`backend/.env`)

```env
PORT=3001
DB_HOST=localhost
DB_PORT=3306
DB_NAME=marspy
DB_USER=root
DB_PASSWORD=yourpassword
JWT_SECRET=your_jwt_secret
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:3001/api
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_GEMINI_MODEL=gemini-1.5-flash
```

## Con Docker

```bash
docker-compose up -d
```

## Niveles y Configuración

Los niveles se configuran directamente en la base de datos. El seed inicial crea:
- **Nivel 0**: Pantalla introductoria
- **Nivel 1**: Bucle `for` básico
- **Nivel 2**: Funciones simples  
- **Nivel 3**: Listas y condicionales
- **Nivel 200**: Pantalla de fin de juego

Puedes añadir más niveles editando `backend/src/seeders/seed.ts`.

## Sistema de Niveles (Árbol de Decisión)

Cada nivel tiene un `threshold` (1-20). Si la puntuación obtenida ≥ threshold, el jugador va al `nextLevelIfPass`. Si no, va al `nextLevelIfFail`. Esto crea un árbol adaptativo.

## API Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/players` | Crear/recuperar jugador |
| GET | `/api/players/:alias` | Estado del jugador |
| GET | `/api/levels/:id` | Datos de un nivel |
| POST | `/api/game/submit` | Enviar código para evaluación |
| GET | `/api/game/progress/:playerId` | Progreso del jugador |
| GET | `/api/game/badges/:playerId` | Insignias obtenidas |
