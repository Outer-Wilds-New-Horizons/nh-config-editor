import { createSelector, createSlice, EntityId, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./Store";

export type ContextMenuData = {
    currentMenu: string | null;
    currentTarget: EntityId | null;
    open: boolean;
    position: [number, number];
};

const initialContextMenuData: ContextMenuData = {
    currentMenu: null,
    currentTarget: null,
    open: false,
    position: [0, 0]
};

const contextMenuSlice = createSlice({
    name: "contextMenu",
    initialState: initialContextMenuData,
    reducers: {
        openMenu: (
            state,
            action: PayloadAction<{ menu: string; target: EntityId; position: [number, number] }>
        ) => {
            state.currentMenu = action.payload.menu;
            state.currentTarget = action.payload.target;
            state.position = action.payload.position;
            state.open = true;
        },
        closeMenu: (state) => {
            state.open = false;
        }
    }
});

const { openMenu, closeMenu } = contextMenuSlice.actions;

const selectMenuIsSelectedFactory = () =>
    createSelector(
        [(state) => state.currentMenu, (state, menuId: string) => menuId],
        (current, id) => current === id
    );
const selectCurrentTarget = (state: RootState) => state.contextMenu.currentTarget;
const selectPosition = (state: RootState) => state.contextMenu.position;

export const contextMenu = {
    openMenu,
    closeMenu,
    selectMenuIsSelectedFactory,
    selectCurrentTarget,
    selectPosition
};

export default contextMenuSlice.reducer;
