import { configureStore } from "@reduxjs/toolkit";
import devToolsEnhancer from "remote-redux-devtools";

import projectFilesReducer from "./ProjectFile";
import openFilesReducer from "./OpenFiles";

export const store = configureStore({
    reducer: {
        projectFiles: projectFilesReducer,
        openFiles: openFilesReducer
    },
    enhancers: import.meta.env.DEV
        ? [devToolsEnhancer({ realtime: import.meta.env.DEV, hostname: "localhost", port: 8000 })]
        : []
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
