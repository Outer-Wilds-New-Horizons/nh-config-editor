import { configureStore } from "@reduxjs/toolkit";
import devToolsEnhancer from "remote-redux-devtools";

import projectFilesReducer from "./ProjectFilesSlice";
import openFilesReducer from "./OpenFilesSlice";
import windowBlurReducer from "./BlurSlice";
import contextMenuReducer from "./ContextMenuSlice";
import projectReducer from "./ProjectSlice";
import schemaReducer from "./SchemaSlice";

export const setupStore = () =>
    configureStore({
        reducer: {
            projectFiles: projectFilesReducer,
            openFiles: openFilesReducer,
            blur: windowBlurReducer,
            contextMenu: contextMenuReducer,
            project: projectReducer,
            schema: schemaReducer
        },
        enhancers:
            import.meta.env.NODE_ENV === "development"
                ? [
                      devToolsEnhancer({
                          realtime: import.meta.env.NODE_ENV === "development",
                          hostname: "localhost",
                          port: 8000
                      })
                  ]
                : []
    });

export type AppStore = ReturnType<typeof setupStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
