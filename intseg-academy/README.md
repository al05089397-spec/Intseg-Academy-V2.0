# IntSeg Academy 🛡️

Plataforma LMS Web para Capacitación de Seguridad Privada — Grupo IntSeg

## Descripción

IntSeg Academy es una aplicación web tipo LMS (Learning Management System) desarrollada para gestionar la capacitación continua de más de 500 guardias de seguridad privada de Grupo IntSeg. Permite acceder a cursos, evaluaciones y documentos de capacitación desde cualquier dispositivo móvil o de escritorio.

## Tecnologías

- HTML5
- CSS3 (diseño mobile-first responsivo)
- JavaScript (vanilla)

## Estructura del Proyecto

```
intseg-academy/
├── index.html          # Pantalla de Login
├── pages/
│   ├── catalogo.html   # Catálogo de cursos (vista alumno)
│   ├── detalle.html    # Detalle de un curso
│   └── admin.html      # Dashboard administrador
├── css/
│   └── styles.css      # Estilos globales
├── js/
│   └── app.js          # Lógica principal
└── assets/             # Imágenes y recursos
```

## Módulos del Sistema

| Módulo | Descripción |
|--------|-------------|
| Autenticación | Login con roles: guardia / admin / maestro |
| Cursos | Catálogo, detalle y progreso por usuario |
| Evaluaciones | Exámenes con calificación automática |
| Documentos | Repositorio de manuales operativos |
| Reportes | Seguimiento de cumplimiento por guardia |

## Actores del Sistema

- **Guardia de seguridad (Alumno):** accede a cursos, realiza evaluaciones, consulta documentos
- **Administrador / Capacitador:** gestiona contenido, usuarios y reportes
- **Maestro / Instructor:** crea evaluaciones y califica

## Certificaciones que Cubre

- DC3 — Competencias Laborales
- ISO 28001 — Seguridad en Cadena de Suministro
- OEA — Operador Económico Autorizado
- Antilavado de Dinero (requisito legal)

## Metodología

Desarrollo ágil con **Scrum** — sprints de 1-2 semanas con entregables incrementales.

## Seguridad

- Autenticación con JWT
- Control de acceso basado en roles (RBAC)
- Contraseñas hasheadas con bcrypt
- Validaciones contra OWASP Top 10

## Equipo

Proyecto desarrollado para la materia **Ingeniería de Software** — TecMilenio 2026
