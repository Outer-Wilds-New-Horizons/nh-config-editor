import { message } from "@tauri-apps/api/dialog";
import { sep } from "@tauri-apps/api/path";
import { exit } from "@tauri-apps/api/process";
import { getAll, WebviewWindow } from "@tauri-apps/api/window";
import { tauriCommands } from "./TauriCommands";

/**
 * @comment This schema file is updated automatically by the build process.
 */
export type ProjectSettings = {
    /**
     * @default main
     * @description The branch to use for schemas.
     */
    schemaBranch: string;
};

export const defaultProjectSettings: ProjectSettings = {
    schemaBranch: "main"
};

export type Project = {
    name: string;
    uniqueName: string;
    path: string;
    valid: boolean;
    settings: ProjectSettings;
};

export const errorProject = (path: string) => ({
    name: "Error Loading Project",
    uniqueName: "",
    path,
    valid: false,
    settings: defaultProjectSettings
});

export const loadProject = async (path: string): Promise<Project> => {
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

    let projectSettings: ProjectSettings = defaultProjectSettings;

    if (await tauriCommands.fileExists(`${path}${sep}nh_proj.json`)) {
        const rawSettings: string = await tauriCommands.readFileText(`${path}${sep}nh_proj.json`);
        try {
            projectSettings = JSON.parse(rawSettings);
        } catch (e) {
            throw new Error(`Project at ${path} has invalid project settings (${e})`);
        }
        projectSettings = { ...defaultProjectSettings, ...projectSettings };
    } else {
        await tauriCommands.writeFileText(
            `${path}${sep}nh_proj.json`,
            JSON.stringify(defaultProjectSettings, null, 4)
        );
    }

    return {
        name: rawProject.name,
        uniqueName: rawProject.uniqueName,
        path: path,
        valid: true,
        settings: projectSettings
    };
};

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
            return await loadProject(decodeURIComponent(projectPath));
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

export const openProjectInMainWindow = async (project: Project) => {
    const webview = new WebviewWindow("main", {
        url: `index.html?path=${encodeURIComponent(project.path)}#MAIN`,
        title: `${project.name} | New Horizons Config Editor`,
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
};

export const debugBuildProject = async (project: Project, modsFolder: string) => {
    const outputPath = `${modsFolder}${sep}${project.uniqueName}`;
    try {
        if (await tauriCommands.fileExists(outputPath)) {
            await tauriCommands.deleteDirectory(outputPath);
        }
        await tauriCommands.copyDirectory(project.path, outputPath);
    } catch (e) {
        throw new Error(`Could not copy project to mods folder (${e})`);
    }
};
