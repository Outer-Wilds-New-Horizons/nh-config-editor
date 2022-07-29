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
        DEV: boolean;
    };
}

declare module "remote-redux-devtools" {
    import { StoreEnhancer } from "@reduxjs/toolkit";
    const value: (object) => StoreEnhancer;
    export = value;
}
