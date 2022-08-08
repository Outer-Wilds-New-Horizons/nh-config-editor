import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { dialog } from "@tauri-apps/api";
import { initialLoadState, LoadStatus } from "./LoadState";
import { debugBuild, releaseBuild } from "./ProjectFilesSlice";
import { RootState } from "./Store";

const buildErrorMessage = (error: string) => {
    dialog.message(`There was an error building the project: ${error}`, {
        title: "Error",
        type: "error"
    });
};

// Uses LoadState, but status should never be set to "done"
const blurSlice = createSlice({
    name: "blur",
    initialState: {
        status: "loading",
        error: "Unknown Error"
    },
    reducers: {
        setStatus: (state, action: PayloadAction<LoadStatus>) => {
            state.status = action.payload;
        },
        showError: (state, action: PayloadAction<string>) => {
            state.error = action.payload;
            state.status = "error";
        },
        setError: (state, action: PayloadAction<string>) => {
            state.error = action.payload;
        },
        reset: (state) => {
            state.status = initialLoadState.status;
            state.error = initialLoadState.error;
        }
    },
    extraReducers: (builder) => {
        builder.addCase(debugBuild.pending, (state) => {
            state.status = "loading";
        });
        builder.addCase(debugBuild.fulfilled, (state) => {
            state.status = "idle";
        });
        builder.addCase(debugBuild.rejected, (state, action) => {
            state.status = "idle";
            buildErrorMessage(action.error.message ?? "Unknown Error");
        });
        builder.addCase(releaseBuild.pending, (state) => {
            state.status = "loading";
        });
        builder.addCase(releaseBuild.fulfilled, (state) => {
            state.status = "idle";
        });
        builder.addCase(releaseBuild.rejected, (state, action) => {
            state.status = "idle";
            buildErrorMessage(action.error.message ?? "Unknown Error");
        });
    }
});

const { setStatus, showError, setError, reset } = blurSlice.actions;
const selectBlurStatus = (state: RootState) => state.blur.status;
const selectBlurError = (state: RootState) => state.blur.error;

export const windowBlur = {
    setStatus,
    showError,
    setError,
    reset,
    selectBlurStatus,
    selectBlurError
};

export default blurSlice.reducer;
