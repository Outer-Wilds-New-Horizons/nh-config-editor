import { sep } from "@tauri-apps/api/path";
import { SettingsManager } from "./AppData/Settings";
import { tauriCommands } from "./TauriCommands";

export type ModManagerSettings = {
    owmlPath: string;
};

export async function getModManagerSettings(): Promise<ModManagerSettings> {
    const { modManagerPath } = await SettingsManager.get();
    try {
        const modManagerSettings = await tauriCommands.readFileText(
            `${modManagerPath}${sep}settings.json`
        );
        return JSON.parse(modManagerSettings) as ModManagerSettings;
    } catch (e) {
        throw new Error(`Could not read mod manager settings (${e})`);
    }
}
