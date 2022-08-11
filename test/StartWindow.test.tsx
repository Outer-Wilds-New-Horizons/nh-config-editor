import { mockWindows } from "@tauri-apps/api/mocks";
import { afterEach, beforeEach, describe, expect, it, TestContext } from "vitest";

import { render, screen, waitFor } from "@testing-library/react";
import StartWindow from "../src/StartWindow/StartWindow";
import {
    expectAskQuestion,
    expectFileWriteCommand,
    expectLoadRecentProjectsCommand,
    expectMainWindowOpenWithPath,
    expectQuitCommand,
    expectTauriCommand,
    setupTestProject
} from "./Utils";

beforeEach(() => {
    mockWindows("start");
    window.location.hash = "#START";
});

afterEach(() => {
    window.location.hash = "";
});

const setupWindow = async (ctx: TestContext, expectLoadRecent = true) => {
    render(<StartWindow />);
    if (expectLoadRecent) {
        await expectTauriCommand(ctx, expectLoadRecentProjectsCommand);
    }
};

const expectProjectError = async (): Promise<HTMLElement> => {
    const projectError = await screen.findByText("Error Loading Project");
    expect(projectError).toBeDefined();
    return projectError;
};

const expectProjectLoaded = async (): Promise<HTMLElement> => {
    const projectName = await screen.findByText("Example Project");
    expect(projectName).toBeDefined();
    return projectName;
};

const expectProjectOpened = async (ctx: TestContext) => {
    await waitFor(() =>
        expect(ctx.tauriIPCSpy).toHaveBeenCalledWith(
            expectMainWindowOpenWithPath("Test/Project/Path")
        )
    );
};

describe("Start Window", async () => {
    it("Should Render", async (ctx) => {
        await setupWindow(ctx, false);
        expect(screen.getByText("New Horizons Config Editor")).toBeDefined();
    });

    it("Should Close When Clicking Close", async (ctx) => {
        await setupWindow(ctx, false);
        const closeButton = screen.getByRole("button", { name: "Quit" });
        closeButton.click();
        await expectTauriCommand(ctx, expectQuitCommand);
    });
});

describe("Recent Projects", async () => {
    it("Should Load Recent Projects", async (ctx) => {
        setupTestProject(ctx.mockFs);
        await setupWindow(ctx);
        await expectProjectLoaded();
    });

    it("Should Remove Recent Projects On Delete", async (ctx) => {
        setupTestProject(ctx.mockFs);
        await setupWindow(ctx);
        await expectProjectLoaded();
        const deleteButton = await screen.findByLabelText("Delete");
        deleteButton.click();
        await expectTauriCommand(ctx, expectFileWriteCommand("App/recent_projects.json", "[]"));
    });

    it("Should Show A Message When A Project Is Not Found", async (ctx) => {
        ctx.mockFs.setFromObject({
            "App/recent_projects.json": JSON.stringify(["Test/Project/Path"])
        });
        await setupWindow(ctx);
        await expectProjectError();
    });

    it("Should Show A Message When A Project Isn't A Folder", async (ctx) => {
        ctx.mockFs.setFromObject({
            "App/recent_projects.json": JSON.stringify(["Test/Project/Path.json"]),
            "Test/Project/Path.json": "{}"
        });
        await setupWindow(ctx);
        await expectProjectError();
    });

    it("Should Show A Message When A Project Has No Manifest", async (ctx) => {
        ctx.mockFs.setFromObject({
            "App/recent_projects.json": JSON.stringify(["Test/Project/Path"]),
            "Test/Project/Path/unrelated.json": "{}"
        });
        await setupWindow(ctx);
        await expectProjectError();
    });

    it("Should Show A Message When The Manifest Is Malformed", async (ctx) => {
        ctx.mockFs.setFromObject({
            "App/recent_projects.json": JSON.stringify(["Test/Project/Path"]),
            "Test/Project/Path/manifest.json": "not valid json!"
        });
        await setupWindow(ctx);
        await expectProjectError();
    });

    it("Should Show A Message When The Manifest Is Empty", async (ctx) => {
        ctx.mockFs.setFromObject({
            "App/recent_projects.json": JSON.stringify(["Test/Project/Path"]),
            "Test/Project/Path/manifest.json": JSON.stringify({})
        });
        await setupWindow(ctx);
        await expectProjectError();
    });

    it("Should Show A Message When There's No Recent Projects", async (ctx) => {
        ctx.mockFs.setFromObject({
            "App/recent_projects.json": JSON.stringify([])
        });
        await setupWindow(ctx);
        const message = await screen.findByText(
            "When you create or open projects, they'll show up here."
        );
        expect(message).toBeDefined();
    });
});

describe("Project Open", async () => {
    it("Should Open A Recent Project", async (ctx) => {
        setupTestProject(ctx.mockFs);
        await setupWindow(ctx);
        const projectName = await expectProjectLoaded();
        projectName.click();
        await expectProjectOpened(ctx);
    });

    it("Should Open An Existing Project", async (ctx) => {
        setupTestProject(ctx.mockFs, false);
        await setupWindow(ctx);
        ctx.mockDialog.openDialogMockReturn = "Test/Project/Path";
        const openProjectButton = screen.getByRole("button", { name: "Open Project" });
        expect(openProjectButton).toBeDefined();
        openProjectButton.click();
        await expectProjectOpened(ctx);
    });

    it("Should Show A Message When Opening An Invalid Project", async (ctx) => {
        ctx.mockFs.setFromObject({
            "App/recent_projects.json": JSON.stringify(["Test/Project/Path"])
        });
        await setupWindow(ctx);
        ctx.mockDialog.askDialogMockReturn = true;
        const projectError = await expectProjectError();
        projectError.click();
        await expectTauriCommand(
            ctx,
            expectAskQuestion(
                "This project is no longer valid. Do you want to remove it from recent projects?"
            )
        );
        await expectTauriCommand(ctx, expectFileWriteCommand("App/recent_projects.json", "[]"));
    });
});
