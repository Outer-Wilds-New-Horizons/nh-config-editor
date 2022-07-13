import { invoke } from "@tauri-apps/api/tauri";

export type TauriCommands = {
    fileExists: (path: string) => Promise<boolean>;
    getFileMetadata: (path: string) => Promise<[string, string]>;
    isDirectory: (path: string) => Promise<boolean>;
    listDirectory: (path: string) => Promise<string[]>;
    rootDirectory: (path: string, rootPath: string) => Promise<string>;
    loadBase64Image: (imgPath: string) => Promise<string>;
    readFileText: (path: string) => Promise<string>;
    writeFileText: (path: string, content: string) => Promise<void>;
    copyFile: (src: string, dest: string) => Promise<void>;
    deleteFile: (path: string) => Promise<void>;
    makeDirectory: (path: string) => Promise<void>;
    copyDirectory: (src: string, dest: string) => Promise<void>;
    deleteDirectory: (path: string) => Promise<void>;
    buildProject: (path: string, outputZipName: string, minify: boolean) => Promise<void>;
    runGame: (owmlPath: string, port: number) => Promise<void>;
};

export const tauriCommands: TauriCommands = {
    fileExists: async (path) => await invoke("file_exists", { path }),
    getFileMetadata: async (path) => await invoke("get_metadata", { path }),
    isDirectory: async (path) => await invoke("is_dir", { path }),
    listDirectory: async (path) => await invoke("list_dir", { path }),
    rootDirectory: async (path, rootPath) => await invoke("root_dir", { path, rootPath }),
    loadBase64Image: async (imgPath) => await invoke("load_image_as_base_64", { imgPath }),
    readFileText: async (path) => await invoke("read_file_as_string", { path }),
    writeFileText: async (path, content) => await invoke("write_file_as_string", { path, content }),
    copyFile: async (src, dest) => await invoke("copy_file", { src, dest }),
    deleteFile: async (path) => await invoke("delete_file", { path }),
    makeDirectory: async (path) => await invoke("mk_dir", { path }),
    copyDirectory: async (src, dest) => await invoke("copy_dir", { src, dest }),
    deleteDirectory: async (path) => await invoke("delete_dir", { path }),
    buildProject: async (path, outputZipName, minify) =>
        await invoke("zip_project", { path, outputZipName, minify }),
    runGame: async (owmlPath, port) => await invoke("run_game", { owmlPath, port })
};
