import type { Metadata } from "next";
import { HeroInicio } from "@/components/inicio/HeroInicio";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Inicio() {
  return (
    <main id="contenido">
      <HeroInicio />
    </main>
  );
}
