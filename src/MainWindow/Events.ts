import {listen} from "@tauri-apps/api/event";
import {isRegistered, register} from "@tauri-apps/api/globalShortcut";
import {invoke} from "@tauri-apps/api/tauri";


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

    async registerShortcut() {
        if (this.shortcut && !(await isRegistered(this.shortcut))) {
            await register(this.shortcut, () => this.callback());
        }
    }

    async register(menuRegistry: ActionRegistry, actionRegistry: ActionRegistry) {

        // Due to react strict mode, this function runs twice.
        // This results in it trying to register the same action twice (even though we check if it's already registered, it returns false for some reason).
        // So, if you're running a dev build, set `DEV_MODE` to 1 to disable key-binds and avoid this error.

        if (await invoke("get_env", {key: "DEV_MODE"}) !== "1") {
            console.log(`Registering action: ${this.name}`);
            await this.registerShortcut();
        } else {
            try {
                await this.registerShortcut();
            } catch (e) {
                console.log("It's Morbin' Time");
            }
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

        // File Menu
        new Action("New Planet", "CommandOrControl+Shift+P", "new_planet"),
        new Action("New Star System", "CommandOrControl+Shift+S", "new_system"),
        new Action("New Translation", undefined, "new_translation"),
        new Action("Create Addon Manifest", "CommandOrControl+Shift+A", "create_addon_manifest"),
        new Action("Save", "CommandOrControl+S", "save"),
        new Action("Save All", "CommandOrControl+Alt+S", "save_all"),
        new Action("Close", "CommandOrControl+W", "close"),

        // Project Menu
        new Action("Reload Project", "CommandOrControl+R", "reload_project"),
        new Action("Open In Explorer", "CommandOrControl+O", "open_explorer"),
        new Action("Build Project", "CommandOrControl+B", "build_project"),
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


