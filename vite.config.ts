// noinspection JSUnusedGlobalSymbols

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    build: {
        target: ["edge89", "firefox89", "chrome89", "safari15"]
    }
});
