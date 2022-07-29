import {
    createAsyncThunk,
    createEntityAdapter,
    createSelector,
    createSlice,
    EntityId,
    PayloadAction
} from "@reduxjs/toolkit";
import { dialog } from "@tauri-apps/api";
import { ask, message } from "@tauri-apps/api/dialog";
import { sep } from "@tauri-apps/api/path";
import { tauriCommands } from "../Common/TauriCommands";
import { initialLoadState, LoadState } from "./LoadState";
import { invalidate, ProjectFile } from "./ProjectFile";
import {
    determineOpenFunction,
    getContentToSave,
    getFileName,
    getInitialContent,
    getRootDirectory
} from "./FileUtils";

type FileData = string | null;

export type OpenFile = {
    tabIndex: number;
    memoryData: FileData;
    diskData: FileData;
    loadState: LoadState;
} & Omit<ProjectFile, "isFolder">;

export const readFileData = createAsyncThunk("openFiles/readFileData", async (file: OpenFile) => {
    const openFunc = determineOpenFunction(file);
    return await openFunc(file.absolutePath);
});

export const saveFileData = createAsyncThunk(
    "openFiles/saveFileData",
    async (payload: { file: OpenFile; projectPath: string }, thunkAPI) => {
        const { file, projectPath } = payload;
        const rootDirectory = getRootDirectory(file.relativePath);
        if (file.relativePath.startsWith("@@void@@")) {
            const newPath = await dialog.save({
                title: "Save file",
                defaultPath: `${projectPath}${sep}${rootDirectory}${sep}${file.name}`,
                filters: [
                    {
                        name: "JSON file",
                        extensions: ["json"]
                    }
                ]
            });
            if (newPath) {
                if (newPath.startsWith(`${projectPath}${sep}${rootDirectory}`)) {
                    await tauriCommands.writeFileText(newPath, await getContentToSave(file));
                    thunkAPI.dispatch(invalidate());
                    return { createdNewFile: true, newPath };
                } else {
                    throw new Error(
                        `Path must be inside the ${rootDirectory} folder of the project`
                    );
                }
            } else {
                throw new Error("No path selected");
            }
        } else {
            await tauriCommands.writeFileText(file.absolutePath, await getContentToSave(file));
            return { createdNewFile: false, newPath: file.absolutePath };
        }
    }
);

const openFilesAdapter = createEntityAdapter<OpenFile>({
    selectId: (file: OpenFile) => file.relativePath,
    sortComparer: (a: OpenFile, b: OpenFile) => a.tabIndex - b.tabIndex
});

type OpenFilesSliceState = ReturnType<typeof openFilesAdapter.getInitialState> & {
    selectedTabIndex: number;
    tabs: string[]; // Contains relative paths in the order of the tabs
};

const initialState = openFilesAdapter.getInitialState({ selectedTabIndex: -1, tabs: [] });

const updateTabIndices = (state: OpenFilesSliceState) => {
    openFilesAdapter.updateMany(
        state,
        state.tabs.map((p, i) => ({
            id: p,
            changes: { tabIndex: i }
        }))
    );
};

const openFilesSlice = createSlice({
    name: "openFiles",
    initialState: initialState as OpenFilesSliceState,
    reducers: {
        openFile: (state, action: PayloadAction<ProjectFile>) => {
            const projectFile = action.payload;
            const currentFile = state.entities[projectFile.relativePath];
            if (currentFile !== undefined) {
                state.selectedTabIndex = currentFile.tabIndex;
            } else {
                const newOpenFile: OpenFile = {
                    tabIndex: state.tabs.length,
                    name: projectFile.name,
                    relativePath: projectFile.relativePath,
                    absolutePath: projectFile.absolutePath,
                    extension: projectFile.extension,
                    diskData: null,
                    memoryData: null,
                    loadState: initialLoadState
                };
                openFilesAdapter.addOne(state, newOpenFile);
                state.tabs = state.tabs.concat([projectFile.relativePath]);
                state.selectedTabIndex = newOpenFile.tabIndex;
            }
        },
        createVoidFile: (state, action: PayloadAction<{ name: string; rootDir: string }>) => {
            const currentNum =
                state.ids.filter((p) =>
                    (p as string).startsWith(`@@void@@${sep}${action.payload.rootDir}`)
                ).length + 1;
            const newIndex = state.tabs.length;
            const newName = `new_${action.payload.name}_${currentNum}.json`;
            const newFile: OpenFile = {
                tabIndex: newIndex,
                name: newName,
                relativePath: `@@void@@${sep}${action.payload.rootDir}${sep}${newName}`,
                absolutePath: "@@void@@",
                extension: "json",
                diskData: null,
                memoryData: getInitialContent(action.payload.rootDir),
                loadState: { status: "done", error: "Unknown Error" }
            };
            openFilesAdapter.upsertOne(state, newFile);
            state.tabs = state.tabs.concat([newFile.relativePath]);
            state.selectedTabIndex = newIndex;
        },
        selectTab: (state, action: PayloadAction<string>) => {
            state.selectedTabIndex = state.tabs.indexOf(action.payload);
        },
        closeTab: (state, action: PayloadAction<string>) => {
            openFilesAdapter.removeOne(state, action.payload);
            const currentSelectedPath = state.tabs[state.selectedTabIndex];
            state.tabs = state.tabs.filter((p) => p !== action.payload);
            openFilesAdapter.updateMany(
                state,
                state.tabs.map((p, i) => ({
                    id: p,
                    changes: { tabIndex: i }
                }))
            );
            updateTabIndices(state);
            state.selectedTabIndex = state.tabs.indexOf(currentSelectedPath) ?? state.tabs[0] ?? -1;
        },
        closeAllUnchangedTabs: (state) => {
            if (state.ids.length === 0) return;
            openFilesAdapter.removeMany(
                state,
                state.ids.filter(
                    (id) => state.entities[id]!.diskData === state.entities[id]!.memoryData
                )
            );
            const currentSelectedPath = state.tabs[state.selectedTabIndex];
            state.tabs = state.tabs.filter((p) => state.ids.includes(p));
            updateTabIndices(state);
            state.selectedTabIndex = state.tabs.indexOf(currentSelectedPath) ?? state.tabs[0] ?? -1;
        },
        fileEdited: (state, action: PayloadAction<{ id: EntityId; content: string }>) => {
            const { id, content } = action.payload;
            openFilesAdapter.updateOne(state, { id: id, changes: { memoryData: content } });
        }
    },
    extraReducers: (builder) => {
        builder.addCase(readFileData.pending, (state, action) => {
            const openFile = state.entities[action.meta.arg.relativePath];
            if (openFile !== undefined) {
                openFile.loadState.status = "loading";
            }
        });
        builder.addCase(readFileData.fulfilled, (state, action) => {
            const openFile = state.entities[action.meta.arg.relativePath];
            if (openFile !== undefined) {
                openFile.loadState.status = "done";
                openFile.memoryData = action.payload;
                openFile.diskData = action.payload;
            }
        });
        builder.addCase(readFileData.rejected, (state, action) => {
            const openFile = state.entities[action.meta.arg.relativePath];
            if (openFile !== undefined) {
                openFile.loadState.status = "error";
                openFile.loadState.error = action.error.message ?? "Unknown Error";
            }
        });
        builder.addCase(saveFileData.pending, (state, action) => {
            const openFile = state.entities[action.meta.arg.file.relativePath];
            if (openFile !== undefined) {
                openFile.loadState.status = "loading";
            }
        });
        builder.addCase(saveFileData.fulfilled, (state, action) => {
            const openFile = state.entities[action.meta.arg.file.relativePath];
            if (openFile !== undefined) {
                openFile.loadState.status = "done";
                if (action.payload.createdNewFile) {
                    openFilesAdapter.updateOne(state, {
                        id: openFile.tabIndex,
                        changes: {
                            name: getFileName(action.payload.newPath),
                            relativePath: action.payload.newPath.slice(
                                action.meta.arg.projectPath.length + 1
                            ),
                            absolutePath: action.payload.newPath,
                            diskData: openFile.memoryData
                        }
                    });
                }
                openFilesAdapter.updateOne(state, {
                    id: openFile.relativePath,
                    changes: {
                        diskData: openFile.memoryData
                    }
                });
            }
        });
        builder.addCase(saveFileData.rejected, (state, action) => {
            const openFile = state.entities[action.meta.arg.file.relativePath];
            if (openFile !== undefined) {
                message(`Error saving file: ${action.error.message ?? "Unknown Error"}`, {
                    type: "error",
                    title: "Save Error"
                });
                // We don't want to force them to close the tab in the event of an error,
                // So we just set the load state to done to redisplay the editor and let them try again
                openFile.loadState.status = "done";
            }
        });
    }
});

export default openFilesSlice.reducer;

export const { openFile, selectTab, closeTab, closeAllUnchangedTabs, fileEdited, createVoidFile } =
    openFilesSlice.actions;

export const {
    selectAll: selectAllOpenFiles,
    selectById: selectOpenFileByRelativePath,
    selectTotal: selectTotalOpenFiles
} = openFilesAdapter.getSelectors();

export const selectSelectedTabIndex = createSelector(
    [selectAllOpenFiles, (state) => state.selectedTabIndex],
    (openFiles, selectedTabIndex) => selectedTabIndex
);

export const selectSelectedFile = createSelector(
    [selectAllOpenFiles, (state) => state.selectedTabIndex],
    (openFiles, selectedTabIndex) => {
        return openFiles.find((file) => file.tabIndex === selectedTabIndex);
    }
);

export const selectTabs = createSelector([(state) => state.tabs], (tabs) => tabs);

export const selectOpenFileIsSelectedFactory = () =>
    createSelector(
        [
            (state) => state.tabs,
            (state) => state.selectedTabIndex,
            (state, relativePath) => relativePath
        ],
        (tabs, selectedTabIndex, relativePath) => {
            return tabs[selectedTabIndex] === relativePath;
        }
    );

export const selectFilesHaveUnsavedChanges = createSelector([selectAllOpenFiles], (openFiles) => {
    return openFiles.some((file) => file.diskData !== file.memoryData);
});

export const closeProjectConfirm = async (): Promise<boolean> =>
    await ask("There are unsaved changes. Are you sure you want to close the project?", {
        title: "Confirm"
    });
export const quitConfirm = async (): Promise<boolean> =>
    await ask("There are unsaved changes. Are you sure you want to quit?", { title: "Confirm" });
