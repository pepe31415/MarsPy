# MarsPy - Juego Educativo de Programación apoyado con IA
# Juego apoyado por IA para la enseñanza-aprendizaje de Python que es parte del contenido de 
# el Trabajo Fin de Titulación de el Master Universitario en Formación del Profesorado de Educación Secundaria Obligatoria y
# Bachillerato, Formación Profesional y Enseñanzas de Idiomas, titulado "Gamificación orientada por Inteligencia Artificial para
# la enseñanza básica de Python".
# Con la configuración inicial el juego está orientado a la ayuda para dar el salto de la programación por bloques a la programación
# textual a alumnos de 1º de Bachillerato (Asignatura de Ciencias de la computación I , en la Comunidad de Madrid)
# UNAM. Universidad del Atlántico Medio
# Autor: José María Castillo Lara
# 2026

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
GEMINI_API_KEY= -- Pon aqui tu API Key de las llamadas a Gemini AI --
GEMINI_MODEL=gemini-3-flash-preview
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:3001/api
VITE_ACCESS_PASSWORD=tu_password_basica_de_acceso
```

## Con Docker

```bash
docker-compose up -d
```

## Niveles y Configuración

Los niveles se configuran directamente en la base de datos. El seed inicial crea:
- **Nivel 0**: Pantalla introductoria. Bienvenida a la estación MarsPy y explicación de la mecánica del juego.
- **Nivel 1**: Sintaxis básica de Python, Variables y Tipos de Datos
- **Nivel 2**: Sintaxis básica de Python, Variables y Tipos de Datos
- **Nivel 3**: Estructuras de control condicionales (if/else)
- **Nivel 4**: Estructuras de control condicionales (if/else)
- **Nivel 5**: Estructuras de control iterativas (while y for)
- **Nivel 6**: Estructuras de control iterativas (while y for)
- **Nivel 7**: Estructuras de datos lineales (Listas)
- **Nivel 8**: Estructuras de datos lineales (Listas)
- **Nivel 9**: Modularidad, Funciones y Abstracción (Proyecto de Integración)
- **Nivel 200**: Pantalla de fin de juego. Reconocimiento de la labor y ceremonía de graduación.

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
