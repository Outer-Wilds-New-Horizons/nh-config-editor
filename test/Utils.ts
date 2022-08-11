import { waitFor } from "@testing-library/react";
import { expect, TestContext } from "vitest";
import MockedFileSystem from "./Mocks/MockedFileSystem";

export const expectTauriCommand = async (ctx: TestContext, cmd: unknown) => {
    await waitFor(() => expect(ctx.tauriIPCSpy).toHaveBeenCalledWith(cmd));
};

export const expectNotTauriCommand = (ctx: TestContext, cmd: unknown) => {
    expect(ctx.tauriIPCSpy).not.toHaveBeenCalledWith(cmd);
};

export const expectQuitCommand = expect.objectContaining({
    cmd: "tauri",
    __tauriModule: "Process",
    message: {
        cmd: "exit",
        exitCode: 0
    }
});

export const expectQuitCommandWithError = expect.objectContaining({
    cmd: "tauri",
    __tauriModule: "Process",
    message: {
        cmd: "exit",
        exitCode: 1
    }
});

export const expectFileReadCommand = (path: string) => {
    return expect.objectContaining({
        cmd: "read_file_as_string",
        path: path
    });
};

export const expectFileWriteCommand = (path: string, contents: string) =>
    expect.objectContaining({
        cmd: "write_string_to_file",
        path: path,
        content: contents
    });

export const expectLoadRecentProjectsCommand = expect.objectContaining({
    cmd: "read_file_as_string",
    path: "App/recent_projects.json"
});

export const expectSettingsLoadCommand = expect.objectContaining({
    cmd: "read_file_as_string",
    path: "App/settings.json"
});

export const expectMessageBox = (message: string) =>
    expect.objectContaining({
        cmd: "tauri",
        __tauriModule: "Dialog",
        message: expect.objectContaining({
            cmd: "messageDialog",
            message: message
        })
    });

export const expectAskQuestion = (question: string) =>
    expect.objectContaining({
        cmd: "tauri",
        __tauriModule: "Dialog",
        message: expect.objectContaining({
            cmd: "askDialog",
            message: question
        })
    });

export const expectMainWindowOpenWithPath = (path: string) =>
    expect.objectContaining({
        cmd: "tauri",
        __tauriModule: "Window",
        message: {
            cmd: "createWebview",
            data: {
                options: expect.objectContaining({
                    label: "main",
                    url: `index.html?path=${encodeURIComponent(path)}#MAIN`
                })
            }
        }
    });

export const TEST_PROJECT_MANIFEST_DATA = JSON.stringify({
    name: "Example Project",
    uniqueName: "Example.Project",
    author: "Example"
});

export const TEST_PROJECT_STRUCTURE = {
    "Test/Project/Path/manifest.json": TEST_PROJECT_MANIFEST_DATA,
    "Test/Project/Path/planets/test_planet_1.json": '{"name": "Test Planet 1"}',
    "Test/Project/Path/systems/TestSystem.json": "{}",
    "Test/Project/Path/NewHorizonsConfig.dll": ""
};

export const setupTestProject = (mockFs: MockedFileSystem, setAsRecent = true) => {
    if (setAsRecent) {
        mockFs.createFileWithParent(
            "App/recent_projects.json",
            JSON.stringify(["Test/Project/Path"])
        );
    } else {
        mockFs.createFileWithParent("App/recent_projects.json", "[]");
    }
    mockFs.setFromObject(TEST_PROJECT_STRUCTURE);
};
