import {sep} from "@tauri-apps/api/path";
import {invoke} from "@tauri-apps/api/tauri";
import {getAll, WebviewWindow} from "@tauri-apps/api/window";

export class Project {

    name: string;
    uniqueName: string;
    path: string;
    valid: boolean;

    constructor(name: string, uniqueName: string, path: string) {
        this.name = name;
        this.uniqueName = uniqueName;
        this.path = path;
        this.valid = true;
    }

    static async load(path: string): Promise<Project | null> {

        if (!await invoke("file_exists", {path: path})) {
            return null;
        }
        if (!await invoke("file_exists", {path: `${path}${sep}manifest.json`})) {
            return null;
        }

        const rawData: string = await invoke("read_file_as_string", {path: `${path}${sep}manifest.json`});

        let data: object | null = null;

        try {
            data = JSON.parse(rawData);
        } catch (e) {
            if (e as SyntaxError) {
                return null;
            } else {
                console.error(e);
            }
        }

        if (data !== null) {
            const rawProject = data as Project;
            return new Project(rawProject.name, rawProject.uniqueName, path);
        } else {
            return null;
        }

    }

    async validate(): Promise<boolean> {

        return await Project.load(this.path) !== null;

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
            getAll().filter(w => w.label !== "mainApp").forEach(window => window.close());
        });

    }

}
