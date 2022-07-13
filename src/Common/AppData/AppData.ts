import { BaseDirectory, createDir, readTextFile, writeTextFile } from "@tauri-apps/api/fs";
import { appDir, sep } from "@tauri-apps/api/path";
import { tauriCommands } from "../TauriCommands";

export default class AppData<T> {
    filename = "";
    defaultState: T;

    constructor(filename: string, defaultState: T) {
        this.filename = filename;
        this.defaultState = defaultState;
    }

    static async createAppDataDir() {
        if (!(await tauriCommands.fileExists(await appDir()))) {
            await createDir(`${await appDir()}`);
        }
    }

    async get(): Promise<T> {
        await AppData.createAppDataDir();
        if (await tauriCommands.fileExists(`${await appDir()}${sep}${this.filename}`)) {
            const file = await readTextFile(this.filename, {
                dir: BaseDirectory.App
            });
            return JSON.parse(file) as T;
        } else {
            await this.save(this.defaultState);
            return this.defaultState;
        }
    }

    async save(data: T) {
        await AppData.createAppDataDir();
        await writeTextFile(this.filename, JSON.stringify(data), {
            dir: BaseDirectory.App
        });
    }

    async reset() {
        await this.save(this.defaultState);
    }
}
