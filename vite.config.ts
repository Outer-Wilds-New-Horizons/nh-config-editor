// / <reference types="vitest" />
// noinspection JSUnusedGlobalSymbols

import react from "@vitejs/plugin-react";
import { createHtmlPlugin } from "vite-plugin-html";
import vitePluginString from "vite-plugin-string";
import { defineConfig } from "vite";

// noinspection JSClassNamingConvention,JSUnusedLocalSymbols
declare interface process {
    env: {
        VITEST: boolean;
        NODE_ENV: "development" | "prod" | "test";
    };
}

const inDebug = !process.env.VITEST && process.env.NODE_ENV === "development";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        vitePluginString({
            include: ["**/*.xsd"]
        }),
        !process.env.VITEST &&
            createHtmlPlugin({
                minify: true,
                template: "index.html",
                inject: {
                    data: {
                        reactDevTools: inDebug
                            ? '<script src="http://localhost:8097"></script>'
                            : "",
                        // This patch is used bc the websocket stuff looks
                        // for a variable called global and expects the window
                        // to be there; in production we don't have to worry about it though.
                        reduxDevToolsPatch: inDebug
                            ? "<script>var global = global || window;</script>"
                            : ""
                    }
                }
            })
    ],
    envPrefix: "NODE_",
    test: {
        setupFiles: ["./test/Setup.ts"],
        environment: "jsdom",
        deps: {
            inline: ["monaco-editor"]
        },
        // Monaco is the bane of my existence.
        alias: {
            "monaco-editor": "monaco-editor/monaco.d.ts"
        }
    }
});
