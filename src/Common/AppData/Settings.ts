import { dataDir, documentDir } from "@tauri-apps/api/path";
import { Theme } from "../Theme/ThemeManager";
import AppData from "./AppData";

/**
 * @comment ATTENTION: This schema file is auto-updated on every build, you don't need to edit it manually.
 */
export type Settings = {
    /**
     * @description The theme to use. (Reload Required)
     * @default "Follow System"
     */
    theme: Theme;

    /**
     * @description The default name of new projects.
     */
    defaultProjectName: string;

    /**
     * @description The default author of new projects.
     */
    defaultAuthor: string;

    /**
     * @description The default folder to place new projects in.
     */
    defaultProjectFolder: string;

    /**
     * @description Whether to minify all json files when building the project
     */
    minify: boolean;

    /**
     * @description Always use a text editor for files instead of the inspector.
     */
    alwaysUseTextEditor: boolean;

    /**
     * @description The path to the Outer Wilds Mod Manager config directory (the folder with settings.json in it), used to launch the game and output the mod.
     */
    modManagerPath: string;
};

const MANAGER_FOLDER_NAME = "OuterWildsModManager";

export const blankSettings: Settings = {
    theme: "Follow System",
    defaultProjectName: "New Project",
    defaultAuthor: "",
    defaultProjectFolder: "",
    minify: false,
    alwaysUseTextEditor: false,
    modManagerPath: ""
};

export const defaultSettings = async (): Promise<Settings> => ({
    theme: "Follow System",
    defaultProjectName: "New Project",
    defaultAuthor: "Slate",
    defaultProjectFolder: (await documentDir()).slice(0, -1),
    minify: true,
    alwaysUseTextEditor: false,
    modManagerPath: `${await dataDir()}${MANAGER_FOLDER_NAME}`
});

export const SettingsManager = new AppData<Settings>("settings.json", defaultSettings);
