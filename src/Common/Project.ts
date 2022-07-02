import {sep} from "@tauri-apps/api/path";
import {invoke} from "@tauri-apps/api/tauri";

export class Project {

    name: string;
    path: string;
    valid: boolean;

    constructor(name: string, path: string) {
        this.name = name;
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
            return new Project((data as Project)["name"], path);
        } else {
            return null;
        }

    }

    async validate(): Promise<boolean> {

        return await Project.load(this.path) !== null;

    }
}
