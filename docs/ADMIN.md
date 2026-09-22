# Manual del panel — PIYC

Esta guía explica cómo usar el panel de administración y el portal del equipo del sitio piycsas.com. Está escrita para quien lo usa en el día a día, no para quien lo programó: no hace falta saber nada de computadores más allá de navegar por internet.

## 1. Cómo entrar

El panel y el portal se abren desde la misma dirección: **piycsas.com/mi-cuenta**.

1. Entra a `/mi-cuenta` desde el navegador del computador o del celular.
2. Escribe tu **Usuario** (el que te asignó PIYC, por ejemplo `jperez` — no es un correo electrónico) y tu **Contraseña**. La pantalla se titula «Portal del equipo · Iniciar sesión».
3. Pulsa **Ingresar**. Si algo está mal, el sistema responde siempre lo mismo —«Usuario o contraseña incorrectos»— sin decir cuál de los dos falló, a propósito. Si la cuenta está desactivada, lo dice con una pantalla propia.

<!-- captura: pantalla de inicio de sesión en /mi-cuenta -->

Si tu cuenta tiene acceso al panel (administrador o coordinador), al entrar verás una pantalla intermedia que dice «Abriendo el panel…» y que te lleva sola al panel en un par de segundos; si no, tiene el botón **Ir al panel**. Esa misma pantalla trae el botón **Ver mi portal**, por si lo que quieres es registrar tu jornada. También puedes entrar a `/mi-cuenta?portal=1` directamente, o usar el botón **Mi cuenta** que aparece arriba del panel.

### Cambiar la contraseña

1. Dentro de tu portal, busca el bloque **Cambiar mi contraseña**.
2. Escribe la nueva en **Nueva contraseña** y repítela en **Repite la contraseña**.
3. La contraseña debe tener **al menos 10 caracteres**. Una frase corta y fácil de recordar (tres palabras seguidas, por ejemplo) sirve perfectamente.
4. Pulsa **Cambiar contraseña**.

Cámbiala la primera vez que entres con la que te entregaron, y cualquier vez que sospeches que alguien más la conoce.

### Si olvidaste tu contraseña

No hay un enlace de «recuperar contraseña» automático. Pídele a tu coordinador o a un administrador que te la **restablezca** desde el panel (sección Equipo): te va a entregar una contraseña nueva y podrás cambiarla apenas ingreses.

## 2. Roles

Hay solo tres roles. Cada cuenta tiene exactamente uno.

- **Administrador.** Puede hacer todo: editar el sitio, administrar el equipo (incluyendo crear y eliminar otros administradores) y revisar las jornadas.
- **Coordinador.** Puede hacer lo mismo que un administrador, **menos** crear o eliminar cuentas de administrador. Sí puede crear, editar y desactivar cuentas de empleados y de otros coordinadores.
- **Empleado.** Solo ve su propio portal: registra su jornada, consulta su historial y cambia su contraseña. No entra al panel.

Un administrador o un coordinador que abre su propia ficha en Equipo puede cambiar sus datos personales, pero no su propio rol ni su propio estado (activo/inactivo): eso lo tiene que hacer otra persona con acceso. Es a propósito, para que el sistema nunca se quede sin nadie que pueda entrar.

## 3. Editar el sitio

Todo lo que se ve en piycsas.com se administra desde **Contenido del sitio**, la segunda entrada del menú del panel. Ahí encuentras siete pantallas de edición —**Página de inicio**, **Página Nosotros**, **Servicios**, **Proyectos**, **Valores corporativos**, **Textos de las páginas** y **Datos de contacto y buscadores**— y una octava tarjeta, **Mensajes de contacto**, que es la bandeja de quienes escriben desde el sitio (ver el punto 5).

<!-- captura: menú "Contenido del sitio" con las tarjetas -->

**Todo el texto que se ve en el sitio se edita desde aquí.** No queda ninguna frase escrita «por dentro»: los rótulos pequeños, los títulos de cada franja, los párrafos de entrada, los textos de los botones y las frases de cierre tienen su campo en alguna de estas pantallas.

**Importante sobre guardar:** en la mayoría de estas pantallas, cada tarjeta (cada bloque de texto) se guarda con **su propio botón**. Si escribes en un bloque y cambias de pantalla sin pulsar «Guardar» en ese bloque, lo que escribiste se pierde. En las pantallas de un solo formulario (como la ficha de un servicio o un proyecto) hay un único botón al final.

Al guardar, el sitio público se refresca solo: casi siempre el cambio se ve al recargar la página. Si no aparece, dale unos minutos —el sitio se regenera como máximo cada **cinco minutos**— y vuelve a mirar.

### Página de inicio

Se edita en bloques, en el mismo orden en que se ven en la portada:

- **Primera pantalla**: línea pequeña, titular, frase de apoyo, el texto y el destino de los dos botones, y la **Imagen principal de la portada**.

  La **Imagen principal de la portada** es la foto grande del recuadro de la derecha, lo primero que se ve al abrir el sitio. Se llena como cualquier campo de foto: **Subir imagen** y después la **Descripción de la imagen (texto alternativo)**, obligatoria en cuanto hay foto. Si se deja vacía —botón **Quitar**—, la portada vuelve a mostrar el esquema eléctrico animado que trae de fábrica. La foto se recorta a 4:3: conviene una apaisada, con lo importante al centro.
- **Qué hace PIYC**: línea pequeña, título, texto, foto y el texto del enlace que lleva a Nosotros.
- **Franja de servicios** y **Franja de casos de éxito**: la línea pequeña, el título, el párrafo de entrada y el texto del enlace «ver todos» de cada una. El enlace siempre lleva a Servicios o a Proyectos; lo que se cambia aquí es cómo se llama. Si lo dejas vacío, el enlace no aparece.
- **Cómo trabajamos**: la franja del proceso, con sus pasos.
- **Entradilla de los valores en la portada**: la línea pequeña, el título y la frase que presentan los cuatro valores en el inicio. Ojo: son textos distintos de los de la página Nosotros, aunque los valores sean los mismos.
- **Qué se destaca en la portada**: qué servicios y qué proyectos se muestran, escritos por su dirección (slug). Una lista vacía apaga esa franja.
- **Franja de cierre**: título, texto, los dos botones y la frase pequeña de abajo. Esa frase lleva un enlace en la mitad, así que se escribe en tres partes (lo de antes, el texto del enlace y lo de después); si dejas las tres vacías, no aparece.

### Página Nosotros

Bloques: **Cabecera de la página**, **Quiénes somos** (con su línea pequeña), **Misión y visión**, **Entradilla de los valores** (línea pequeña, título y frase), **Galería** (línea pequeña, título, texto de entrada y el campo **Fotos de la página Nosotros**) y **Franja de cierre**.

La galería de Nosotros **no se pinta en cuadrícula: es un carrusel**. Las fotos van en una tira horizontal que el visitante arrastra con el dedo o mueve con dos flechas, y que siempre deja la siguiente a medio ver. Por eso el orden importa: **la primera foto de la lista es la que todo el mundo ve**.

<!-- captura: pantalla de edición de la página Nosotros -->

### Servicios y Proyectos

Cada uno tiene un listado con las tarjetas existentes y un botón para agregar uno nuevo. Al abrir un servicio o un proyecto encuentras su ficha completa:

- **Servicio:** cinco tarjetas. **Lo básico** (Título, Dirección en el sitio (slug), Nombre corto para el menú, Resumen, Icono —escrito sin tilde en el panel—, Orden y el interruptor ¿Se muestra en el sitio? con estados Visible/Oculto); **Descripción y alcances** (Descripción y «Qué incluye el servicio», con el botón «Agregar alcance»); **Fotos** (Foto de portada y Galería); **Video** (Enlace de YouTube, Título del video, Descripción del video y el interruptor ¿Mostrar el video?, apagado por defecto); y **Cómo lo ve Google** (Título para buscadores y Descripción para buscadores).
- **Proyecto:** tres tarjetas. **Lo básico** (Título, Dirección en el sitio (slug), Cliente o sector, Descripción corta, Orden y ¿Se muestra en el sitio?); **La historia completa** (un solo campo, «Contexto, solución y resultado»); y **Fotos** (Foto de portada y Galería del proyecto). Los proyectos **no tienen bloque de video ni campos de buscadores**: esos datos los arma el sitio con el título y la descripción corta.

El interruptor **¿Se muestra en el sitio?** es lo que decide si algo ya está listo pero todavía no publicado: puedes dejar un servicio o un proyecto guardado y oculto mientras lo terminas de revisar.

### Valores corporativos

Cada valor tiene nombre, ícono, qué significa, orden y si se muestra o no en el sitio.

### Textos de las páginas

Todo lo que no es una ficha de servicio ni de proyecto, agrupado por página:

- **Cabecera** de Servicios, Proyectos y Contacto: línea pequeña, título, frase de apoyo, párrafo de entrada y foto.
- **Franja de cierre** de Servicios y de Proyectos: el título y el texto (los dos botones son siempre los mismos).
- **Preguntas frecuentes** de Servicios y de Contacto: se agregan y se borran una por una. Se pintan como acordeón al final de la página y Google las puede mostrar en los resultados, así que no prometas plazos, precios ni garantías que PIYC no haya confirmado. Si borras todas, el bloque desaparece.
- **Textos del formulario** de Contacto: el párrafo que va encima (qué pasa al enviar), la nota de abajo (qué se hace con los datos) y los **títulos de los tres bloques** de esa página: el del bloque de datos, el del formulario y el del mapa.
- **Textos que se repiten en todas las fichas**: la frase que aparece bajo los datos de un caso con servicios asociados, los cierres de la ficha de un caso y de la de un servicio, y **los títulos que encabezan cada parte**: el del cuerpo y el de la galería de un caso, y los de alcance, «Qué incluye», galería, casos relacionados y «Otros servicios» de un servicio. No son de una ficha concreta —salen igual en todas—, por eso se editan aquí y no dentro de cada una.
- **Página «no encontrada»**: lo que ve alguien que entra a un enlace que ya no existe.

### Datos de contacto y buscadores

Dos bloques:

- **Datos de contacto:** nombre comercial, razón social, NIT, eslogan, dirección completa, los números de WhatsApp, teléfonos, correos, Instagram y horario de atención. El campo más delicado de todo el panel es el rotulado literalmente **«WhatsApp que recibe los mensajes del formulario»** (lleva encima su propio aviso, «El campo que no se puede dejar mal»): a ese número llega todo el que escribe desde el sitio. Va con indicativo del país y solo números, sin espacios (por ejemplo `573217617958`). Si se escribe mal, los mensajes se pierden sin que nadie se entere.
  El horario va en **dos campos que tienen que decir lo mismo**: «Horario de atención» es el texto que se lee en la página de contacto, y «Horario para Google» es ese mismo horario en el formato que entienden los buscadores (`Mo-Fr 08:00-17:00`: días en inglés abreviado, horas de 24 h, varios tramos separados por coma, y los días cerrados simplemente no se escriben). Si se cambia uno, hay que cambiar el otro. Dejar vacío el primero borra el horario del sitio entero.
- **Lo que se lee en Google:** el título y la descripción con los que aparece cada página en los resultados de búsqueda, y las mismas para cada página del sitio por separado.

<!-- captura: pantalla de Datos de contacto y buscadores -->

## 4. Fotos

Cada campo de foto tiene dos caminos, los dos válidos:

1. **Subir el archivo** desde tu computador con el botón **Subir imagen**.
2. **Pegar la dirección** de una imagen ya publicada en internet.

El panel **comprime la foto sola**: la convierte a WebP, la reduce a 1920 píxeles de ancho como máximo y la deja por debajo de 400 KB antes de guardarla, para que el sitio cargue rápido. No hace falta preparar la foto de antemano; acepta JPG, PNG y WebP.

<!-- captura: campo de imagen con vista previa y botón "Subir imagen" -->

### Texto alternativo (obligatorio)

En cuanto hay una foto cargada, el campo **Descripción de la imagen (texto alternativo)** se vuelve obligatorio. Este texto lo leen en voz alta los programas de las personas con discapacidad visual, y también le sirve a Google para entender la foto. Para escribir uno bueno:

- Describe en pocas palabras lo que se ve, no lo que quieres vender. Ejemplo: «Tablero de control ensamblado en el taller de PIYC».
- Evita frases como «imagen» o «foto 1»: no dicen nada.

### Las fotos que hoy le faltan al sitio

El sitio usa **26 fotos propias de PIYC**, repartidas de modo que ninguna se repita. Pero **no hay ninguna foto de aires acondicionados y solo hay una de refrigeración**: esas dos líneas se están mostrando con fotos de otros trabajos. Cuando PIYC las tome, se suben en Contenido del sitio → Servicios → el servicio, en **Foto de portada** y **Galería**, con **Subir imagen** y su descripción. Las fotos de banco de imágenes no se publican.

### Si pegas la dirección de una foto de otro sitio

El sitio solo puede mostrar fotos que estén en su propio almacenamiento o en Cloudinary. Si pegas la dirección de una imagen de un sitio distinto, el panel te avisa que **probablemente no se vaya a ver** en la página publicada. En ese caso sube el archivo con el botón de arriba, o publica la foto en Cloudinary (gratuito) y pega esa dirección.

## 5. Mensajes de contacto

El formulario de contacto del sitio **no manda correos**. Cuando alguien lo llena, dos cosas pasan al mismo tiempo:

1. El sistema guarda una copia del contacto (nombre, empresa, teléfono, correo si lo dejó, el servicio que marcó y el mensaje) en la pantalla **Mensajes de contacto**, que se abre desde la tarjeta del mismo nombre en Contenido del sitio o desde el Dashboard.
2. Se abre WhatsApp en el navegador de la persona, con el mensaje ya escrito, listo para que solo tenga que pulsar enviar.

Muchas personas cierran WhatsApp sin pulsar enviar — por eso existe esta pantalla: el contacto queda registrado igual, con su teléfono, aunque el WhatsApp nunca haya llegado.

<!-- captura: bandeja de Mensajes de contacto -->

Esta pantalla es de **solo lectura**: los mensajes no se editan ni se borran. El botón **Responder por WhatsApp** abre una conversación con un saludo ya armado; revísalo antes de enviarlo. (En el Dashboard, donde salen los últimos cinco mensajes, ese mismo botón se llama solo **Responder**.) Si nadie ha escrito, la pantalla dice «Todavía no ha escrito nadie».

## 6. Equipo

Solo administradores y coordinadores ven esta sección.

### Crear una cuenta

1. Entra a **Equipo** y pulsa **Nueva cuenta**.
2. Completa nombre completo, cargo, cédula, teléfono y correo de contacto (estos últimos son opcionales, para ubicar a la persona).
3. Define el **usuario** con el que va a entrar y el **rol**. El usuario se propone solo a partir del nombre; puedes cambiarlo.
4. La **contraseña inicial** puedes dejarla en blanco —el sistema genera una— o escribirla tú (mínimo 10 caracteres). En los dos casos se muestra **una sola vez** al guardar, en el recuadro «Cuenta creada»: usa el botón **Copiar usuario y contraseña** (o **Enviar por WhatsApp**) antes de salir de esa pantalla, porque no se guarda en ningún lado y, si se pierde, hay que restablecerla.

<!-- captura: pantalla de nueva cuenta con el usuario y la contraseña generados -->

### Desactivar una cuenta ≠ eliminarla

- **Desactivar** es el interruptor **¿La cuenta está activa?** dentro de la ficha de la persona. Deja a la persona sin poder entrar desde ese momento, pero conserva su ficha y su historial de jornadas. Es lo correcto cuando alguien sale de la empresa.
- **Eliminar** borra la cuenta y también sus jornadas registradas, de forma permanente. Se usa solo para cuentas de prueba o creadas por error. Lleva **doble confirmación**: primero hay que escribir el usuario exacto de la persona en el campo «Escribe `<usuario>` para confirmar» (el botón **Eliminar definitivamente** sigue deshabilitado hasta que coincida), y después aceptar el aviso del navegador.
- En el listado, cada fila trae **Abrir ficha** y **Desactivar** / **Reactivar**. Para un coordinador, las filas de administradores dicen «Solo un administrador puede editarla».

Cada persona debe tener su propia cuenta: compartir una entre varios hace que las jornadas dejen de decir quién trabajó realmente.

Si abres tu **propia** ficha, puedes cambiar tus datos pero no tu rol ni tu estado, y tu contraseña la cambias desde Mi cuenta, no desde ahí.

### Restablecer la contraseña de otra persona

1. Abre la ficha de la persona desde **Equipo**.
2. En el bloque **Contraseña**, pulsa **Restablecer contraseña**.
3. Confirma el aviso del navegador: la contraseña anterior deja de funcionar de inmediato.
4. El sistema muestra la nueva contraseña una sola vez, en el recuadro «Contraseña restablecida»; entrégasela para que pueda volver a entrar.

## 7. Jornadas para el empleado

Desde tu portal (`/mi-cuenta`) puedes registrar tus horas trabajadas, pensado para hacerse desde el celular en obra.

1. Al terminar el turno, entra a tu portal.
2. En **Registrar jornada**, llena **Fecha del día laboral** —el día en que **empezaste** el turno—, **Hora de inicio** y **Hora de finalización**.
3. Si el turno pasó de la medianoche (por ejemplo, empezaste a las 10:00 p. m. y terminaste a las 2:00 a. m.), marca la casilla **Terminé al día siguiente**. Si no la marcas pero la hora de fin es menor que la de inicio, el sistema entiende igual que cruzó la medianoche y te lo avisa en pantalla.
4. Escribe la orden de trabajo si la tuviste (opcional), la descripción de la labor y, si quieres, observaciones.
5. Revisa el recuadro **Así quedarían estas horas**: se recalcula solo mientras escribes. No es definitivo — las cifras finales las fija tu coordinador al aprobar.
6. Pulsa **Registrar jornada**.

<!-- captura: portal del empleado, formulario de registrar jornada con la vista previa -->

### Tu historial

En **Mis jornadas** ves todas tus jornadas con su estado, y puedes filtrar por **Mes** (desplegable) y por **Estado** (control segmentado: Todas · Pendiente · Aprobada · Rechazada). Cada jornada trae el desplegable **Ver el desglose de horas**. Mientras una jornada está **pendiente**, puedes **editarla** o **eliminarla** (con confirmación) desde ahí mismo. Una vez que se revisó, cualquier corrección la hace tu coordinador.

Los tres estados posibles son:

- **Pendiente**: registrada, esperando revisión. Todavía se puede editar o eliminar.
- **Aprobada**: revisada y aceptada. Su desglose de horas quedó congelado y ya no cambia.
- **Rechazada**: devuelta con una nota para corregirla. **No está eliminada**: el registro se conserva, y la nota de tu coordinador aparece junto a la jornada en tu historial. Regístrala de nuevo con la corrección.

## 8. Jornadas para quien aprueba (coordinador/administrador)

La sección **Jornadas** del panel muestra el registro de horas de todo el equipo.

<!-- captura: listado de Jornadas con los filtros y los totales -->

### Filtros disponibles

Bloque **Filtrar**: Persona («Todo el equipo»), Estado («Todos los estados», Pendiente, Aprobada, Rechazada), Desde, Hasta y Orden de trabajo (coincidencia parcial). Botones **Aplicar filtros** y **Quitar filtros**. Los filtros quedan guardados en el enlace de la página, así que se pueden compartir o volver atrás con el botón del navegador. Los totales de arriba se titulan **Totales del filtro** cuando hay filtros puestos y **Totales de todo el histórico** cuando no.

### Revisar una jornada

Abre la ficha de una jornada pendiente («Revisar») para ver el detalle completo: persona, día, horario, orden de trabajo, labor realizada, observaciones y el desglose de horas.

1. **Aprobar jornada**: acepta el registro tal como está. Al aprobarla, su desglose de horas queda **congelado**: aunque después se corrija el horario del mes, esta jornada ya no cambia.

   **Nadie puede aprobar su propia jornada**, ni siquiera un administrador: si registras tus horas, la revisión se la pide al otro coordinador o al administrador. El sistema lo impide y lo dice en pantalla.

2. **Rechazar con una nota**: pulsa ese botón, escribe el **Motivo del rechazo** (obligatorio, máximo 600 caracteres) y pulsa **Rechazar y devolver**. La jornada vuelve al portal del empleado con tu nota, para que la corrija y la registre de nuevo.

3. **Corregir esta jornada**: el desplegable **Abrir el formulario de corrección** permite cambiar las horas desde la ficha y se guarda con **Guardar la corrección**. Al corregir, la jornada vuelve a quedar pendiente y hay que aprobarla de nuevo.

**Rechazar no es eliminar.** El registro se conserva siempre; rechazar solo lo devuelve con una explicación. Eliminar sí borra la jornada de forma permanente.

Una jornada ya revisada (aprobada o rechazada) se puede **volver a dejar pendiente** con el botón correspondiente, si hubo un error en la revisión. Al reabrir una aprobada se borra su cálculo congelado y hay que aprobarla de nuevo para que vuelva a quedar fija.

### Eliminar (doble confirmación)

1. En la ficha de la jornada, pulsa **Quiero eliminarla**: aparece el botón rojo de verdad.
2. Pulsa **Sí, eliminar definitivamente** y confirma en el aviso del navegador. Solo entonces se borra.

El registro desaparece para todos, también del portal de la persona, y **no se puede deshacer**. Se usa solo para registros de prueba o duplicados; para pedir una corrección, se rechaza.

### Por qué una jornada aprobada no cambia

Al aprobar, el sistema guarda una copia fija («congelada») del desglose de horas con el horario del mes que estaba vigente en ese momento. Si después se corrige el horario de ese mes en **Horarios mensuales**, las jornadas ya aprobadas **no se recalculan**: solo cambian las que todavía estén pendientes. Es lo que asegura que una jornada aprobada no se mueva por accidente.

### Registrar una jornada a nombre de otra persona

Para quien no la registra desde su celular:

1. Entra a **Jornadas** y pulsa **Registrar jornada**.
2. Elige la persona en el campo **¿De quién es esta jornada?**.
3. Completa el resto del formulario igual que en el portal.
4. Al guardar, la jornada queda **pendiente** a nombre de esa persona, visible en su portal, y hay que aprobarla después igual que cualquier otra.

## 9. Horarios mensuales

El horario mensual es el calendario laboral de cada mes: qué días son hábiles, cuáles son festivos y cuál es la jornada esperada cada día. **Sin el horario del mes cargado, el sistema no tiene con qué comparar** para saber qué parte de un turno es hora extra — así que es indispensable mantenerlo al día.

Se administra desde **Jornadas → Administrar horarios**, o desde el enlace **Horarios mensuales** en la pantalla de Equipo.

<!-- captura: editor de horario mensual con la plantilla semanal -->

### Cómo se llena cada mes

1. Elige el mes con las flechas de navegación (← mes anterior / mes siguiente →).
2. Si el mes todavía no tiene horario guardado, el sistema carga el **horario predeterminado** como punto de partida y lo avisa en pantalla. Si el mes anterior sí tiene horario guardado, aparece además el botón **Copiar el horario de {mes} de {año}**, que es la forma más rápida de arrancar. Revísalo siempre.
3. En la tarjeta **Plantilla semanal del mes**, para cada día (lunes a domingo), usa el interruptor **¿Se trabaja?** (Laboral / No laboral) y define **Entrada**, **Salida** y **Almuerzo (horas)**. La columna **Horas de jornada** se calcula sola y abajo va el **Total de horas semanales**. Los atajos **Igualar todos los días laborales** y **Restablecer al horario predeterminado** ahorran trabajo. Hay también un campo **Nota del mes (opcional)**.
4. Los festivos del mes se marcan solos según el calendario colombiano y no se pueden apagar: en un festivo, todo el turno se trata como dominical.
5. Pulsa **Guardar horario**.

Mientras un mes no tenga su horario guardado, las jornadas de ese mes igual se calculan, usando el horario predeterminado como referencia.

### Cómo se calculan las horas

Estas son las reglas que aplica el sistema, las mismas que usa GPI. Todas son **horas trabajadas, nunca dinero**: PIYC no liquida nómina.

1. **Jornada ordinaria del día.** Sale del horario del mes: *salida − entrada − almuerzo*. Con el horario predeterminado son 8,5 h de lunes a jueves y 8 h el viernes (42 h netas a la semana, el máximo legal desde el 15 de julio de 2026).
2. **Horas extra.** Todo lo que exceda esa jornada ordinaria. Los topes legales (2 h al día, 12 h a la semana) **solo sirven de referencia: el sistema nunca recorta ni bloquea un registro**. Lo trabajado siempre queda registrado.
3. **Almuerzo.** El horario dice cuántas horas de almuerzo tiene el día, pero la persona solo registra su entrada y su salida. Por eso: en un día laboral, si el turno **pasa de 6 horas** se descuenta el almuerzo de ese día (normalmente 1 hora); con 6 horas o menos no se descuenta nada; y en un día no laboral tampoco se descuenta. El almuerzo se ubica en el centro del tramo ordinario, que es lo que pasa en la práctica.
4. **Franja nocturna.** De 7:00 p. m. a 6:00 a. m. (art. 160 del CST, modificado por la Ley 2466 de 2025). Es ajustable. Recargos (art. 168 del CST): extra diurna 25 %, extra nocturna 75 %, nocturno no extra 35 %.
5. **Domingos y festivos.** El recargo lo fija la ley según la fecha del turno: 75 % hasta el 30-jun-2025, 80 % desde el 1-jul-2025, 90 % desde el 1-jul-2026 y 100 % desde el 1-jul-2027 (art. 179 del CST, mod. Ley 2466). Ese calendario manda: los tres campos dominicales de `jornada_config` son legado y el cálculo los ignora. Los festivos se calculan solos para cualquier año, con los traslados de la Ley Emiliani e incluido el 9 de julio a partir de 2026 (Ley 2578).
6. **Día no laboral.** Un sábado o cualquier día apagado en el horario del mes no tiene jornada ordinaria: todo el turno se trata como dominical/festivo. Es la convención de GPI y es más favorable que el mínimo legal.
7. **Turnos que cruzan la medianoche.** Cada minuto se clasifica con **su fecha real**, en hora de Colombia. Un turno que entra a un domingo o a un festivo cambia de tratamiento exactamente a las 12:00 a. m.
8. **Duración máxima.** 24 horas. Dos jornadas de la misma persona no se pueden solapar; si ese día ya había otra, el sistema avisa pero no bloquea.
9. **Qué puede editar cada quien.** La persona edita o elimina su jornada **solo mientras esté pendiente**. La orden de trabajo es opcional, la descripción de la labor es obligatoria, y no hay límite de días hacia atrás para registrar.

## 10. Exportar a Excel

Desde **Jornadas**, con los filtros que quieras aplicar, pulsa **Exportar a CSV**; el botón muestra entre paréntesis cuántas jornadas va a exportar. El archivo descargado se llama `jornadas-piyc-` seguido de la fecha, y contiene exactamente las jornadas que estabas viendo en pantalla en ese momento.

<!-- captura: botón "Exportar a CSV" en el listado de jornadas -->

1. Descarga el archivo.
2. Ábrelo haciendo doble clic: está preparado para que Excel en español lo lea bien (tildes, eñes y separadores correctos), así que no hace falta ningún ajuste al abrirlo.

### Qué trae cada columna

- **Identificación**: fecha, persona, cargo, estado, orden de trabajo, entrada, salida, y si el turno terminó al día siguiente.
- **Horas** (todas las columnas de horas son eso — **horas trabajadas, no dinero**; el sistema no calcula pagos ni nómina): presencia total, almuerzo, horas trabajadas, y el desglose completo por tipo — ordinaria diurna, ordinaria nocturna, extra diurna, extra nocturna, dominical/festiva diurna, dominical/festiva nocturna, extra dominical/festiva diurna y extra dominical/festiva nocturna —, además de los totales de ordinarias, extras, nocturnas y dominicales/festivas, y las horas equivalentes con recargo.
- **Contexto del cálculo**: qué festivos tocó el turno y si el cálculo quedó «Congelado al aprobar» o sigue «En vivo» (se recalcula con el horario vigente).
- **Revisión**: quién la revisó y cuándo.
- **Texto**: la labor realizada, las observaciones y la nota de revisión, si la hubo.

Al final del archivo hay una **fila de totales** con la suma de todas las jornadas exportadas.

## 11. Preguntas frecuentes

**Guardé un cambio en el sitio y no lo veo todavía.**
Recarga la página del sitio: lo normal es que ya esté. Si no, espera unos minutos (el sitio se regenera como máximo cada cinco) y revisa que hayas pulsado «Guardar» en el bloque correcto: cada tarjeta tiene su propio botón y guarda solo lo suyo.

**Quiero cambiar una frase del sitio y no encuentro dónde.**
Todas las frases están en alguna pantalla de **Contenido del sitio**. Si es de la portada, en Página de inicio; si es de Servicios, Proyectos o Contacto, en **Textos de las páginas**; si sale igual en todas las fichas de caso o de servicio, está en esa misma pantalla, en el último bloque. Los datos de contacto —dirección, teléfonos, correo— van en Datos de contacto y buscadores.

**No puedo crear una cuenta nueva en Equipo.**
Puede que falte una configuración del servidor. Avisa a soporte (GOCAS): sin ella se pueden ver y editar cuentas existentes, pero no crear otras nuevas ni restablecer contraseñas.

**Rechacé una jornada por error, ¿se perdió?**
No. Rechazar nunca elimina: el registro sigue existiendo y la persona lo ve en su historial con tu nota. Si el error fue tuyo, puedes volver a dejarla pendiente desde la ficha de la jornada.

**Aprobé una jornada por error.**
Desde la ficha de la jornada, usa **Volver a dejarla pendiente**. Se borra el cálculo congelado y puedes corregirla y volver a aprobarla.

**Subí una foto y el panel dice que pesa demasiado.**
El panel ya la comprimió todo lo posible sin que se vea mal. Recórtala o redúcela a 1920 píxeles de ancho con una herramienta gratuita como squoosh.app y vuelve a subirla.

**¿Por qué el formulario de contacto no me manda un correo cuando alguien escribe?**
Porque no está diseñado para eso: abre WhatsApp con el mensaje listo y además guarda una copia en **Mensajes de contacto**. Revisa esa pantalla regularmente, sobre todo si nadie te ha escrito por WhatsApp en unos días.

**¿A quién le escribo si algo falla?**
Contacta a soporte técnico: **GOCAS**, el equipo que desarrolló y mantiene el sitio.
