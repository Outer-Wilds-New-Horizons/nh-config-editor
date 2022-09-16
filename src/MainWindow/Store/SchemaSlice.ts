import { createAsyncThunk, createSelector, createSlice } from "@reduxjs/toolkit";
import SchemaStoreManager, { SchemaBranch } from "../../Common/AppData/SchemaStore";
import { windowBlur } from "./BlurSlice";
import { initialLoadState, LoadState } from "./LoadState";

export type SchemaSliceState = SchemaBranch & LoadState & { currentBranch: string };

export const switchBranch = createAsyncThunk(
    "schema/switchBranch",
    async (payload: string, thunkAPI) => {
        const registry = await SchemaStoreManager.getBranch(payload);
        thunkAPI.dispatch(windowBlur.setStatus("idle"));
        return registry;
    }
);

const schemaSlice = createSlice({
    name: "schema",
    initialState: {
        ...initialLoadState,
        currentBranch: "",
        schemas: {}
    } as SchemaSliceState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(switchBranch.pending, (state) => {
            state.status = "loading";
        });
        builder.addCase(switchBranch.fulfilled, (state, action) => {
            state.currentBranch = action.meta.arg;
            state.schemas = action.payload;
            state.status = "done";
        });
        builder.addCase(switchBranch.rejected, (state, action) => {
            state.status = "error";
            state.error = `Failed to load schemas: ${action.error.message ?? "Unknown Error"}`;
        });
    }
});

const selectSchemaFactory = () =>
    createSelector(
        [
            (state: SchemaSliceState) => state.schemas,
            (state: SchemaSliceState, schema: string) => schema
        ],
        (schemas, schema) => {
            console.debug(`Selecting schema ${schema} in state:`, schemas);
            return schemas[schema];
        }
    );

export const schemaSelectors = {
    selectSchemaFactory
};

export default schemaSlice.reducer;
