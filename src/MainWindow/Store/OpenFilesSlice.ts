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
import { tauriCommands } from "../../Common/TauriCommands";
import validate, { ValidationError } from "../Validation/Validator";
import {
    determineOpenFunction,
    getContentToSave,
    getFileName,
    getInitialContent,
    getRootDirectory
} from "./FileUtils";
import { initialLoadState, LoadState } from "./LoadState";
import { invalidate, ProjectFile } from "./ProjectFilesSlice";
import { RootState } from "./Store";

type FileData = string | null;

export type OpenFile = {
    tabIndex: number;
    memoryData: FileData;
    diskData: FileData;
    loadState: LoadState;
    errors: ValidationError[];
    otherErrors: boolean;
} & Omit<ProjectFile, "isFolder">;

export const readFileData = createAsyncThunk(
    "openFiles/readFileData",
    async (file: OpenFile, thunkAPI) => {
        const openFunc = determineOpenFunction(file);
        const data = await openFunc(file.absolutePath);
        thunkAPI.dispatch(validateFile({ value: data, file }));
        return data;
    }
);

export const saveFileData = createAsyncThunk(
    "openFiles/saveFileData",
    async (payload: { file: OpenFile; projectPath: string }, thunkAPI) => {
        const { file, projectPath } = payload;
        const rootDirectory = getRootDirectory(file.relativePath);
        if (file.relativePath.startsWith("@@void@@")) {
            const newPath = await dialog.save({
                title: "Save File",
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

const confirmIfFileChanged = async (file: OpenFile): Promise<boolean> => {
    let result = true;
    if (file.diskData !== file.memoryData) {
        result = await dialog.ask("Are you sure you want to close this file without saving?", {
            type: "warning",
            title: file.name
        });
    }
    return result;
};

export const closeTab = createAsyncThunk("openFiles/closeTab", async (file: OpenFile, thunkAPI) => {
    if (await confirmIfFileChanged(file)) {
        thunkAPI.dispatch(forceCloseTab(file.relativePath));
    }
});

export const validateFile = createAsyncThunk(
    "openFiles/validateFile",
    async (payload: { value: string; file: OpenFile }) => {
        const { value, file } = payload;
        // Wait a sec in case the user isn't done typing
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return await validate(value, file);
    }
);

export const closeTabs = createAsyncThunk(
    "openFiles/closeTabs",
    async (files: OpenFile[], thunkAPI) => {
        const tabsToClose: string[] = [];
        for (const file of files) {
            if (await confirmIfFileChanged(file)) {
                tabsToClose.push(file.relativePath);
            }
        }
        thunkAPI.dispatch(forceCloseTabs(tabsToClose));
    }
);

export const closeAllTabs = createAsyncThunk("openFiles/closeAllTabs", async (_, thunkAPI) => {
    thunkAPI.dispatch(closeTabs(selectAllOpenFiles((thunkAPI.getState() as RootState).openFiles)));
});

export const closeTabsToTheRight = createAsyncThunk(
    "openFiles/closeTabsToTheRight",
    async (index: number, thunkAPI) => {
        const files = selectAllOpenFiles((thunkAPI.getState() as RootState).openFiles);
        thunkAPI.dispatch(closeTabs(files.filter((f) => f.tabIndex > index)));
    }
);

export const closeTabsToTheLeft = createAsyncThunk(
    "openFiles/closeTabsToTheLeft",
    async (index: number, thunkAPI) => {
        const files = selectAllOpenFiles((thunkAPI.getState() as RootState).openFiles);
        thunkAPI.dispatch(closeTabs(files.filter((f) => f.tabIndex < index)));
    }
);

export const closeOtherTabs = createAsyncThunk(
    "openFiles/closeOtherTabs",
    async (index: number, thunkAPI) => {
        const files = selectAllOpenFiles((thunkAPI.getState() as RootState).openFiles);
        thunkAPI.dispatch(closeTabs(files.filter((f) => f.tabIndex !== index)));
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

const tryRestoreSelectedTab = (state: OpenFilesSliceState, oldPath: string) => {
    const index = state.tabs.indexOf(oldPath);
    if (index !== -1) {
        state.selectedTabIndex = index;
    } else {
        state.selectedTabIndex = state.tabs.length === 0 ? -1 : 0;
    }
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
                    errors: [],
                    otherErrors: false,
                    loadState: initialLoadState
                };
                openFilesAdapter.addOne(state, newOpenFile);
                state.tabs = state.tabs.concat([projectFile.relativePath]);
                state.selectedTabIndex = newOpenFile.tabIndex;
            }
        },
        createVoidFile: (
            state,
            action: PayloadAction<{ name: string; rootDir: string; projectPath: string }>
        ) => {
            const currentNum =
                state.ids.filter((p) =>
                    (p as string).startsWith(`@@void@@${sep}${action.payload.rootDir}`)
                ).length + 1;
            const newIndex = state.tabs.length;
            const newName = `new_${action.payload.name}_${currentNum}.json`;
            const newPath = `@@void@@${sep}${action.payload.rootDir}${sep}${newName}`;
            const newFile: OpenFile = {
                tabIndex: newIndex,
                name: newName,
                relativePath: newPath,
                absolutePath: `${action.payload.projectPath}${sep}${newPath}`,
                extension: "json",
                diskData: null,
                errors: [],
                otherErrors: false,
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
        forceCloseTab: (state, action: PayloadAction<string>) => {
            if (!state.ids.includes(action.payload)) return;

            openFilesAdapter.removeOne(state, action.payload);
            const currentSelectedPath = state.tabs[state.selectedTabIndex];
            state.tabs = state.tabs.filter((p) => p !== action.payload);
            updateTabIndices(state);
            tryRestoreSelectedTab(state, currentSelectedPath);
        },
        forceCloseTabs: (state, action: PayloadAction<string[]>) => {
            openFilesAdapter.removeMany(state, action.payload);
            const currentSelectedPath = state.tabs[state.selectedTabIndex];
            state.tabs = state.tabs.filter((p) => !action.payload.includes(p));
            updateTabIndices(state);
            tryRestoreSelectedTab(state, currentSelectedPath);
        },
        setTabs: (state, action: PayloadAction<string[]>) => {
            if (state.tabs === action.payload) return;
            const currentSelectedPath = state.tabs[state.selectedTabIndex];
            state.tabs = action.payload;
            updateTabIndices(state);
            tryRestoreSelectedTab(state, currentSelectedPath);
        },
        fileEdited: (state, action: PayloadAction<{ id: EntityId; content: string }>) => {
            const { id, content } = action.payload;
            openFilesAdapter.updateOne(state, { id: id, changes: { memoryData: content } });
        },
        setOtherErrors: (state, action: PayloadAction<{ id: EntityId; otherErrors: boolean }>) => {
            const { id, otherErrors } = action.payload;
            openFilesAdapter.updateOne(state, { id: id, changes: { otherErrors: otherErrors } });
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
        builder.addCase(saveFileData.fulfilled, (state, action) => {
            const openFile = state.entities[action.meta.arg.file.relativePath];
            if (openFile !== undefined) {
                if (action.payload.createdNewFile) {
                    openFilesAdapter.removeOne(state, action.meta.arg.file.relativePath);
                    openFilesAdapter.upsertOne(state, {
                        ...openFile,
                        name: getFileName(action.payload.newPath),
                        relativePath: action.payload.newPath.slice(
                            action.meta.arg.projectPath.length + 1
                        ),
                        absolutePath: action.payload.newPath,
                        diskData: openFile.memoryData
                    });
                    state.tabs = state.tabs.map((p) => {
                        if (p === action.meta.arg.file.relativePath) {
                            return action.payload.newPath.slice(
                                action.meta.arg.projectPath.length + 1
                            );
                        }
                        return p;
                    });
                    return;
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
            message(`Error saving file: ${action.error.message ?? "Unknown Error"}`, {
                type: "error",
                title: "Save Error"
            });
        });
        builder.addCase(validateFile.fulfilled, (state, action) => {
            const openFile = state.entities[action.meta.arg.file.relativePath];
            if (openFile !== undefined) {
                openFile.errors = action.payload;
            }
        });
    }
});

export default openFilesSlice.reducer;

export const {
    openFile,
    selectTab,
    setTabs,
    forceCloseTab,
    forceCloseTabs,
    fileEdited,
    createVoidFile,
    setOtherErrors
} = openFilesSlice.actions;

export const {
    selectAll: selectAllOpenFiles,
    selectById: selectOpenFileByRelativePath,
    selectIds: selectOpenFileIds,
    selectTotal: selectTotalOpenFiles
} = openFilesAdapter.getSelectors();

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
