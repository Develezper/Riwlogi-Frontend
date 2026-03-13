import { defineConfig, loadEnv } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const devApiTarget = (env.VITE_DEV_API_TARGET || "http://localhost:8000").trim();

  return {
    plugins: [tailwindcss()],
    server: {
      proxy: {
        "/api": {
          target: devApiTarget,
          changeOrigin: true,
        },
      },
    },
  };
});
