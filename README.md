# Firestore MyAdmin

[![CI](https://github.com/manufosela/firestore-myadmin/actions/workflows/ci.yml/badge.svg)](https://github.com/manufosela/firestore-myadmin/actions/workflows/ci.yml)

Gestor genérico, configurable y transversal para múltiples bases de datos Firestore, al estilo PHPMyAdmin.

## Descripción

Permite configurar y gestionar diferentes proyectos Firestore desde una única interfaz centralizada. Incluye sistema de autenticación con grupos/roles y permisos granulares.

## Funcionalidades principales

- Visualización de colecciones y documentos
- CRUD completo de documentos
- Backups de colecciones individuales o BBDD completa
- Restauración de datos
- Panel de administración de usuarios y permisos
- Gestión multi-Firestore con conexiones configurables

## Tech Stack

- **Lit** + Web Components
- **Vite** como bundler
- **Firebase** (Auth, Firestore)

## Scripts

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build de producción
npm run preview  # Preview del build
npm run test     # Ejecutar tests
npm run lint     # Linting
npm run format   # Formateo de código
```

## Estructura del proyecto

```
src/
├── components/   # Web Components (Lit)
├── pages/        # Componentes de página
├── services/     # Servicios (Firebase, API)
├── models/       # Interfaces y tipos
├── utils/        # Utilidades
└── styles/       # Estilos globales y compartidos
test/             # Tests
public/           # Archivos estáticos
```
