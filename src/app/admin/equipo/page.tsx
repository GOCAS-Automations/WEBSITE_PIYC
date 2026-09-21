import Link from "next/link";
import { requireManager } from "@/lib/supabase/auth";
import { listPerfiles } from "@/lib/admin/lecturas";
import { ETIQUETA_ROL, puedeGestionarRol } from "@/lib/supabase/roles";
import { isServiceRoleConfigured } from "@/lib/supabase/admin";
import { leerPagina, paginar } from "@/lib/paginacion";
import {
  AyudaDesplegable,
  AyudaSeccion,
  CabeceraPanel,
  EnlacePrimario,
  EstadoVacio,
  Insignia,
  Paginacion,
} from "@/components/admin/ui";
import { BotonAccion } from "@/components/admin/FormularioAdmin";
import { alternarActiva } from "./actions";
import {
  IconoCalendario,
  IconoLapiz,
  IconoMas,
  IconoUsuario,
} from "@/components/admin/iconos";

export const dynamic = "force-dynamic";

/**
 * EQUIPO — listado de cuentas
 * ===========================
 * Tercera entrada del menú. Solo para managers (`requireManager`).
 *
 * Las cuentas se leen con el cliente de SESIÓN: la RLS de `profiles` ya deja a
 * un manager verlas todas, así que aquí NO hace falta la service-role (la regla
 * 3 es para las pantallas que le muestran compañeros a quien no es manager).
 */
export default async function EquipoPage({
  searchParams,
}: {
  searchParams: Promise<{ pagina?: string }>;
}) {
  const { profile } = await requireManager();
  const cuentas = await listPerfiles();
  const pagina = paginar(cuentas, leerPagina((await searchParams).pagina));
  const puedeCrear = isServiceRoleConfigured();

  return (
    <>
      <CabeceraPanel
        title="Equipo"
        description="Las cuentas con las que el personal de PIYC entra al portal y al panel."
        breadcrumb={[{ label: "Panel", href: "/admin" }, { label: "Equipo" }]}
        action={
          puedeCrear ? (
            <EnlacePrimario href="/admin/equipo/nueva">
              <IconoMas className="h-4 w-4" />
              Nueva cuenta
            </EnlacePrimario>
          ) : undefined
        }
      />

      {!puedeCrear && (
        <AyudaSeccion tono="aviso" title="No se pueden crear cuentas ahora mismo" className="mb-6">
          Falta la clave de servicio en el servidor (
          <span className="font-mono text-xs">SUPABASE_SERVICE_ROLE_KEY</span>).
          Sin ella se pueden ver y editar las cuentas existentes, pero no crear,
          restablecer contraseñas ni eliminar. Cárgala y vuelve a desplegar:
          cargarla no basta.
        </AyudaSeccion>
      )}

      <AyudaSeccion className="mb-4">
        Cuando alguien sale de la empresa, <strong>desactiva</strong> su cuenta
        en lugar de eliminarla: deja de poder entrar en ese mismo momento, pero
        su ficha y sus jornadas se conservan. Eliminar borra también su
        historial y no se puede deshacer.
      </AyudaSeccion>

      <AyudaDesplegable label="¿Qué puede hacer cada rol?" className="mb-6">
        <ul className="space-y-2">
          <li>
            <strong>Administrador.</strong> Todo: contenido, cuentas y jornadas.
          </li>
          <li>
            <strong>Coordinador.</strong> Lo mismo, menos tocar cuentas de
            administrador.
          </li>
          <li>
            <strong>Empleado.</strong> Solo su portal: sus jornadas y su
            contraseña.
          </li>
        </ul>
      </AyudaDesplegable>

      {cuentas.length === 0 ? (
        <EstadoVacio
          title="No hay cuentas todavía"
          description="Crea la primera. Cada persona entra con su propio usuario: nunca se comparte una cuenta entre varias, porque entonces las jornadas dejan de decir quién trabajó."
          action={
            puedeCrear ? (
              <EnlacePrimario href="/admin/equipo/nueva">
                <IconoMas className="h-4 w-4" />
                Crear cuenta
              </EnlacePrimario>
            ) : undefined
          }
        />
      ) : (
        <>
          <ul id="lista-cuentas" className="scroll-mt-8 space-y-3">
            {pagina.visibles.map((cuenta) => {
              const gestionable = puedeGestionarRol(profile.role, cuenta.role);
              const esUnoMismo = cuenta.id === profile.id;
              return (
                <li
                  key={cuenta.id}
                  className={`flex flex-wrap items-center gap-4 rounded-fino border bg-blanco p-4 ${
                    cuenta.active ? "border-acero-200" : "border-acero-300 bg-acero-50"
                  }`}
                >
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-fino border border-acero-200 bg-acero-50 text-azul-700">
                    <IconoUsuario className="h-5 w-5" />
                  </span>

                  {/* `min-w-0` dejaba que esta columna se encogiera por debajo
                      de lo que miden las insignias: a 390 px se desbordaban por
                      la derecha y el botón «Desactivar» quedaba encima del chip
                      del rol. Con un mínimo real, el `flex-wrap` del `li` hace
                      lo suyo y los botones bajan a su propia línea. */}
                  <div className="min-w-[12rem] flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-titulo text-lg font-semibold uppercase tracking-wide text-azul-950">
                        {cuenta.full_name}
                      </h2>
                      <Insignia
                        className={
                          cuenta.role === "admin"
                            ? "border-azul-300 bg-azul-50 text-azul-800"
                            : "border-acero-300 bg-acero-50 text-acero-600"
                        }
                      >
                        {ETIQUETA_ROL[cuenta.role]}
                      </Insignia>
                      {!cuenta.active && (
                        <Insignia className="border-error-300 bg-error-50 text-error-700">
                          Desactivada
                        </Insignia>
                      )}
                      {esUnoMismo && (
                        <Insignia className="border-verde-300 bg-verde-100 text-verde-700">
                          Eres tú
                        </Insignia>
                      )}
                    </div>
                    <p className="mt-0.5 text-sm text-acero-600">
                      <span className="font-mono text-xs">
                        {cuenta.username ?? cuenta.email}
                      </span>
                      {cuenta.cargo && <> · {cuenta.cargo}</>}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {gestionable && !esUnoMismo && (
                      <BotonAccion
                        action={alternarActiva}
                        campos={{ id: cuenta.id, active: cuenta.active ? "false" : "true" }}
                        label={cuenta.active ? "Desactivar" : "Reactivar"}
                        pendingLabel="Un momento…"
                        confirmar={
                          cuenta.active
                            ? `Al desactivar la cuenta, ${cuenta.full_name} deja de poder entrar al portal de inmediato.\n\nSus datos y sus jornadas se conservan: esto es reversible.\n\n¿Continuamos?`
                            : undefined
                        }
                      />
                    )}
                    {gestionable ? (
                      <Link
                        prefetch={false}
                        href={`/admin/equipo/${cuenta.id}`}
                        className="inline-flex items-center gap-1.5 rounded-fino bg-azul-700 px-3 py-2 text-xs font-semibold text-blanco transition-colors hover:bg-azul-800"
                      >
                        <IconoLapiz className="h-3.5 w-3.5" />
                        Abrir ficha
                      </Link>
                    ) : (
                      <span className="text-xs text-acero-600">
                        Solo un administrador puede editarla
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
          <Paginacion
            pagina={pagina.pagina}
            total={pagina.total}
            hrefBase="/admin/equipo"
            ancla="lista-cuentas"
            etiqueta="Páginas de cuentas"
          />
        </>
      )}

      {/* Enlace a Horarios mensuales — lo construye el agente de jornadas. */}
      <div className="mt-8 rounded-fino border border-acero-200 bg-blanco p-5">
        <h2 className="font-titulo text-xl font-semibold uppercase tracking-wide text-azul-950">
          Horarios mensuales
        </h2>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-acero-600">
          El calendario laboral de cada mes —qué días son hábiles y cuál es la
          jornada esperada— es lo que permite calcular los recargos de las
          jornadas. Se administra junto con el módulo de jornadas.
        </p>
        <Link
          prefetch={false}
          href="/admin/jornadas/horarios"
          className="mt-4 inline-flex items-center gap-2 rounded-fino border border-acero-300 bg-blanco px-4 py-2.5 text-sm font-semibold text-acero-700 transition-colors hover:border-azul-700 hover:text-azul-700"
        >
          <IconoCalendario className="h-4 w-4" />
          Ir a Horarios mensuales
        </Link>
      </div>
    </>
  );
}
