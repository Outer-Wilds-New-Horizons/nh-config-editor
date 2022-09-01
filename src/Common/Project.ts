import { message } from "@tauri-apps/api/dialog";
import { sep } from "@tauri-apps/api/path";
import { exit } from "@tauri-apps/api/process";
import { getAll, WebviewWindow } from "@tauri-apps/api/window";
import { tauriCommands } from "./TauriCommands";

export const loadProjectFromURLParams = async () => {
    const projectPath = new URLSearchParams(window.location.search).get("path");
    if (projectPath === null) {
        // This should only happen when the window is opened directly.
        await message("No Project Path Specified", {
            type: "error",
            title: "Error"
        });
        await exit(1);
        throw new Error("No Project Path Specified");
    } else {
        try {
            return await Project.load(decodeURIComponent(projectPath));
        } catch (e) {
            await message(`Error loading project: ${e}`, {
                type: "error",
                title: "Error"
            });
            await exit(1);
            throw e;
        }
    }
};

export class Project {
    name: string;
    uniqueName: string;
    path: string;
    valid: boolean;

    constructor(name: string, uniqueName: string, path: string) {
        this.name = name;
        this.uniqueName = uniqueName;
        this.path = path;
        this.valid = uniqueName !== "";
    }

    static async load(path: string): Promise<Project> {
        if (!(await tauriCommands.fileExists(path))) {
            throw new Error(`Project at ${path} does not exist`);
        }
        if (!(await tauriCommands.isDirectory(path))) {
            throw new Error(`Project at ${path} is not a directory`);
        }
        if (!(await tauriCommands.fileExists(`${path}${sep}manifest.json`))) {
            throw new Error(`Project at ${path} does not have a manifest`);
        }

        const rawData: string = await tauriCommands.readFileText(`${path}${sep}manifest.json`);

        let data: object | null = null;

        try {
            data = JSON.parse(rawData);
        } catch (e) {
            throw new Error(`Project at ${path} has invalid manifest (${e})`);
        }

        if (!Object.hasOwn(data!, "uniqueName") || !Object.hasOwn(data!, "name")) {
            throw new Error(`Project at ${path} does not have a name or unique name`);
        }

        const rawProject = data as Project;
        return new Project(rawProject.name, rawProject.uniqueName, path);
    }

    async openInMain() {
        const webview = new WebviewWindow("main", {
            url: `index.html?path=${encodeURIComponent(this.path)}#MAIN`,
            title: `${this.name} | New Horizons Config Editor`,
            center: true,
            minWidth: 1000,
            width: 1000,
            minHeight: 300,
            height: 800,
            resizable: true,
            maximized: true,
            fileDropEnabled: false
        });

        await webview.once("tauri://created", () => {
            getAll()
                .filter((w) => w.label !== "main")
                .forEach((window) => window.close());
        });
    }

    async copyToModsFolder(modsFolder: string) {
        const outputPath = `${modsFolder}${sep}${this.uniqueName}`;
        try {
            if (await tauriCommands.fileExists(outputPath)) {
                await tauriCommands.deleteDirectory(outputPath);
            }
            await tauriCommands.copyDirectory(this.path, outputPath);
        } catch (e) {
            throw new Error(`Could not copy project to mods folder (${e})`);
        }
    }
}
