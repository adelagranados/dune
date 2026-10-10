# Dune — contexto de producto

Fecha de revisión: 9 de octubre de 2026, America/Hermosillo.

## Fuentes y alcance

- Repositorio local inspeccionado, solo lectura: `C:\Users\grana\Documents\myProjects\dune`.
- Remoto configurado: https://github.com/adelagranados/dune.git. No se consultaron ramas, issues ni PR remotos.
- Figma: https://www.figma.com/design/1mFs1Nkr9bH2kTljW8sO0e/Dune. Se revisaron metadatos de `83:2` (Design System), `101:2` (MVP Flow) y `128:72` (Dev Handoff), incluidos textos de especificación. No se realizó auditoría visual de cada pantalla ni modificación de Figma.
- Conversación “Apps para registrar tiempo”: `6aad715e-24d4-83e8-9eb5-e073028ff836`. El lector devolvió cinco turnos, sin cursor anterior; las respuestas del asistente son referencias sin contenido recuperable. Se obtuvo el mensaje completo de contraste y la solicitud de quitar el fondo de los tres puntos. No es una transferencia íntegra del historial original.
- Lectura de README, instrucciones, rutas, tokens, motor/store de timer, scheduler y repositorios. No se ejecutó la app ni las pruebas. Git no permitió verificar estado de trabajo/HEAD desde esta sesión; no se presupone un checkout limpio ni una rama determinada.

## Propósito confirmado

Dune responde “¿cuánto tiempo me tomó realmente?” para proyectos personales. Es un producto personal y de portafolio. El tiempo se acumula; no hay rachas, scores, culpa ni evaluación de productividad. La apariencia es cálida, calmada y plana. Stats describe tiempo, no rendimiento.

## Flujos definidos en Figma

| Flujo                          | Comportamiento esperado                                                                                  |
| ------------------------------ | -------------------------------------------------------------------------------------------------------- |
| Home vacío → Crear proyecto    | Nombre, categoría, color y estimación opcional.                                                          |
| Home → Detalle                 | Total acumulado, historial y progreso frente a estimación.                                               |
| Detalle → Start Timer          | Elegir Sin límite, 15, 30, 45, 60 minutos o Custom; luego timer activo.                                  |
| Timer activo → Pause/Resume    | Pausa persistente; reanudar conserva tiempo trabajado y excluye pausas.                                  |
| Timer → Finish → Session Saved | Guardar duración real, actualizar total, liberar timer activo y mostrar confirmación.                    |
| Mini bar → Timer               | Abrir timer completo; Pause actúa desde la mini bar. No existe un tab permanente de Timer.               |
| Entrada manual                 | Proyecto, fecha, inicio, fin y duración para trabajo registrado fuera de la app.                         |
| Proyecto completado            | Conservar total e historial y permitir reabrir. Diseño definido, flujo aún pendiente en código revisado. |
| Stats / Settings               | Navegación principal Home, Stats y Settings; preferencias de tema e idioma y recordatorios en el diseño. |

El código de creación permite categoría libre y ofrece sugerencias existentes más Coding/Creative/Learning; los chips son atajos, no un catálogo cerrado. Esto es comportamiento observado en código, no una confirmación recuperada de la conversación.

## Timer y notificaciones

Estado actual del dominio: `projectId`, `startedAt`, `accumulatedPausedMs`, `pausedAt` y `targetDurationMs` opcional. La fórmula implementada es:

```text
elapsed = (pausedAt ?? now) - startedAt - accumulatedPausedMs
```

`startedAt` permanece fijo. Resume suma el intervalo pausado a `accumulatedPausedMs` y limpia `pausedAt`. El handoff antiguo menciona un nuevo timestamp al reanudar: el modelo actual conserva el ancla original y cumple el requisito de excluir pausas; no cambiarlo por una lectura literal del texto antiguo. El tick visual solo actualiza `now`. Persistencia en KV/SQLite y reconstrucción al relanzar; recálculo al volver al primer plano.

| Transición                      | Recordatorio                                             |
| ------------------------------- | -------------------------------------------------------- |
| Start con objetivo              | Programar para `now + tiempo activo restante`.           |
| Pause                           | Cancelar el pendiente; el tiempo activo queda congelado. |
| Resume                          | Cancelar/reprogramar con tiempo activo restante.         |
| Finish                          | Cancelar el pendiente.                                   |
| Sin límite u objetivo alcanzado | No programar otro recordatorio desde el cálculo actual.  |

Al alcanzar la meta el timer sigue; la usuaria puede continuar o terminar. Se acumula tiempo real, incluso por encima de la meta. La estimación del proyecto es distinta del objetivo de una sesión.

El identificador de notificación vive fuera del modelo de dominio. El scheduler no bloquea las transiciones del timer; sus fallos se capturan. El permiso se solicita al comenzar una sesión con objetivo, no al abrir la app. Una negativa no impide registrar tiempo. El código configura banner/lista/sonido, sin badge, y un canal Android. El adaptador desactiva notificaciones dentro de Expo Go en Android; esto describe el código, no una nueva verificación de compatibilidad del SDK. El README reporta pruebas previas en Android; iOS no verificado por este handoff.

## Eliminación y swipe aprobados

Fuentes: Figma `162:278`/`162:400`, `170:176`/`170:185`.

1. Sesiones en reposo: fondo normal de pantalla, sin relleno arena.
2. Swipe hacia la izquierda: solo la fila desplazada adquiere surface arena y revela una acción compacta de papelera. Las demás quedan iguales. No es selección permanente.
3. Reset o cancelar: quitar resaltado y ocultar acción.
4. Tocar papelera: abrir confirmación. Cancelar conserva la sesión; confirmar la elimina y actualiza total y, cuando exista Stats, estadísticas.
5. Proyecto: detalle → menú de tres puntos → Delete project → confirmar/cancelar. La confirmación explica que elimina también sus sesiones y que no se puede deshacer.

Mantener equivalencia EN/ES y Light/Dark. No borrar directamente al completar el gesto. La conversación confirma que los tres puntos carecen de fondo arena en todas las pantallas.

## Edición definida

Figma `166:166` y `166:193`: detalle → menú → Edit project; formulario de nombre, categoría, color y estimación opcional, con datos actuales. No se encontró ruta ni operación de actualización de proyecto en los archivos revisados. No se recuperó una decisión sobre edición de sesiones, guardado al salir, validación de cambios o conflictos con timer activo: quedan por resolver antes de implementarlos.

## Estado observado y diferencias

| Área                 | Evidencia en código                                                        | Límite / pendiente                                                                                                                                                         |
| -------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Crear/listar/detalle | Rutas y repositorios presentes; totales sumados desde sesiones.            | No ejecución en esta sesión.                                                                                                                                               |
| Timer y objetivo     | Motor puro, store persistente, scheduler, pantalla de duración y guardado. | Fiabilidad en dispositivo no revalidada. Finish limpia activo antes de insertar Session: revisar recuperación si falla el guardado, sin atribuirle garantía transaccional. |
| Entrada manual       | `app/manual-entry.tsx` presente.                                           | No revalidada en dispositivo.                                                                                                                                              |
| Borrado              | Swipe y ConfirmDialog; proyecto/sesiones eliminados en transacción.        | Swipe actual muestra botón relleno danger con texto Delete; no implementa el resaltado por fila/papelera de Figma. Cancelar diálogo no cierra explícitamente el swipe.     |
| Menú / edición       | Detalle muestra enlace de borrar debajo de botones.                        | Falta menú de tres puntos y edición; borrar proyecto usa textSecondary, no danger.                                                                                         |
| Colores              | Tokens Light/Dark con Ochre y colores por nombre; migración presente.      | `docs/color-tokens.md` y comentarios conservan notas antiguas sobre tokens ausentes en Figma.                                                                              |
| Settings             | Selector System/Light/Dark e idioma System/EN/ES, store persistente.       | README dice que falta Settings: está desactualizado. No se ve control de recordatorios en Settings.                                                                        |
| Stats                | Pantalla con texto placeholder.                                            | Resumen/gráficas pendientes; no prometer actualización visual de Stats aún.                                                                                                |
| Completed            | Esquema contempla estado.                                                  | No se encontró flujo de completar/reabrir.                                                                                                                                 |

## Retomar en Codex

Abrir o asociar la carpeta local real de Dune como carpeta principal del proyecto, no el espejo Portafolio. Incorporar este `AGENTS.md` y ambos documentos, conservando cualquier instrucción posterior que ya exista. Antes de trabajar, leerlos y revisar cambios locales. Primer trabajo sugerido: implementar menú/edición o alinear swipe, como cambio acotado; no rehacer la app.

Para recuperar todo el contexto faltante hace falta una exportación legible de la conversación original. No inferir ese contenido de los marcadores `chatgpt-content-reference`.
