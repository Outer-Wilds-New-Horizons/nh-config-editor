import {listen} from "@tauri-apps/api/event";
import {isRegistered, register} from "@tauri-apps/api/globalShortcut";


export type ActionRegistry = {
    [key: string]: Action;
}

type MenuEvent = {
    payload: string;
}

class Action {

    name: string;
    shortcut?: string;
    menuItemId?: string;
    callback: CallableFunction;

    constructor(name: string, shortcut?: string, menuItem?: string) {
        this.name = name;
        this.shortcut = shortcut;
        this.menuItemId = menuItem;
        this.callback = () => {
            console.error("Action not implemented");
        };
    }

    async register(menuRegistry: ActionRegistry, actionRegistry: ActionRegistry) {

        // This will throw an error in development because react strict mode renders <App/> twice
        // It does this so fast that for some reason isRegistered() returns false even though the shortcut is registered
        // This error will not appear in production however, so it should be fine.
        if (this.shortcut && !(await isRegistered(this.shortcut))) {
            await register(this.shortcut, () => this.callback());
        }

        if (this.menuItemId) {
            menuRegistry[this.menuItemId] = this;
        }

        actionRegistry[this.name] = this;

    }

}

export async function setupAllEvents(): Promise<[CallableFunction, ActionRegistry]> {

    const menuRegistry: ActionRegistry = {};
    const actionRegistry: ActionRegistry = {};

    const actions: Action[] = [
        new Action("New Planet", "CommandOrControl+Shift+P", "new_planet"),
        new Action("New Star System", "CommandOrControl+Shift+S", "new_system"),
        new Action("New Translation", "CommandOrControl+Shift+T", "new_translation"),
        new Action("Create Addon Manifest", "CommandOrControl+Shift+A", "create_addon_manifest"),
        new Action("Save", "CommandOrControl+S", "save"),
        new Action("Save All", "CommandOrControl+Alt+S", "save_all"),
        new Action("Close", "CommandOrControl+W", "close"),
        // Close Project
        new Action("Reload Project", "CommandOrControl+R", "reload_project"),
        new Action("Open Source", "CommandOrControl+O", "open_source"),
    ];

    for (const action of actions) {
        await action.register(menuRegistry, actionRegistry);
    }

    return [await listen("tauri://menu", (event: MenuEvent) => {

        const action = menuRegistry[event.payload];

        if (action) {
            action.callback();
        }

    }), actionRegistry];

}


