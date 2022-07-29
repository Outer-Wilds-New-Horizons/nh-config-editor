// / <reference types="vite/client" />
// noinspection JSFileReferences

// Allows importing of images
declare module "*.png" {
    const value: string;
    export = value;
}

// Allows importing of xsd files
declare module "*.xsd" {
    const value: string;
    export = value;
}

declare interface ImportMeta {
    env: {
        NODE_ENV: "prod" | "development" | "test";
    };
}

declare module "remote-redux-devtools" {
    import { StoreEnhancer } from "@reduxjs/toolkit";
    const value: (object) => StoreEnhancer;
    export = value;
}
