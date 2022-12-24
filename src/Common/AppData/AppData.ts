import { createDir } from "@tauri-apps/api/fs";
import { appLocalDataDir, sep } from "@tauri-apps/api/path";
import { tauriCommands } from "../TauriCommands";

/**
 * Acts as a manager for app data.
 * This could be stuff as simple as recent projects, or as complex as settings
 * It automatically saves and loads data from the app data directory.
 * It also automatically creates the directory and file if they don't exist.
 */
export default class AppData<T> {
    filename = "";
    defaultState: T | (() => Promise<T>);

    /**
     * Creates a new AppData object.
     * @param filename The name of the file to save the data to.
     * @param defaultState The default state of the data, this can be an async function that will be run to get it as well.
     */
    constructor(filename: string, defaultState: T | (() => Promise<T>)) {
        this.filename = filename;
        this.defaultState = defaultState;
    }

    static async createAppDataDir() {
        if (!(await tauriCommands.fileExists(await appLocalDataDir()))) {
            await createDir(`${await appLocalDataDir()}`);
        }
    }

    async getDefaultState(): Promise<T> {
        if (typeof this.defaultState === "function") {
            this.defaultState = await (this.defaultState as () => Promise<T>)();
        }
        return JSON.parse(JSON.stringify(this.defaultState)) as T;
    }

    async get(): Promise<T> {
        await AppData.createAppDataDir();
        const path = `${await appLocalDataDir()}${sep}${this.filename}`;
        if (await tauriCommands.fileExists(path)) {
            const file = await tauriCommands.readFileText(path);
            return JSON.parse(file) as T;
        } else {
            await this.save(await this.getDefaultState());
            return await this.getDefaultState();
        }
    }

    async save(data: T) {
        await AppData.createAppDataDir();
        await tauriCommands.writeFileText(
            `${await appLocalDataDir()}${sep}${this.filename}`,
            JSON.stringify(data)
        );
    }

    async reset() {
        await this.save(await this.getDefaultState());
    }
}
