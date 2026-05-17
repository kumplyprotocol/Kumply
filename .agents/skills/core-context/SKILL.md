# KUMPLY — Global Instructions for AI Assistant (Core Context Skill)

> Este archivo fuerza a TODA IA (Claude, Cursor, Windsurf, Cline, Gemini) a leer la memoria del proyecto antes de actuar.
> Actualizado: 14 Mayo 2026

---

## 1. LECTURA OBLIGATORIA — Antes de escribir UNA sola línea de código

Siempre, al iniciar una nueva conversación o recibir una nueva tarea en este repositorio, DEBES obligatoriamente leer y asimilar el contenido completo de estos archivos:

1. **`CLAUDE.md`** — Arquitectura técnica, estructura del monorepo, variables de entorno, smart contracts, integración Sumsub, testing, CI/CD y convenciones de código.
2. **`claude_estrategico.md`** — Contexto estratégico del negocio, reglas del ecosistema Avalanche, modelo de negocio "Software-Only", y **TODOS los links oficiales de documentación de Avalanche**.

**NO asumas el estado del proyecto sin haber leído estos archivos.** Tu conocimiento previo puede estar obsoleto.

---

## 2. FUENTE DE VERDAD — Documentación Avalanche

Los enlaces al final de `claude_estrategico.md` contienen **TODA la documentación oficial e información verdadera sobre AVALANCHE®**. Son tu **ÚNICA fuente de verdad** para:

- APIs de Avalanche (C-Chain, P-Chain, X-Chain)
- Smart contracts en el ecosistema
- ICM (Interchain Messaging)
- AvaCloud / eERC
- Staking, validators, consensus
- Retro9000, Team1, Blizzard Fund

### ⚠ Regla anti-alucinación
Si tienes dudas sobre AVALANCHE, **NO inventes ni uses tu conocimiento base obsoleto**. En su lugar:
1. Busca el link relevante en `claude_estrategico.md`
2. Usa tus herramientas de web scraping / lectura de URLs para visitar la documentación oficial
3. Solo entonces propón una solución basada en información verificada

---

## 3. MANTENIMIENTO DE MEMORIA CONTINUO (CRÍTICO)

Al finalizar **cualquier tarea significativa**, es TU OBLIGACIÓN actualizar:

| Archivo | Actualizar cuando... |
|---------|---------------------|
| `CLAUDE.md` | Cambies arquitectura, dependencias, scripts, estructura de archivos, contratos, APIs, testing, o convenciones |
| `claude_estrategico.md` | Cambien las fechas clave, status del proyecto, links oficiales, o contexto estratégico |

### Ejemplos de "tarea significativa":
- Implementar un nuevo feature o página
- Agregar/remover una dependencia
- Refactorizar arquitectura
- Cambiar configuración de deployment
- Modificar un smart contract
- Agregar o modificar tests
- Cambiar variables de entorno

**Nunca dejes que el código se desincronice de esta documentación.** El próximo agente que lea estos archivos debe tener una imagen 100% exacta del estado del proyecto.

---

## 4. ESTADO ACTUAL DEL PROYECTO (Quick Reference)

| Métrica | Valor |
|---------|-------|
| **Tests** | 107 passing (60 contracts + 30 SDK + 17 API) |
| **Contratos** | AttestationStore + ComplianceGate en Fuji (chainId 43113) |
| **Páginas** | 9 (Home, Verify, Demo, Dashboard, Network, Tiers, Developers, Solutions, Legal) |
| **Stack** | Solidity 0.8.28 · Next.js 16 · React 19 · Express · Wagmi · Viem · pnpm workspaces |
| **i18n** | next-intl (en, es) |
| **CI/CD** | GitHub Actions (4 jobs) + Vercel + Railway |
| **Pendiente** | Configurar API keys de Sumsub para flujo KYC real |

---

## 5. REGLAS DE DESARROLLO

### Smart Contracts
- Natspec en TODA función pública
- Custom errors (no `require` con strings)
- Events en toda mutación de estado
- OpenZeppelin `AccessControl` + `Pausable`

### TypeScript / Node
- Strict mode siempre
- Zod para validación de input en API
- JSON estructurado para logging: `{ ts, level, event, ...data }`
- HMAC-SHA256 en webhooks — SIN bypass por environment

### Frontend (Next.js)
- `import { Link } from "@/i18n/routing"` — NUNCA `next/link` directamente
- Variables del browser: `NEXT_PUBLIC_*` en `apps/web/.env.local`
- Variables del servidor: sin prefijo, también en `apps/web/.env.local`
- Toda página usa `useTranslations()` de `next-intl`

### Testing
- `pnpm test` corre todo el monorepo
- Todo código nuevo debe incluir tests
- Contratos: Hardhat + Chai + ethers v6
- SDK / API: Vitest
- API: Supertest para HTTP assertions

---

## 6. ARCHIVOS DE REGLAS PARA OTROS AGENTES

Este skill se sincroniza con los siguientes archivos de reglas:
- `.cursorrules` — Cursor AI
- `.windsurfrules` — Windsurf AI
- `.clinerules` — Cline AI
- `apps/web/AGENTS.md` — Next.js agent rules
- `apps/web/CLAUDE.md` — Referencia a AGENTS.md

Todos deben mantener las mismas instrucciones core: leer `CLAUDE.md` y `claude_estrategico.md` antes de actuar.
