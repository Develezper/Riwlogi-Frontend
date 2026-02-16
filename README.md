# Riwlog Frontend

Frontend SPA para retos de algoritmia por etapas.

## Runtime
- `bun` (no npm)
- Vite + Vanilla JS (ES modules)
- Tailwind CSS v4
- CodeMirror 6

## Estructura profesional (modular)
- `src/app`: bootstrap y router.
- `src/features/auth`: login/register.
- `src/features/problems`: listado, solver, componentes y tracker del editor.
- `src/features/leaderboard`: vista de ranking.
- `src/features/profile`: vista de perfil.
- `src/shared/ui`: UI transversal (navbar).
- `src/shared/state`: estado global de sesión.
- `src/shared/services/api`: contrato, proveedor remoto, proveedor local y selector de proveedor.
- `src/shared/services/problem-repository.js`: catálogo local de problemas.
- `src/shared/utils`: utilidades de UI/markdown.
- `src/shared/styles`: estilos globales.

## Modos de API
Variables en `.env`:
- `VITE_API_MODE=local`: solo proveedor local.
- `VITE_API_MODE=hybrid`: intenta backend al iniciar, si no responde usa local.
- `VITE_API_MODE=remote`: exige backend remoto; si falla, no inicia.
- `VITE_API_BASE=/api`: base URL del backend.

Contrato backend: `docs/api-contract.md`.

## Seguridad
- Sanitización robusta de markdown.
- Bloqueo de URLs inseguras (`javascript:`).
- Sesiones con expiración y validación estricta de token/usuario.

## Accesibilidad
- Skip link a contenido principal.
- `aria-*` en navbar móvil, tabs y filtros.
- Live regions en toasts/resultados.
- `focus-visible` consistente.
- Soporte a `prefers-reduced-motion`.

## Comandos con Bun
```bash
bun install
bun run dev
bun run lint
bun run test
bun run test:e2e
bun run build
```

## CI
Pipeline: `.github/workflows/ci.yml` con Bun + lint + unit + e2e + build.
