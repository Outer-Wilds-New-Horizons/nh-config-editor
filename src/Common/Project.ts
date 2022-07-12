import { sep } from "@tauri-apps/api/path";
import { invoke } from "@tauri-apps/api/tauri";
import { getAll, WebviewWindow } from "@tauri-apps/api/window";

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
        if (!(await invoke("file_exists", { path: path }))) {
            throw new Error(`Project at ${path} does not exist`);
        }
        if (!(await invoke("is_dir", { path: path }))) {
            throw new Error(`Project at ${path} is not a directory`);
        }
        if (!(await invoke("file_exists", { path: `${path}${sep}manifest.json` }))) {
            throw new Error(`Project at ${path} does not have a manifest`);
        }

        const rawData: string = await invoke("read_file_as_string", {
            path: `${path}${sep}manifest.json`
        });

        let data: object | null = null;

        try {
            data = JSON.parse(rawData);
        } catch (e) {
            throw new Error(`Project at ${path} has invalid manifest (${e})`);
        }

        const rawProject = data as Project;
        return new Project(rawProject.name, rawProject.uniqueName, path);
    }

    async openInMain() {
        const webview = new WebviewWindow("mainApp", {
            url: `index.html?path=${encodeURIComponent(this.path)}#MAIN`,
            title: `${this.name} | New Horizons Config Editor`,
            center: true,
            minWidth: 1000,
            width: 1000,
            minHeight: 800,
            height: 800,
            resizable: true,
            maximized: true
        });

        await webview.once("tauri://created", () => {
            getAll()
                .filter((w) => w.label !== "mainApp")
                .forEach((window) => window.close());
        });
    }

    async copyToModsFolder(modsFolder: string) {
        const outputPath = `${modsFolder}${sep}${this.uniqueName}`;
        try {
            if (await invoke("file_exists", { path: outputPath })) {
                await invoke("delete_dir", { path: outputPath });
            }
            await invoke("copy_dir", {
                src: this.path,
                dest: outputPath
            });
        } catch (e) {
            throw new Error(`Could not copy project to mods folder (${e})`);
        }
    }
}
