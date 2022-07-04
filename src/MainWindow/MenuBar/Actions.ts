import { isRegistered, register } from "@tauri-apps/api/globalShortcut";

export type ActionRegistry = {
    [key: string]: Action;
};

export class Action {
    id: string;
    name: string;
    shortcut?: string;
    callback: CallableFunction;

    constructor(id: string, name: string, shortcut?: string) {
        this.id = id;
        this.name = name;
        this.shortcut = shortcut;
        this.callback = () => {
            console.error("Action not implemented");
        };
    }

    async register(actionRegistry: ActionRegistry) {
        if (this.shortcut && !(await isRegistered(this.shortcut))) {
            await register(this.shortcut, () => this.callback());
        }

        actionRegistry[this.id] = this;
    }
}

export type ActionGroupItem = Action | "separator";

export type ActionGroup = {
    title: string;
    actions: ActionGroupItem[];
};

export type ActionBar = {
    groups: ActionGroup[];
};

export const menuBar: ActionBar = {
    groups: [
        {
            title: "File",
            actions: [
                new Action("new_planet", "New Planet", "CommandOrControl+Shift+P"),
                new Action("new_system", "New Star System", "CommandOrControl+Shift+S"),
                new Action("new_translation", "New Translation", "CommandOrControl+Shift+L"),
                new Action("make_manifest", "Create Addon Manifest", "CommandOrControl+Shift+A"),
                "separator",
                new Action("save", "Save", "CommandOrControl+S"),
                new Action("save_all", "Save All", "CommandOrControl+Alt+S"),
                new Action("reload", "Reload From Disk", "CommandOrControl+R"),
                new Action("close_all", "Close All Files", "CommandOrControl+W"),
                "separator",
                new Action("settings", "Settings", "CommandOrControl+I"),
                "separator",
                new Action("close_project", "Close Project", "CommandOrControl+Alt+W"),
                new Action("quit", "Quit", "CommandOrControl+Q")
            ]
        },
        {
            title: "Project",
            actions: [
                new Action("open_explorer", "Open Project In Explorer", "CommandOrControl+O"),
                new Action("build", "Build Project", "CommandOrControl+B")
            ]
        },
        {
            title: "About",
            actions: [
                new Action("help", "Help", "F1"),
                new Action("about", "About", "F2"),
                new Action("soft_reset", "Reload", "CommandOrControl+Alt+R")
            ]
        }
    ]
};

export async function setupAllEvents(): Promise<ActionRegistry> {
    const actionRegistry: ActionRegistry = {};

    for (const group of menuBar.groups) {
        for (const action of group.actions) {
            if (action instanceof Action) {
                await action.register(actionRegistry);
            }
        }
    }

    return actionRegistry;
}
