export type EnlaceNavegacion = {
  href: string;
  etiqueta: string;
};

/** Navegación principal del sitio público. */
export const navegacionPrincipal: readonly EnlaceNavegacion[] = [
  { href: "/", etiqueta: "Inicio" },
  { href: "/nosotros", etiqueta: "Nosotros" },
  { href: "/servicios", etiqueta: "Servicios" },
  { href: "/proyectos", etiqueta: "Proyectos" },
  { href: "/contacto", etiqueta: "Contacto" },
];
