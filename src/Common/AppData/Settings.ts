import {Theme} from "../Theme/ThemeManager";
import AppData from "./AppData";

/**
 * @comment ATTENTION: This file is auto-updated on every build, you don't need to edit it manually.
 */
export type Settings = {

    /**
     * @comment The theme to use.
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
     * @description Whether to allow for manual editing of RGB values opposed to the color picker
     */
    manualColor: boolean;

    /**
     * @description Whether to minify all json files when building the project
     */
    minify: boolean;
}

export const defaultSettings: Settings = {
    theme: "Default Light",
    defaultProjectName: "New Project",
    defaultAuthor: "Slate",
    manualColor: false,
    minify: true
};

export const SettingsManager = new AppData<Settings>("settings.json", defaultSettings);


