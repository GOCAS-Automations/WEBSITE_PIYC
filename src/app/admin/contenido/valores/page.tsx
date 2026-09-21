import { requireContentEditor } from "@/lib/supabase/auth";
import { listValores } from "@/lib/admin/lecturas";
import {
  AreaTexto,
  AYUDA_ORDEN,
  AYUDA_VISIBILIDAD,
  AvisoGuardar,
  AyudaSeccion,
  CabeceraPanel,
  Campo,
  EstadoVacio,
  InsigniaPublicado,
  Interruptor,
  Selector,
  Tarjeta,
  TituloTarjeta,
} from "@/components/admin/ui";
import { FormularioAdmin, FormularioEliminar } from "@/components/admin/FormularioAdmin";
import { eliminarValor, guardarValor } from "../actions";
import { CLAVES_ICONO_VALOR } from "@/lib/content-types";
import type { ValorRow } from "@/lib/admin-types";

export const dynamic = "force-dynamic";

const OPCIONES_ICONO = [
  { value: "", label: "Sin icono" },
  ...CLAVES_ICONO_VALOR.map((clave) => ({ value: clave, label: clave })),
];

/**
 * VALORES CORPORATIVOS
 * ====================
 * Son cuatro o cinco frases cortas: no merecen una pantalla por cada una. Todo
 * se edita aquí mismo, un bloque por valor más el de «agregar», y cada bloque
 * tiene su propio botón (de ahí el `AvisoGuardar` sin `unico`).
 */
export default async function ValoresPage() {
  await requireContentEditor();
  const valores = await listValores();

  return (
    <>
      <CabeceraPanel
        title="Valores corporativos"
        description="Los principios de PIYC. Se muestran en la portada y en la página Nosotros."
        backHref="/admin/contenido"
        backLabel="Volver a Contenido"
        breadcrumb={[
          { label: "Panel", href: "/admin" },
          { label: "Contenido del sitio", href: "/admin/contenido" },
          { label: "Valores" },
        ]}
      />

      <AvisoGuardar />

      <AyudaSeccion className="mb-6">
        Funcionan mejor pocos y concretos: entre tres y cinco, con una frase que
        diga qué significa ese valor en el trabajo del día a día, no la
        definición del diccionario. {AYUDA_VISIBILIDAD}
      </AyudaSeccion>

      <div className="space-y-6">
        {valores.length === 0 ? (
          <EstadoVacio
            title="Todavía no hay valores"
            description="Agrega el primero con el formulario de abajo."
          />
        ) : (
          valores.map((valor) => <BloqueValor key={valor.id} valor={valor} />)
        )}

        <Tarjeta className="border-azul-300">
          <TituloTarjeta
            title="Agregar un valor"
            description="Se añade al final de la lista; luego puedes cambiarle el orden."
          />
          <FormularioAdmin action={guardarValor} submitLabel="Agregar valor">
            <CamposValor scope="nuevo" siguienteOrden={valores.length + 1} />
          </FormularioAdmin>
        </Tarjeta>
      </div>
    </>
  );
}

function BloqueValor({ valor }: { valor: ValorRow }) {
  return (
    <Tarjeta>
      <TituloTarjeta
        title={valor.title}
        description={`Orden ${valor.sort}`}
        action={
          <div className="flex items-center gap-3">
            <InsigniaPublicado published={valor.published} />
            <FormularioEliminar
              action={eliminarValor}
              id={valor.id}
              confirmMessage={`¿Eliminar el valor «${valor.title}»?\n\nEs permanente. Si solo quieres retirarlo del sitio, cancela y ponlo en «Oculto».`}
            />
          </div>
        }
      />
      <FormularioAdmin action={guardarValor}>
        <input type="hidden" name="id" value={valor.id} />
        <CamposValor scope={valor.id} valor={valor} />
      </FormularioAdmin>
    </Tarjeta>
  );
}

function CamposValor({
  valor,
  scope,
  siguienteOrden = 0,
}: {
  valor?: ValorRow;
  scope: string;
  siguienteOrden?: number;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Campo
        label="Nombre del valor"
        name="title"
        scope={scope}
        required
        maxLength={80}
        defaultValue={valor?.title}
        placeholder="Compromiso"
      />
      <Selector
        label="Icono"
        name="icon_key"
        scope={scope}
        defaultValue={valor?.icon_key ?? ""}
        options={OPCIONES_ICONO}
      />
      <AreaTexto
        label="Qué significa"
        name="description"
        scope={scope}
        rows={3}
        defaultValue={valor?.description}
        placeholder="Entregamos cuando dijimos que íbamos a entregar, y si algo se atrasa lo avisamos antes de que el cliente lo note."
        hint="Una o dos frases, en primera persona del plural y con un ejemplo concreto."
        className="sm:col-span-2"
      />
      <Campo
        label="Orden"
        name="sort"
        scope={scope}
        type="number"
        defaultValue={valor?.sort ?? siguienteOrden}
        hint={AYUDA_ORDEN}
      />
      <Interruptor
        label="¿Se muestra en el sitio?"
        name="published"
        defaultChecked={valor?.published ?? true}
      />
    </div>
  );
}
