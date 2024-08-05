import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import linaria from "@wyw-in-js/vite";
import checker from "vite-plugin-checker";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
  base: '',
  build: {
    assetsInlineLimit: 0
  },
  plugins: [
    tsconfigPaths(),
    linaria({
      include: ["**/*.{ts,tsx}"],
      babelOptions: {
        presets: ["@babel/preset-typescript", "@babel/preset-react"],
      },
    }),
    checker({
      biome: {},
    }),
    react(),
  ],
});
