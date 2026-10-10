# Dune — sistema de diseño

Revisión: 9 de octubre de 2026. Fuentes: conversación recuperada, `src/ui/theme/tokens.ts`, Figma Design System `83:2`, contraste `164:14`, añadido `172:15`, Dev Handoff `128:72` y swipe `170:176`/`170:185`.

## Lenguaje visual

Cálido y calmado: arena, terracota, superficies planas, sin sombras ni bordes marcados. Paridad completa Light/Dark en todos los estados y flujos. Tema System/Light/Dark. Usar tokens semánticos; no copiar colores históricos de mockups como si fueran vigentes.

DM Serif Display para títulos editoriales; Manrope para UI, etiquetas, cuerpo y controles; Playfair Display solo para wordmark. Números tabulares en timer cuando disponibles. Escala de tamaños: 11, 13, 14, 15, 18, 20, 26, 34, 40, 48. El código define alturas 34/44/52/62 para títulos serif 26/34/40/48, evitando recorte en Android.

Espaciado: 4, 8, 12, 16, 24, 32, 40, 48. Margen de pantalla de referencia 24; padding interior de referencia 16, con variaciones por componente. Radios 12, 18, 24, 26, 28, 32. Respetar safe areas.

Conservar reloj de arena canónico y logo aprobados. Iconos outline consistentes; código usa Phosphor. No reemplazar assets por aproximaciones ni emoji/Unicode.

## Tokens vigentes

| Token           | Light   | Dark    | Uso                                                                   |
| --------------- | ------- | ------- | --------------------------------------------------------------------- |
| background      | #FCFAF7 | #1E1A18 | Fondo de pantalla.                                                    |
| surface         | #E7DCD1 | #3B322C | Agrupación y superficies.                                             |
| surfaceElevated | #FCFAF7 | #4A3D36 | Superficie elevada/sheets; en Light coincide con background.          |
| textPrimary     | #29231F | #FAF4EC | Texto principal.                                                      |
| textSecondary   | #665A52 | #B9ADA5 | Texto secundario.                                                     |
| textPlaceholder | #8D8077 | #897C73 | Pistas no esenciales con etiqueta persistente.                        |
| divider         | #C9B9AC | #5B4D45 | Separación visual; no garantía de estado accesible.                   |
| primary         | #C86F52 | #D98568 | Rellenos de marca, progreso y reloj de arena.                         |
| primaryText     | #954A34 | #D98568 | Enlaces/textos pequeños e icono/etiqueta de tab activo.               |
| onPrimary       | #1E1A18 | #1E1A18 | Texto/iconos sobre primary.                                           |
| danger          | #A8372A | #EE8271 | Texto destructivo sobre superficies; no relleno de botón destructivo. |

La conversación y el código resuelven `onPrimary` a tinta oscura en ambos temas. El texto antiguo de Figma `164:20` aún plantea alternativas: no tratarlo como una decisión abierta posterior. Los valores antiguos surface #F4F1ED/#29231F, elevated oscuro #342D29 y divider oscuro #453B36 del handoff inicial están superados por la pasada de contraste.

`textPlaceholder` y `danger` ya están formalizados en Figma `172:15`; la afirmación antigua de `docs/color-tokens.md` de que viven solo en código está desactualizada.

## Colores de proyecto

Guardar identidad semántica de color, resolver hexadecimal por tema. El código ya define `ProjectColor` y una migración de valores históricos a nombres.

| Identidad           | Light   | Dark    |
| ------------------- | ------- | ------- |
| terracotta          | #C86F52 | #D98568 |
| dusk                | #8175C7 | #8175C7 |
| sage                | #A8C7B1 | #A8C7B1 |
| sunset              | #E5A47F | #E5A47F |
| ochre (Ochre Olive) | #84783D | #A69A62 |

Ochre reemplaza el neutro prestado #6D625B. Está definido en Figma `172:18` y en los tokens actuales. No confundir estos colores con `danger`. Mostrar siempre nombre del proyecto o etiquetas/leyendas de datos: el color no es identificación suficiente por sí solo.

## Componentes y estados

- Botones: primary para acción principal, secondary para alternativa; mantener estados pressed/disabled del DS.
- Inputs: Default/Focus/Error y etiquetas persistentes. No comunicar validación o instrucciones esenciales mediante placeholder.
- Chips: una categoría seleccionada; en el código son atajos de un campo libre. No usar nombres de estado como contenido.
- Navegación: Home/Stats/Settings; timer accesible por flujo y mini bar, sin tab permanente visible.
- Menú de opciones: solo tres puntos sin fondo arena visible en todas las pantallas. Área táctil puede ser mayor que el icono y transparente.
- Swipe: reposo sobre background; solo fila desplazada en surface; papelera compacta; reset/cancelar devuelve reposo. Confirmación antes de borrar. Véase PRODUCT_CONTEXT.
- Confirmación destructiva: apariencia integrada con Dune, texto danger, confirmación separada de cancelar y nunca preseleccionada. No botón relleno danger.

## Accesibilidad: decisiones y límites

Estas notas registran decisiones y mediciones de las fuentes, no una certificación nueva. No se recalcularon los contrastes en este handoff ni se auditó WCAG completa.

| Elemento                          | Medición reportada          | Criterio documentado                                                                                                           |
| --------------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Surface contra background         | Light ~1.30:1, Dark ~1.38:1 | Solo agrupación decorativa; no afirmar que satisface un requisito 3:1 de controles/estados.                                    |
| Placeholder sobre input surface   | Light ~2.84:1, Dark ~3.09:1 | Excepción conocida por debajo de AA para texto normal. Etiqueta persistente; ninguna instrucción esencial solo en placeholder. |
| primaryText en background Light   | ~6.10:1                     | Usar en texto pequeño en lugar de primary de marca (~3.44:1).                                                                  |
| onPrimary en primary Light        | ~4.81:1                     | Tinta #1E1A18; crema antigua ~3.28:1 no satisface AA normal.                                                                   |
| danger en surface                 | Light ~4.79:1, Dark ~4.81:1 | Validez reportada para estas parejas; no extrapolar a otros fondos.                                                            |
| Sage / Sunset en background Light | ~1.76:1 / ~2.03:1           | Débiles como marcas aisladas de ~9px; acompañar con nombres/etiquetas.                                                         |

El añadido de Figma `172:15` registra explícitamente la excepción de placeholder. La preferencia de la usuaria es conservar el carácter visual y discutir los trade-offs antes de cambiar la paleta. Eso no autoriza excepciones nuevas para cualquier control.

Cuando un input, chip seleccionado o control segmentado necesita un límite/indicador de estado visible, Figma exige un indicador accesible separado. El bajo contraste de una tarjeta decorativa no justifica un estado interactivo ambiguo. La solución concreta del indicador queda por validar; no introducir bordes marcados o sombras de manera general ni declarar resuelto el conflicto sin probarlo.

Validar en teléfonos físicos, también al aire libre, y revisar tamaño de texto, lector de pantalla, etiquetas/estados y alternativa accesible a swipe. Estas verificaciones y la alternativa al gesto quedan pendientes; no son excepciones aprobadas. La lectura de metadatos de Figma no verifica estos aspectos.

## Diferencias que deben conservarse visibles

El swipe actual de `app/project/[id].tsx` utiliza relleno danger y texto Delete: difiere del añadido de diseño y de la regla danger como texto. No hay gestión explícita del resaltado/reset al cancelar. El menú de tres puntos y edición están diseñados, pero no presentes en esa ruta. Algunos mockups históricos y notas del repositorio están desactualizados. Corregir estas diferencias con una tarea de implementación posterior; este handoff no modifica la app.
