import { invoke } from "@tauri-apps/api/tauri";
import { ProjectFile, ProjectFileType } from "./Panels/ProjectView/ProjectFile";

export type FileMap = { [key: string]: ProjectFile };

async function recursiveBuild(
    path: string,
    projectPath: string,
    fileList: FileMap
): Promise<ProjectFile> {
    const isDir: boolean = await invoke("is_dir", { path });

    const childPaths: string[] = isDir ? await invoke("list_dir", { path }) : [];

    const [fileName, extension] = await invoke("get_metadata", { path });

    const rootDir: string | null = isDir
        ? null
        : await invoke("root_dir", { path, rootPath: projectPath });

    let fileType: ProjectFileType = "other";

    const children: ProjectFile[] = [];

    if (isDir) {
        for (const childPath of childPaths) {
            children.push(await recursiveBuild(childPath, projectPath, fileList));
        }
    } else {
        if (rootDir === "planets" && extension === "json") {
            fileType = "planet";
        } else if (rootDir === "systems" && extension === "json") {
            fileType = "system";
        } else if (rootDir === "translations" && extension === "json") {
            fileType = "translation";
        } else if (fileName === "addon-manifest.json") {
            fileType = "addon_manifest";
        } else if (fileName === "manifest.json") {
            fileType = "mod_manifest";
        } else if (extension === "" || extension === "bundle" || extension === "assetbundle") {
            fileType = "asset_bundle";
        } else if (extension === "xml") {
            fileType = "xml";
        } else if (extension === "png" || extension === "jpg" || extension === "jpeg") {
            fileType = "image";
        } else if (extension === "mp3" || extension === "wav") {
            fileType = "sound";
        } else if (extension === "dll") {
            fileType = "binary";
        }
    }

    if (fileList[path]) {
        fileList[path].isFolder = isDir;
        fileList[path].children = children;
        fileList[path].name = fileName;
        fileList[path].fileType = fileType;
    } else {
        fileList[path] = new ProjectFile(isDir, children, extension, fileName, path, fileType);
    }

    return fileList[path];
}

export default async function buildProjectFiles(
    currentFiles: FileMap,
    projectPath: string
): Promise<ProjectFile[]> {
    const rootFilePaths: string[] = await invoke("list_dir", {
        path: projectPath
    });
    const rootFiles: ProjectFile[] = [];

    for (const rootFilePath of rootFilePaths) {
        rootFiles.push(await recursiveBuild(rootFilePath, projectPath, currentFiles));
    }

    return rootFiles;
}
