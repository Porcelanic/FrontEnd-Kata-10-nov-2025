# Sistema de Gestión de Solicitudes

> **Proyecto desarrollado como prueba técnica**

Este proyecto es una aplicación web moderna para la gestión de solicitudes de despliegue y acceso, desarrollada con Next.js y TypeScript como parte de una evaluación técnica.

## Descripción

Sistema de gestión que permite a los usuarios crear y gestionar solicitudes de dos tipos:

- **Solicitudes de Despliegue**: Incluyen enlaces a Pull Requests, documentación y tableros Jira
- **Solicitudes de Acceso**: Para gestionar permisos y roles en aplicaciones

La aplicación cuenta con diferentes roles de usuario (Solicitante y Aprobador) con funcionalidades específicas para cada uno.

## Tecnologías Utilizadas

### Frontend

- **[Next.js 16.0.0](https://nextjs.org/)** - Framework de React para aplicaciones web
- **[React 18.3.1](https://react.dev/)** - Biblioteca de UI
- **[TypeScript](https://www.typescriptlang.org/)** - Tipado estático para JavaScript
- **[Tailwind CSS 4.1.9](https://tailwindcss.com/)** - Framework de CSS utility-first
- **[Radix UI](https://www.radix-ui.com/)** - Componentes accesibles sin estilos

### Gestión de Formularios y Validación

- **[Formik](https://formik.org/)** - Manejo de formularios en React
- **[Yup](https://github.com/jquense/yup)** - Validación de esquemas
- **[React Hook Form](https://react-hook-form.com/)** - Alternativa para formularios

### UI/UX

- **[Lucide React](https://lucide.dev/)** - Iconos
- **[next-themes](https://github.com/pacocoursey/next-themes)** - Soporte para modo oscuro
- **[class-variance-authority](https://cva.style/)** - Variantes de componentes
- **[tailwind-merge](https://github.com/dcastil/tailwind-merge)** - Merge inteligente de clases Tailwind

### Otras Librerías

- **[date-fns](https://date-fns.org/)** - Manipulación de fechas
- **[recharts](https://recharts.org/)** - Gráficos y visualizaciones
- **[Sonner](https://sonner.emilkowal.ski/)** - Notificaciones toast

## Instalación y Configuración Local

### Prerequisitos

- Node.js 18+ instalado
- pnpm (recomendado) o npm

### Pasos para ejecutar localmente

1. **Clonar el repositorio**

```bash
git clone <url-del-repositorio>
cd FrontEnd-Kata-10-nov-2025
```

2. **Instalar dependencias**

```bash
# Con pnpm (recomendado)
pnpm install

# O con npm
npm install
```

3. **Configurar variables de entorno**

Crea un archivo `.env` en la raíz del proyecto (si no existe) con la siguiente configuración:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
# Para conectar con el backend de AWS (descomentar si está disponible):
# NEXT_PUBLIC_API_BASE_URL=
```

4. **Ejecutar el servidor de desarrollo**

```bash
# Con pnpm
pnpm dev

# O con npm
npm run dev
```

5. **Abrir en el navegador**

Visita (https://front-end-kata-10-nov-2025.vercel.app) para ver la aplicación.

## Scripts Disponibles

```bash
# Iniciar servidor de desarrollo
pnpm dev

# Compilar para producción
pnpm build

# Iniciar servidor de producción
pnpm start

# Ejecutar linter
pnpm lint
```

## Funcionalidades Principales

- Sistema de autenticación con roles (Solicitante/Aprobador)
- Creación de solicitudes de Despliegue y Acceso
- Validación de formularios con Yup y Formik
- Gestión de estado de solicitudes
- Interfaz responsive con modo oscuro
- Componentes accesibles con Radix UI
- Integración con API REST (AWS Lambda + API Gateway)

## Backend

El proyecto está diseñado para conectarse a un backend desplegado en AWS (API Gateway + Lambda).

## Notas Adicionales

- Este proyecto fue desarrollado como parte de una prueba técnica
- La aplicación utiliza el App Router de Next.js 16
- Incluye soporte completo para TypeScript
- Implementa mejores prácticas de React y Next.js

## Autor

**MGONZ85**

- GitHub: [@Porcelanic](https://github.com/Porcelanic)

---

## Licencia

ISC

---

## Agradecimientos

Desarrollado como parte de la Kata técnica del 10 de noviembre de 2025.
