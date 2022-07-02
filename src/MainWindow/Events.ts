import {isRegistered, register} from "@tauri-apps/api/globalShortcut";


export type ActionRegistry = {
    [key: string]: Action;
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

        if (this.shortcut && !(await isRegistered(this.shortcut))) {
            await register(this.shortcut, () => this.callback());
        }

        if (this.menuItemId) {
            menuRegistry[this.menuItemId] = this;
        }

        actionRegistry[this.name] = this;

    }

}

export async function setupAllEvents(): Promise<ActionRegistry> {

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

    return actionRegistry;

}


