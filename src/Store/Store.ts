import { configureStore } from "@reduxjs/toolkit";

import projectFilesReducer from "./ProjectFile";
import openFilesReducer from "./OpenFiles";

export const store = configureStore({
    reducer: {
        projectFiles: projectFilesReducer,
        openFiles: openFilesReducer
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
