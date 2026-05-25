# Mantenimiento Casa

Aplicación web para gestionar el mantenimiento y refacción del hogar.

**Stack:** React + Vite · Firebase Firestore (tiempo real) · Firebase Storage · GitHub Pages

---

## Setup rápido

### 1. Clonar el repo

```bash
git clone https://github.com/TU_USUARIO/mantenimiento-casa.git
cd mantenimiento-casa
```

### 2. Cargar credenciales Firebase

Editá `src/config/firebase.js` y reemplazá los placeholders con los valores de tu proyecto Firebase:

```js
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_AUTH_DOMAIN",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_STORAGE_BUCKET",
  messagingSenderId: "TU_MESSAGING_SENDER_ID",
  appId: "TU_APP_ID"
}
```

> Creá el proyecto en [Firebase Console](https://console.firebase.google.com), habilitá **Firestore** y **Storage** en modo test.

### 3. Configurar usuarios

Editá `src/config/users.js` con los nombres reales:

```js
export const USERS = ["Juan", "María", "Pedro", "Ana", "Luis"]
```

### 4. Instalar dependencias y correr en local

```bash
npm install
npm run dev
```

Abrí [http://localhost:5173/mantenimiento-casa/](http://localhost:5173/mantenimiento-casa/)

### 5. Deploy a GitHub Pages

```bash
npm run deploy
```

Asegurate de tener `gh-pages` instalado y el repositorio de GitHub configurado como origin.

---

## Vistas

| Ruta | Descripción |
|------|-------------|
| `/` | Dashboard con resumen de presupuesto y tareas urgentes |
| `/tareas` | Lista/Kanban de tareas con filtros |
| `/calendario` | Vista mensual de tareas por fecha |
| `/presupuesto` | Análisis de costos, gráficos y modo "qué puedo hacer hoy" |
| `/config` | Gestión de zonas y configuración de alertas |

## Estructura de datos (Firestore)

- **`tareas`** — documentos de cada tarea con materiales, costos, fotos y estado
- **`actividad`** — historial de acciones por usuario
- **`config/presupuesto`** — presupuesto total y umbral de alerta
- **`config/zonas`** — lista de zonas configurables
