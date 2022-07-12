import { utils } from "@rjsf/core";
import { documentDir } from "@tauri-apps/api/path";
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
     * @description Always use a text editor for files instead of the inspector. (Reload Required)
     */
    alwaysUseTextEditor: boolean;

    /**
     * @description The branch to use for schemas, set to `main` for stable builds, and `dev` for nightly builds. Check the GitHub repo for other names. (Reload Required)
     */
    schemaBranch: string;
};

export const defaultSettings: Settings = {
    theme: "Follow System",
    defaultProjectName: "New Project",
    defaultAuthor: "Slate",
    defaultProjectFolder: (await documentDir()).slice(0, -1),
    minify: true,
    alwaysUseTextEditor: false,
    schemaBranch: "main"
};

export const SettingsManager = new AppData<Settings>("settings.json", defaultSettings);

await SettingsManager.save(
    utils.mergeObjects(defaultSettings, await SettingsManager.get()) as Settings
);
