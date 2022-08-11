import { clearMocks, mockIPC } from "@tauri-apps/api/mocks";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";
import { ProjectFile } from "../src/MainWindow/Store/ProjectFilesSlice";
import MockedFileSystem from "./Mocks/MockedFileSystem";
import { baseMock, TauriMessage } from "./Mocks/MockedTauri";

const mockWalkProject = (path: string, mockFs: MockedFileSystem): ProjectFile[] => {
    return mockFs.walkFolder(path).map((file) => ({
        name: file.name,
        extension: file.extension,
        absolutePath: file.path,
        relativePath: file.path.replace(`${path}/`, ""),
        isFolder: file.isFolder
    }));
};

const truncate = (str: string, maxLength: number) => {
    return str.length > maxLength ? `${str.substring(0, maxLength)}...` : str;
};

beforeEach((ctx) => {
    ctx.mockFs = new MockedFileSystem();
    ctx.mockDialog = {};
    mockIPC((cmd, args) => {
        console.debug("Mock IPC Call:", cmd, truncate(JSON.stringify(args), 200));
        if (cmd === "tauri") {
            return baseMock(args as TauriMessage, ctx.mockDialog);
        } else {
            switch (cmd) {
                case "file_exists":
                    return ctx.mockFs.fileExists((args as { path: string }).path);
                case "read_file_as_string":
                    return ctx.mockFs.readFile((args as { path: string }).path);
                case "write_string_to_file":
                    return ctx.mockFs.writeFile(
                        (args as { path: string }).path,
                        (args as { content: string }).content,
                        true
                    );
                case "delete_file":
                    return ctx.mockFs.deleteFile((args as { path: string }).path);
                case "delete_dir":
                    return ctx.mockFs.deleteFolder((args as { path: string }).path);
                case "copy_file":
                    return ctx.mockFs.copyFile(
                        (args as { src: string }).src,
                        (args as { dest: string }).dest
                    );
                case "copy_dir":
                    return ctx.mockFs.copyFolder(
                        (args as { src: string }).src,
                        (args as { dest: string }).dest
                    );
                case "zip_project":
                    return null;
                case "run_game":
                    return null;
                case "mk_dir":
                    return ctx.mockFs.createFolder((args as { path: string }).path);
                case "is_dir":
                    return ctx.mockFs.isFolder((args as { path: string }).path);
                case "walk_project":
                    return mockWalkProject((args as { path: string }).path, ctx.mockFs);
                default:
                    throw new Error(`Unknown command: ${cmd}`);
            }
        }
    });
    ctx.tauriIPCSpy = vi.spyOn(window, "__TAURI_IPC__");
});

afterEach((ctx) => {
    cleanup(); // Remove all React elements created by the test
    clearMocks(); // Clear Tauri Mocks
    vi.clearAllMocks(); // Clear vitest mocks
    // Set it to this because for some reason command are invoked after this is called,
    // but before the next beforeEach is called???
    window.__TAURI_IPC__ = async () => console.debug("gorp");
});
