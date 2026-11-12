import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/", // Vercel phục vụ từ domain gốc, không dùng "./"
});
