# PLAYBOOK-claude-antigravity-setup.md — cómo potenciar cada ventana/carpeta

**Este playbook ya existe como Skill real, no solo como archivo suelto:**
`.claude/skills/claude-antigravity-setup/SKILL.md`. Cualquier proyecto
nuevo en este workspace, o en cualquier otro, debería tener ese skill
copiado desde el arranque — no después de que el `CLAUDE.md` ya creció
demasiado. El skill es el checklist accionable y corto; este archivo es
la investigación completa detrás de cada paso.

Investigado 18-ago-2026, con fuentes reales citadas. Aplica a cualquier
proyecto en cualquier carpeta, no solo a los de Stellar — esto es
configuración de herramienta, no de blockchain.

> **Nota de esta copia (KUMPLY):** la cifra de "515 líneas" en §1 fue
> medida en el workspace de estrategia donde se escribió este playbook
> por primera vez (Stellar/RFP-1), no en KUMPLY ni en ningún otro
> proyecto — la versión de origen ya lo aclara explícitamente después de
> que una copia instalada hizo la suposición incorrecta. El `CLAUDE.md`
> real de KUMPLY tiene **340 líneas** (verificado con `wc -l` el
> 19-ago-2026, tras agregar la línea `@AGENTS.md`). Sigue por encima de
> la guía de ~200 líneas, así que la recomendación de §1 aplica igual,
> solo que con el número real de este repo, no el de otro.

---

## 1. Lo que ya tienes bien, y lo que hay que corregir ya

**Hallazgo real, verificado en el workspace de estrategia donde se
escribió este playbook (Stellar/RFP-1), no en general y no
automáticamente aplicable a cualquier copia:** `CLAUDE.md` tenía **515
líneas** ahí específicamente, ya recortado a 82 el mismo día. La guía
oficial de Anthropic dice que hay que mantenerlo bajo 200 — los modelos
siguen de forma confiable entre 150 y 200 instrucciones, y más allá de
eso el cumplimiento empieza a diluirse ("context rot"), justo porque
`CLAUDE.md` se carga completo en cada sesión nueva, sin excepción.
**En KUMPLY, el `CLAUDE.md` real mide 340 líneas** (verificado con
`wc -l` al instalar esta copia) — por encima del límite recomendado,
aunque no en el mismo grado que en el workspace original.

**Qué hacer con esto, sin perder información real:** no se trata de borrar
contenido, se trata de sacarlo de la carga automática. Todo lo que ya está
en `legal/`, `becas/`, `scf/`, etc. (después de la reorganización de hoy,
en el workspace original) puede vivir fuera de `CLAUDE.md` y solo
referenciarse por link — la sesión lo lee cuando de verdad lo necesita,
no en cada arranque. En KUMPLY, el equivalente son `docs/audits/`,
`LITEPAPER.md`, `docs/AI-USAGE.md`: ya viven fuera del `CLAUDE.md` y se
referencian por link, patrón que este archivo confirma como correcto.
`CLAUDE.md` debería quedarse con: las reglas duras que aplican siempre
(el límite público/privado, la regla de nomenclatura, el idioma), y un
mapa corto hacia todo lo demás — no el contenido completo de cada
decisión histórica.

## 2. Las piezas de Claude Code, qué hace cada una

| Pieza | Qué es | Se carga | Para qué sirve |
|---|---|---|---|
| **`CLAUDE.md`** | La "constitución" del proyecto | Completo, cada sesión | Reglas que aplican siempre, sin excepción |
| **Memoria externa** (`~/.claude/projects/.../memory/`) | Convención de este entorno específico, no un feature universal de todo Claude Code | Bajo demanda, indexado por `MEMORY.md` | Hechos que sobreviven a mover o borrar la carpeta del proyecto — la razón por la que vive fuera, no dentro |
| **Skills (`SKILL.md`)** | Carpeta con instrucciones + YAML frontmatter, opcionalmente con scripts/recursos | Bajo demanda, cuando la descripción hace match con la tarea | Un playbook que se activa solo cuando aplica, sin gastar contexto el resto del tiempo |
| **Hooks** | Scripts deterministas que corren en eventos (antes/después de una herramienta) | Siempre que el evento ocurra | Reglas que NO dependen de que el modelo las recuerde — no pueden alucinarse, se ejecutan sí o sí |
| **Subagentes** | Trabajadores aislados con su propio contexto | Bajo demanda | Tareas paralelas que no deben ensuciar el contexto principal |
| **`settings.json`** | Configuración del proyecto o global (`.claude/settings.json`, `~/.claude/settings.json`) | Al arrancar | Permisos, statusline, y el orden de precedencia entre config local/proyecto/global |

Fuente: [Claude Code Docs — best practices](https://code.claude.com/docs/en/best-practices),
[Claude Code Docs — Agent Skills](https://code.claude.com/docs/en/agent-sdk/skills).

## 3. Lo que este workspace todavía no usa, y podría ayudar

- **Hooks reales, no solo disciplina manual.** En KUMPLY, el chequeo de
  "sin em dash / sin marcas de escritura-IA" que se aplicó a mano en la
  auditoría de Avalanche (`docs/audits/avalanche-ecosystem-audit-2026-08-17.md`)
  podría ser un hook de `PostToolUse` que corre automático después de
  cada edición de archivo, en vez de acordarse de correrlo a mano antes
  de cada commit/submission.
- **Subagentes para investigación paralela real**, en vez de una sola
  sesión investigando todo en serie — útil cuando hay que revisar varios
  temas legales/técnicos independientes a la vez, como las rondas
  paralelas de la auditoría de AVAXSKILLS.
- **Slash commands propios**, para workflows que se repiten seguido en
  este repo — por ejemplo, uno que corra el ciclo completo de
  "verificar claim técnico contra el contrato real en Snowtrace antes de
  publicar" (ya se hizo a mano para el artículo del blog) sin tener que
  re-explicar el proceso cada vez.

## 4. Antigravity — la otra mitad, y dónde hay incertidumbre real

**Qué es, confirmado:** el IDE agéntico de Google, multi-modelo (Gemini,
Claude, GPT-OSS), donde Claude Code corre como plugin/motor dentro del IDE
— exactamente el setup que ya tienen. Versión reciente (marzo 2026):
1.20.6, soporte de MCP, sandboxing de terminal.

**El archivo de reglas de Antigravity es `AGENTS.md`, no `CLAUDE.md`.**
Se coloca en la raíz del proyecto, Antigravity lo lee automático desde la
versión 1.20.5. Está pensado como formato cruzado entre herramientas —
Antigravity, Cursor, y en teoría Claude Code.

**Aquí está la incertidumbre real, y te la digo honesta en vez de
inventar una respuesta segura: las fuentes de hoy se contradicen sobre si
Claude Code lee `AGENTS.md` de forma nativa.** Unas dicen que sí lo agregó
en algún momento de 2026, otras que a julio de 2026 todavía no, y que sigue
usando solo `CLAUDE.md`. No hay una respuesta única y confiable ahora
mismo — verificar la versión exacta de Claude Code instalada antes de
confiar en cualquiera de las dos afirmaciones.

**La solución que funciona sin importar cuál de las dos sea cierta:**
dentro de `CLAUDE.md`, usar el import real de Claude Code —
`@AGENTS.md` al inicio del archivo — para que `CLAUDE.md` jale el
contenido de `AGENTS.md` automáticamente. Así, sin importar si Claude Code
alguna vez lee `AGENTS.md` por su cuenta, siempre lo va a ver a través de
`CLAUDE.md`. Es la opción segura mencionada en la documentación oficial de
memoria de Anthropic para justo este caso. **En KUMPLY: ya instalado** —
`CLAUDE.md` empieza con `@AGENTS.md` seguido de `@claude_estrategico.md`.

## 5. Los Skills son compartidos, no son de una sola herramienta

**Antigravity tiene su propio sistema de Skills, agregado en su versión
1.14.2 — y usa exactamente el mismo formato**: una carpeta con un
`SKILL.md` con YAML frontmatter, más subcarpetas opcionales de scripts/
ejemplos/recursos. Es el mismo patrón que ya usa Claude Code
(`.claude/skills/<nombre>/SKILL.md`) — no es que uno lo haya copiado del
otro necesariamente, es que el formato se volvió un estándar de facto entre
herramientas de este tipo. Un skill bien escrito para Claude Code
probablemente funciona igual en Antigravity, sin cambios.

## 6. Límites de sesión, y qué pasa cuando se llega a ellos

**Ventana de contexto real, por plan:** 200,000 tokens en el plan
estándar; 1,000,000 de tokens en Max/Team/Enterprise, vía Opus 4.6.

**Qué pasa al acercarse al límite, sin que la sesión se rompa:** Claude
Code monitorea el uso continuamente. Al llegar a **~83.5% del total**, se
dispara la compactación automática — crea una versión resumida del
historial, preservando lo esencial (nombre de sesión, estado de plan mode,
configuración propia). Se reservan ~13,000 tokens aparte para que la
respuesta que se está generando en ese momento pueda terminar sin
cortarse a la mitad.

**Control manual, mejor que esperar al límite:** `/compact` resume el
historial y libera espacio real (de 10,000-20,000 tokens de conversación a
1,000-3,000). Mejor práctica: compactar después de terminar una sub-tarea
completa, no esperar a estar cerca del límite. `/clear` limpia del todo.
`/recap` (nuevo, abril 2026) da un resumen de dónde se quedó la sesión sin
tener que repasar toda la conversación — ahorra tokens específicamente al
retomar trabajo después de una pausa. Ver también `playbooks/continue.md`
para la diferencia entre `/recap` y `claude --continue`.

## 7. Reducir tokens y mejorar rendimiento — con números reales

- **Prompt caching, automático:** al reenviar el mismo prefijo de
  contexto, esa parte cuesta **10% del precio base** (90% de descuento).
  No hay que configurar nada, ya corre solo.
- **El costo real de un `CLAUDE.md` largo, en tokens, no solo en
  atención:** guardar el contexto del proyecto una sola vez en `CLAUDE.md`
  ahorra 500-2,000 tokens de setup repetido por sesión — pero un
  `CLAUDE.md` de 5,000 tokens cuesta esos 5,000 tokens **en cada turno**,
  antes de que se escriba una sola palabra de la tarea. Esto confirma con
  números el hallazgo de §1: un `CLAUDE.md` largo no es solo un riesgo de
  "se te olvida una regla", es un costo real que se paga una y otra vez.
- **Incluir solo los archivos que la tarea necesita**, no la carpeta
  completa: 60-80% menos tokens, misma calidad de resultado.
- **La palanca más grande de todas: qué modelo usas para qué tarea.** La
  mayoría deja todo en el modelo más caro incluso para trabajo que un
  modelo más económico resuelve igual de bien.
- Combinadas, estas prácticas recortan uso de tokens **40-60%** sin bajar
  la calidad del resultado.
- **Imágenes y capturas de pantalla, verificado 19-ago-2026:** el costo es
  `⌈ancho/28⌉ × ⌈alto/28⌉` tokens visuales — geométrico, no de peso de
  archivo. Una captura 1080p sin recortar cuesta 2691 tokens en el nivel
  de alta resolución (Claude 4.7+, incluye Sonnet 5 y Opus 5) contra 1560
  en el nivel estándar. Recortar al área relevante antes de pegar es la
  técnica de mayor impacto; comprimir el archivo no ahorra tokens y puede
  dañar la legibilidad. Cifras completas, límites de request y la
  interacción con prompt caching (agregar/quitar una imagen invalida el
  cache de mensajes) en `playbooks/images.md`.

## 8. La memoria persistente real, a nivel de API — más allá de `CLAUDE.md`

Esto es distinto de la memoria externa de este entorno (§2) — es un
mecanismo más general de Anthropic, disponible para cualquier agente
construido sobre la API de Claude, no solo Claude Code.

**Qué es:** la "memory tool", disponible en todos los modelos Claude 4 y
posteriores. Le da a Claude una interfaz tipo sistema de archivos — un
directorio `/memories` que puede crear, leer, actualizar y borrar por su
cuenta, persistiendo entre conversaciones sin tener que cargar todo en la
ventana de contexto cada vez.

**Dato real de rendimiento, no promesa de marketing:** en un benchmark
interno de Anthropic sobre una tarea de búsqueda web de 100 turnos,
combinar esta memoria con "context editing" dio **84% de ahorro en
tokens y 39% de mejora de rendimiento**. Caso real de uso: los agentes de
tareas largas de Rakuten usan esta memoria para no repetir errores
pasados, reportando **97% menos errores de primer intento**, dentro de
límites acotados por workspace.

**Por qué importa para este workspace:** el sistema de memoria externa que
ya usa esta sesión (`~/.claude/projects/.../memory/`, indexado por
`MEMORY.md`) sigue exactamente este mismo patrón — archivos que persisten
entre sesiones, consultados bajo demanda en vez de cargados siempre. No es
casualidad, es la misma arquitectura general de Anthropic aplicada a este
entorno específico.

## 9. Qué hacer, en orden, para este proyecto y cualquier otro

1. Recortar `CLAUDE.md` a las reglas que de verdad aplican siempre, mover
   el resto a archivos referenciados (en KUMPLY ya está parcialmente
   hecho: `docs/audits/`, `LITEPAPER.md`, `docs/AI-USAGE.md` viven aparte
   y se referencian por link).
2. Crear `AGENTS.md` en la raíz con las mismas reglas duras, y agregar
   `@AGENTS.md` al inicio de `CLAUDE.md` para que ambos queden
   sincronizados desde una sola fuente real. **Hecho en KUMPLY.**
3. Revisar si algún proceso manual repetido (limpieza de registro,
   chequeo de prescreen, verificación de claims técnicos antes de
   publicar) merece volverse hook o slash command en vez de quedarse
   como instrucción que hay que recordar cada vez.
4. Confirmar la versión real de Claude Code instalada antes de asumir
   cualquier comportamiento de compatibilidad con `AGENTS.md` — la
   incertidumbre de §4 se resuelve mirando la versión real, no
   adivinando.
5. Copiar `playbooks/continue.md` y agregar sus dos reglas al final de
   `AGENTS.md`. Sin esas dos líneas en `AGENTS.md`, `continue.md` es solo
   un archivo suelto que nadie lee automáticamente — misma lección que ya
   se aprendió con este playbook antes de volverse Skill. **Hecho en
   KUMPLY.**
6. Copiar `playbooks/images.md` y agregar sus dos reglas al final de
   `AGENTS.md` — mismo patrón que el paso 5, mismo motivo. **Hecho en
   KUMPLY.**

## 10. Cierre de sesión — un comando, no una frase distinta cada vez

**No digas "asegúrate que CLAUDE.md, SKILL.md y Memory.md estén completos
y actualizados."** Es vago a propósito de una forma que no ayuda: le pide
a la sesión que actualice todo por igual, cuando cada archivo tiene un
propósito distinto (§2) — y una instrucción vaga tiende a producir
ediciones infladas solo para "tener algo que reportar."

**La solución real: un comando, no una frase que recordar.** Confirmado
18-ago-2026: desde 2026, los comandos personalizados y los Skills son
**la misma función por dentro** — un archivo en `.claude/commands/` o en
`.claude/skills/<nombre>/SKILL.md` producen el mismo resultado, un
comando invocable con `/nombre`. Ya existe uno para esto:
`.claude/commands/session-close.md` → escribe **`/session-close`** al
final de cualquier sesión.

Qué hace, distinto por archivo, no igual para todos: revisa `CLAUDE.md`/
`AGENTS.md` solo si se decidió una **regla dura** nueva (no un hecho);
revisa los Skills solo si el **proceso** que describen cambió, no si
cambió un dato detrás de ese proceso; y solo la memoria externa se
actualiza con hechos, decisiones y el porqué de hoy. Si algo no necesitaba
cambio, el comando pide que lo diga explícito — "no hacía falta" es una
respuesta válida, no una que hay que evitar.

**Sobre Antigravity específicamente:** la confirmación de que comandos y
skills son la misma función viene de la documentación de Claude Code — no
encontré una confirmación igual de específica para el sistema de comandos
propio de Antigravity. Probar `/session-close` ahí directamente antes de
asumir que funciona igual.

## Fuentes

- [Claude Code Docs — Best Practices](https://code.claude.com/docs/en/best-practices)
- [Claude Code Docs — Agent Skills](https://code.claude.com/docs/en/agent-sdk/skills)
- [Claude Code Features and Settings Reference 2026](https://hidekazu-konishi.com/entry/claude_code_features_settings_reference_2026.html)
- [Claude Code Extension Layer Decision Guide](https://hidekazu-konishi.com/entry/claude_code_extension_layers_decision_guide.html)
- [Google Antigravity Complete Guide 2026](https://aicodingtools.im/blog/what-is-google-antigravity-complete-guide)
- [Google Antigravity and AGENTS.md — The Prompt Shelf](https://thepromptshelf.dev/blog/google-antigravity-agents-md-rules-guide-2026/)
- [CLAUDE.md vs AGENTS.md vs SKILL.md 2026](https://pub.towardsai.net/claude-md-vs-agents-md-vs-skill-md-which-file-owns-what-in-2026-13859378f56a)
- [Does Claude Code read AGENTS.md? — operator-side patterns](https://gist.github.com/yurukusa/d36197848911f025add142abefcde685)
- [Claude Code Docs — Manage costs effectively](https://code.claude.com/docs/en/costs)
- [Claude Platform Docs — Compaction](https://platform.claude.com/docs/en/build-with-claude/compaction)
- [Claude Platform Docs — Context windows](https://platform.claude.com/docs/en/build-with-claude/context-windows)
- [Claude Code Context Window: /compact, /clear Explained](https://explainx.ai/blog/claude-code-context-window-limit-management-2026)
- [Reduce Claude Code Token Usage: 8 Proven Ways (2026)](https://app.stationx.net/articles/reduce-claude-code-token-usage)
- [Claude Platform Docs — Memory tool](https://platform.claude.com/docs/en/agents-and-tools/tool-use/memory-tool)
- [Anthropic adds persistent memory to Claude Managed Agents (public beta)](https://www.edtechinnovationhub.com/news/anthropic-brings-persistent-memory-to-claude-managed-agents-in-public-beta)
- [Claude Code Commands: A Practical Guide for 2026 — DataCamp](https://www.datacamp.com/tutorial/claude-code-slash-commands)
- [Vision — Claude Platform Docs](https://platform.claude.com/docs/en/build-with-claude/vision) (fetched 19-ago-2026)
- [Prompt caching — Claude Platform Docs](https://platform.claude.com/docs/en/build-with-claude/prompt-caching) (fetched 19-ago-2026)
- [Common workflows — Claude Code Docs](https://code.claude.com/docs/en/common-workflows) (fetched 19-ago-2026)
