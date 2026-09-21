/**
 * VALORES — RESPALDO ESTÁTICO
 * ===========================
 * Mismo contenido que `supabase/seed/valores.sql`.
 *
 * Los cuatro valores y su idea central salen del documento «4. QUIÉNES SOMOS»
 * del Drive de PIYC (resumidos en `docs/PLAN_INICIAL_PIYC.md` §4.3, que indica
 * usar siempre la segunda versión, la pulida). El párrafo de cada uno lo
 * **redactó el equipo de la web** a partir de esa idea central y está
 * pendiente de que Jorge lo apruebe.
 */

import type { Valor } from "@/lib/content-types";

export const valoresEstaticos: Valor[] = [
  {
    id: null,
    title: "Integridad",
    description:
      "Construimos lazos de confianza diciendo las cosas como son: lo que se puede hacer, lo que no, y lo que hay que revisar antes de prometerlo. Cada proceso se explica con claridad —alcance, criterio técnico y estado real del avance— para que el cliente decida con información completa y no con una expectativa que después haya que corregir.",
    iconKey: "integridad",
    sort: 10,
    published: true,
  },
  {
    id: null,
    title: "Compromiso",
    description:
      "Cumplir los parámetros acordados es el punto de partida, no el resultado extraordinario. Trabajamos con procesos ordenados —planeación, ejecución documentada y verificación— porque es la única forma de que un trabajo bien hecho sea la norma y no la suerte de un proyecto. Lo que se entrega queda probado, documentado y en manos de quien lo va a operar.",
    iconKey: "compromiso",
    sort: 20,
    published: true,
  },
  {
    id: null,
    title: "Orientación al cliente",
    description:
      "Antes de proponer un equipo entendemos el proceso: qué produce, con qué restricciones trabaja y en qué momento puede parar. El acompañamiento no termina con la puesta en marcha; sigue mientras la planta se acostumbra al sistema nuevo y aparecen los ajustes que solo se ven produciendo. Buscamos relaciones largas, no proyectos cerrados a la primera factura.",
    iconKey: "cliente",
    sort: 30,
    published: true,
  },
  {
    id: null,
    title: "Innovación",
    description:
      "La industria cambia de controladores, de protocolos y de forma de operar, y quedarse quieto es quedarse atrás. Renovamos y potenciamos nuestros productos y servicios incorporando lo que de verdad aporta al proceso del cliente —y no la novedad por la novedad—, para que cada solución siga siendo mantenible y ampliable varios años después de entregada.",
    iconKey: "innovacion",
    sort: 40,
    published: true,
  },
];
