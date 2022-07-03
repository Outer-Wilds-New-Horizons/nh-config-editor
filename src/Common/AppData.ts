import {BaseDirectory, createDir, readTextFile, writeTextFile} from "@tauri-apps/api/fs";
import {appDir, sep} from "@tauri-apps/api/path";
import {invoke} from "@tauri-apps/api/tauri";
import {Project} from "./Project";

type RawAppData = {
    settings: Settings
    recentProjects: string[]
}

export class AppData {

    static fileName = "appdata.json";

    recentProjects: Project[] = [];
    settings: Settings = {
        hdrColor: false,
        minify: true
    };

    static async get(): Promise<AppData> {
        if (await invoke("file_exists", {path: `${await appDir()}${sep}${AppData.fileName}`})) {
            const file = await readTextFile(AppData.fileName, {dir: BaseDirectory.App});
            const loadedData = JSON.parse(file) as RawAppData;
            const newData = new AppData();
            newData.settings = loadedData.settings;
            for (const projectPath of loadedData.recentProjects) {
                if (newData.recentProjects.filter(p => p.path === projectPath).length === 0) {
                    const newProject = await Project.load(projectPath) ?? new Project("Error Loading Project", "", projectPath);
                    newData.recentProjects.unshift(newProject);
                }
            }
            return newData;
        } else {
            const newData = new AppData();
            await newData.save();
            return newData;
        }
    }

    async save() {
        if (!(await invoke("file_exists", {path: await appDir()}))) await createDir(`${await appDir()}`);

        const data: RawAppData = {
            settings: this.settings,
            recentProjects: this.recentProjects.map(project => project.path)
        };

        await writeTextFile({path: AppData.fileName, contents: JSON.stringify(data)}, {dir: BaseDirectory.App});
    }

}

export type Settings = {
    hdrColor: boolean;
    minify: boolean;
}
