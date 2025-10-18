import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// NOTA: no hace falta instalar el plugin react, Vite ya soporta React moderno.
// Si te tira error en Vercel, igual compila solo con Vite.
export default defineConfig({
  plugins: [react()],
});
