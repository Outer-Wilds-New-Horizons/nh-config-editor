import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { defaultProjectSettings, loadProjectFromURLParams, Project } from "../../Common/Project";
import { initialLoadState, LoadState } from "./LoadState";
import { switchBranch } from "./SchemaSlice";

export type ProjectSliceState = Project & LoadState;

export const loadProject = createAsyncThunk("project/loadProject", async (payload, thunkAPI) => {
    const project = await loadProjectFromURLParams();
    thunkAPI.dispatch(switchBranch(project.settings.schemaBranch));
    return project;
});

const projectSlice = createSlice({
    name: "project",
    initialState: {
        ...initialLoadState,
        path: "",
        name: "",
        uniqueName: "",
        valid: false,
        settings: defaultProjectSettings
    } as ProjectSliceState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(loadProject.pending, (state) => {
            state.status = "loading";
        });
        builder.addCase(loadProject.fulfilled, (state, action) => {
            state.path = action.payload.path;
            state.name = action.payload.name;
            state.uniqueName = action.payload.uniqueName;
            state.valid = action.payload.valid;
            state.status = "done";
        });
        builder.addCase(loadProject.rejected, (state, action) => {
            state.status = "error";
            state.error = `Failed to load project: ${action.error.message ?? "Unknown Error"}`;
        });
    }
});

export default projectSlice.reducer;
