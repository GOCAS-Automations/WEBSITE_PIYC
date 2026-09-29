import {
  AyudaDesplegable,
  Campo,
  Interruptor,
  Selector,
  Tarjeta,
  TituloTarjeta,
} from "@/components/admin/ui";
import { AYUDA_USUARIO, USUARIO_MAX } from "@/lib/usuarios";
import {
  ETIQUETA_ROL,
  ROLES,
  puedeAsignarRol,
  type UserRole,
} from "@/lib/supabase/roles";
import { PASSWORD_MINIMO, type PerfilRow } from "@/lib/admin-types";

/**
 * CAMPOS DE UNA CUENTA — Server Component.
 * Lo envuelve `FormularioCuenta`, que es el de cliente.
 *
 * Los roles que se ofrecen dependen de QUIÉN está editando: un coordinador solo
 * ve «Empleado» en la lista. Eso es comodidad, no seguridad — la barrera real
 * está en la server action (`puedeAsignarRol`) y en el trigger
 * `profiles_proteger` de la base.
 */
export function CamposCuenta({
  cuenta,
  actor,
  esUnoMismo = false,
}: {
  cuenta?: PerfilRow;
  /** Rol de quien está usando el panel. */
  actor: UserRole;
  esUnoMismo?: boolean;
}) {
  // El rol que la cuenta ya tiene va siempre en la lista aunque quien edita no
  // pueda asignarlo (su propia ficha, por ejemplo): un `<select>` sin su propio
  // valor se pintaría con otro rol y confundiría.
  const asignables = ROLES.filter((rol) => puedeAsignarRol(actor, rol));
  const actual: UserRole = cuenta?.role ?? "empleado";
  const opcionesRol = (
    asignables.includes(actual) ? asignables : [actual, ...asignables]
  ).map((rol) => ({ value: rol, label: ETIQUETA_ROL[rol] }));

  return (
    <>
      {cuenta && <input type="hidden" name="id" value={cuenta.id} />}

      <Tarjeta>
        <TituloTarjeta
          title="Quién es"
          description="El nombre se usa en el panel, en el portal y en los listados de jornadas."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo
            label="Nombre completo"
            name="full_name"
            required
            maxLength={120}
            defaultValue={cuenta?.full_name}
            placeholder="Juan Pérez Gómez"
          />
          <Campo
            label="Cargo"
            name="cargo"
            maxLength={80}
            defaultValue={cuenta?.cargo}
            placeholder="Técnico electricista"
          />
          <Campo
            label="Cédula"
            name="cedula"
            maxLength={20}
            defaultValue={cuenta?.cedula}
            placeholder="1.144.000.000"
            hint="Solo para identificar a la persona en los registros internos. No se publica en ninguna parte."
          />
          <Campo
            label="Teléfono"
            name="phone"
            type="tel"
            maxLength={30}
            defaultValue={cuenta?.phone}
            placeholder="+57 321 000 0000"
          />
          <Campo
            label="Correo de contacto"
            name="email_contacto"
            type="email"
            maxLength={160}
            defaultValue={cuenta?.email_contacto}
            placeholder="juan.perez@gmail.com"
            hint="El correo real de la persona, si lo tiene. Es informativo: NO sirve para iniciar sesión, y puede quedar vacío."
            className="sm:col-span-2"
          />
        </div>
      </Tarjeta>

      <Tarjeta>
        <TituloTarjeta
          title="Cómo entra al portal"
          description="El usuario es la identidad de la cuenta y no se puede cambiar después."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          {cuenta ? (
            <Campo
              label="Usuario"
              name="username_visible"
              readOnly
              defaultValue={cuenta.username ?? cuenta.email}
              hint="El usuario no se cambia. Si hace falta otro, se crea una cuenta nueva y se elimina esta."
            />
          ) : (
            <Campo
              label="Usuario"
              name="username"
              required
              maxLength={USUARIO_MAX}
              placeholder="jperez"
              hint={AYUDA_USUARIO}
            />
          )}

          {/* Un `<select disabled>` no envía nada: sin este oculto, guardar la
              propia ficha mandaría el rol vacío y el servidor lo leería como
              «Empleado». */}
          {esUnoMismo && <input type="hidden" name="role" value={actual} />}

          <Selector
            label="Rol"
            name="role"
            defaultValue={actual}
            options={opcionesRol}
            disabled={esUnoMismo}
            hint={
              esUnoMismo
                ? "No puedes cambiar tu propio rol: pídeselo a otro administrador."
                : "Decide qué puede hacer la persona. Ante la duda, «Empleado»."
            }
          />

          {!cuenta && (
            <Campo
              label="Contraseña inicial"
              name="password"
              type="text"
              maxLength={72}
              placeholder={`Déjalo vacío y el panel genera una (mínimo ${PASSWORD_MINIMO} caracteres)`}
              hint={`Si prefieres ponerla tú, usa al menos ${PASSWORD_MINIMO} caracteres. En los dos casos la verás una sola vez al guardar, así que cópiala antes de cerrar.`}
              className="sm:col-span-2"
            />
          )}

          {cuenta && (
            <div className="sm:col-span-2">
              <Interruptor
                label="¿La cuenta está activa?"
                name="active"
                defaultChecked={cuenta.active}
                onLabel="Activa"
                offLabel="Desactivada"
                hint={
                  esUnoMismo
                    ? "No puedes desactivar tu propia cuenta."
                    : "Desactivar NO borra nada: la persona deja de poder entrar, pero su ficha y sus registros se conservan. Es lo que hay que hacer cuando alguien sale de la empresa."
                }
              />
            </div>
          )}
        </div>

        <AyudaDesplegable label="¿Qué puede hacer cada rol?" className="mt-5">
          <ul className="space-y-2">
            <li>
              <strong>Administrador.</strong> Todo: contenido del sitio, cuentas
              (incluidas las de otros administradores) y jornadas.
            </li>
            <li>
              <strong>Coordinador.</strong> Lo mismo en contenido y jornadas,
              pero en Equipo solo cuentas de <strong>empleado</strong>: las de
              administrador y las de otro coordinador las ve, y nada más —no las
              crea, no las edita, no las desactiva, no las elimina y no les
              restablece la contraseña.
            </li>
            <li>
              <strong>Empleado.</strong> Solo su portal: registrar sus jornadas,
              ver su historial y cambiar su contraseña. No entra al panel.
            </li>
          </ul>
          <p className="mt-2">
            Nadie puede cambiarse el rol a sí mismo ni desactivar su propia
            cuenta: así nunca se queda el sistema sin ningún administrador con
            acceso.
          </p>
        </AyudaDesplegable>
      </Tarjeta>
    </>
  );
}
