import { sep } from "@tauri-apps/api/path";
import { invoke } from "@tauri-apps/api/tauri";
import { SettingsManager } from "./AppData/Settings";

export type ModManagerSettings = {
    owmlPath: string;
};

export async function getModManagerSettings(): Promise<ModManagerSettings> {
    const { modManagerPath } = await SettingsManager.get();
    try {
        const modManagerSettings: string = await invoke("read_file_as_string", {
            path: `${modManagerPath}${sep}settings.json`
        });
        return JSON.parse(modManagerSettings) as ModManagerSettings;
    } catch (e) {
        throw new Error(`Could not read mod manager settings (${e})`);
    }
}
