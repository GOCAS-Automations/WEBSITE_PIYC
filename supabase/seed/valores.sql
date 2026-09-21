-- Semilla de valores (site_values) — los cuatro valores de PIYC.
-- GENERADO desde src/data/valores.ts.
--
-- Los valores y su idea central salen del documento «4. QUIÉNES SOMOS» del
-- Drive (resumen en docs/PLAN_INICIAL_PIYC.md §4.3, que indica usar siempre la
-- segunda versión, la pulida). El párrafo de cada uno lo redactó el equipo de
-- la web y está PENDIENTE DE APROBACIÓN de Jorge.
--
-- `site_values` no tiene clave única de negocio (el id es un uuid), así que la
-- idempotencia se resuelve borrando primero por título.

delete from public.site_values
 where title in ('Integridad', 'Compromiso', 'Orientación al cliente', 'Innovación');

insert into public.site_values (title, description, icon_key, sort, published)
values
  ('Integridad',
   'Construimos lazos de confianza diciendo las cosas como son: lo que se puede hacer, lo que no, y lo que hay que revisar antes de prometerlo. Cada proceso se explica con claridad —alcance, criterio técnico y estado real del avance— para que el cliente decida con información completa y no con una expectativa que después haya que corregir.',
   'integridad', 10, true),
  ('Compromiso',
   'Cumplir los parámetros acordados es el punto de partida, no el resultado extraordinario. Trabajamos con procesos ordenados —planeación, ejecución documentada y verificación— porque es la única forma de que un trabajo bien hecho sea la norma y no la suerte de un proyecto. Lo que se entrega queda probado, documentado y en manos de quien lo va a operar.',
   'compromiso', 20, true),
  ('Orientación al cliente',
   'Antes de proponer un equipo entendemos el proceso: qué produce, con qué restricciones trabaja y en qué momento puede parar. El acompañamiento no termina con la puesta en marcha; sigue mientras la planta se acostumbra al sistema nuevo y aparecen los ajustes que solo se ven produciendo. Buscamos relaciones largas, no proyectos cerrados a la primera factura.',
   'cliente', 30, true),
  ('Innovación',
   'La industria cambia de controladores, de protocolos y de forma de operar, y quedarse quieto es quedarse atrás. Renovamos y potenciamos nuestros productos y servicios incorporando lo que de verdad aporta al proceso del cliente —y no la novedad por la novedad—, para que cada solución siga siendo mantenible y ampliable varios años después de entregada.',
   'innovacion', 40, true);
