import { configureStore } from "@reduxjs/toolkit";
import devToolsEnhancer from "remote-redux-devtools";

import projectFilesReducer from "./ProjectFilesSlice";
import openFilesReducer from "./OpenFilesSlice";
import windowBlurReducer from "./BlurSlice";
import contextMenuReducer from "./ContextMenuSlice";

export const store = configureStore({
    reducer: {
        projectFiles: projectFilesReducer,
        openFiles: openFilesReducer,
        blur: windowBlurReducer,
        contextMenu: contextMenuReducer
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

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
