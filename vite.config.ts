// noinspection JSUnusedGlobalSymbols

import react from "@vitejs/plugin-react";
import vitePluginString from "vite-plugin-string";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        vitePluginString({
            include: ["**/*.xsd"]
        })
    ],
    build: {
        target: ["edge89", "firefox89", "chrome89", "safari15"]
    }
});
