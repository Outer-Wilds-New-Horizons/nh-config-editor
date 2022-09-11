import {
    createAsyncThunk,
    createEntityAdapter,
    createSelector,
    createSlice
} from "@reduxjs/toolkit";
import { dialog } from "@tauri-apps/api";
import { sep } from "@tauri-apps/api/path";
import { SettingsManager } from "../../Common/AppData/Settings";
import { getModManagerSettings } from "../../Common/ModManager";
import { debugBuildProject, Project } from "../../Common/Project";
import { tauriCommands } from "../../Common/TauriCommands";
import { initialLoadState, LoadState } from "./LoadState";
import { getParentDirectory } from "./FileUtils";
import { forceCloseTab } from "./OpenFilesSlice";

const compareItems = (a: ProjectFile, b: ProjectFile): number => {
    if (a.isFolder && !b.isFolder) {
        return -1;
    } else if (!a.isFolder && b.isFolder) {
        return 1;
    } else {
        return a.name.localeCompare(b.name);
    }
};

export const loadProjectFiles = createAsyncThunk(
    "projectFiles/loadProject",
    tauriCommands.walkProject
);

export const debugBuild = createAsyncThunk(
    "projectFiles/debugBuild",
    async (payload: { project: Project }) => {
        const managerSettings = await getModManagerSettings();
        const outputPath = `${managerSettings.owmlPath}${sep}Mods`;
        await debugBuildProject(payload.project, outputPath);
    }
);

export const releaseBuild = createAsyncThunk(
    "projectFiles/releaseBuild",
    async (payload: { project: Project }, thunkAPI) => {
        const { minify } = await SettingsManager.get();
        await tauriCommands.buildProject(
            payload.project.path,
            `${payload.project.uniqueName}.zip`,
            minify
        );
        thunkAPI.dispatch(invalidate());
    }
);
export const deleteFile = createAsyncThunk(
    "projectFiles/deleteFile",
    async (payload: ProjectFile, thunkAPI) => {
        const result = await dialog.ask(`Are you sure you want to delete ${payload.name}?`, {
            type: "warning",
            title: "Delete file"
        });
        if (result) {
            if (payload.isFolder) {
                await tauriCommands.deleteDirectory(payload.absolutePath);
            } else {
                await tauriCommands.deleteFile(payload.absolutePath);
            }
            thunkAPI.dispatch(invalidate());
            thunkAPI.dispatch(forceCloseTab(payload.relativePath));
        }
    }
);

// Should be kept in sync with the struct in commands.rs:56
export type ProjectFile = {
    name: string;
    relativePath: string;
    absolutePath: string;
    extension: string;
    isFolder: boolean;
};

const projectFilesAdapter = createEntityAdapter<ProjectFile>({
    sortComparer: compareItems,
    selectId: (file: ProjectFile) => file.relativePath
});

type ProjectFilesSliceState = ReturnType<typeof projectFilesAdapter.getInitialState> & LoadState;

const initialState = projectFilesAdapter.getInitialState(initialLoadState);

const projectFilesSlice = createSlice({
    name: "projectFiles",
    initialState: initialState as ProjectFilesSliceState,
    reducers: {
        invalidate: (state) => {
            // projectFilesAdapter.removeAll(state);
            state.status = "idle";
        }
    },
    extraReducers: (builder) => {
        builder.addCase(loadProjectFiles.fulfilled, (state, action) => {
            projectFilesAdapter.setMany(state, action.payload);
            const filesToRemove = state.ids.filter(
                (id) => !action.payload.some((file) => file.relativePath === id)
            );
            projectFilesAdapter.removeMany(state, filesToRemove);
            state.status = "done";
        });
        builder.addCase(loadProjectFiles.rejected, (state, action) => {
            state.status = "error";
            state.error = action.error.message ?? "Unknown Error";
        });
    }
});

export const { invalidate } = projectFilesSlice.actions;

export default projectFilesSlice.reducer;

export const { selectById: selectProjectFileByRelativePath, selectIds: selectAllProjectFilePaths } =
    projectFilesAdapter.getSelectors();

export const selectProjectFileByParentDirFactory = () =>
    createSelector(
        [selectAllProjectFilePaths, (state, parent: string) => parent],
        (paths, parent) => {
            return paths.filter((p) => getParentDirectory(p as string) === parent);
        }
    );
