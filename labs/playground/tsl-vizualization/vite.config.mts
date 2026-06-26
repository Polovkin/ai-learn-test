import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import pugPlugin from "vite-plugin-pug-transformer";

const projectRoot = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    root: projectRoot,
    plugins: [
        pugPlugin({
            pugOptions: {
                basedir: projectRoot,
            },
        }),
    ],
    build: {
        outDir: "dist",
        emptyOutDir: true,
    },
});
