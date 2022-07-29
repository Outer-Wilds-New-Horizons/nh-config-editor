// noinspection JSUnusedGlobalSymbols

import react from "@vitejs/plugin-react";
import { createHtmlPlugin } from "vite-plugin-html";
import vitePluginString from "vite-plugin-string";
import { defineConfig } from "vite";

// We have node here, so we can use the process module
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const inDebug = process.env.NODE_ENV === "development";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        vitePluginString({
            include: ["**/*.xsd"]
        }),
        createHtmlPlugin({
            minify: true,
            template: "index.html",

            inject: {
                data: {
                    reactDevTools: inDebug ? '<script src="http://localhost:8097"></script>' : "",
                    reduxDevToolsPatch: inDebug
                        ? "<script>var global = global || window;</script>"
                        : ""
                }
            }
        })
    ],
    build: {
        target: ["edge89", "firefox89", "chrome89", "safari15"]
    }
});
