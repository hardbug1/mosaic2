import { defineConfig } from "vitest/config";
import { config } from "dotenv";
import { fileURLToPath } from "node:url";
config({ path: ".env.local" });

export default defineConfig({
  resolve: {
    // `@/...` 경로 별칭을 런타임에도 해석 (런타임 import 추가로 필요해짐)
    alias: { "@": fileURLToPath(new URL(".", import.meta.url)) },
  },
  test: { environment: "node", include: ["**/*.test.ts"] },
});
