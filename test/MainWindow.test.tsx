import { mockWindows } from "@tauri-apps/api/mocks";
import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, it, TestContext, expect } from "vitest";
import MainWindow from "../src/MainWindow/MainWindow";
import { setupStore } from "../src/MainWindow/Store/Store";
import {
    expectFileReadCommand,
    expectFileWriteCommand,
    expectMessageBox,
    expectNotTauriCommand,
    expectQuitCommandWithError,
    expectTauriCommand,
    setupTestProject,
    TEST_PROJECT_STRUCTURE
} from "./Utils";

beforeEach((ctx) => {
    mockWindows("main");
    window.location.hash = "#MAIN";
    ctx.mockStore = setupStore();
});

afterEach(() => {
    window.location.hash = "";
    window.history.replaceState({}, "", "/");
});

const expectProjectLoaded = async (ctx: TestContext) => {
    await expectTauriCommand(
        ctx,
        expect.objectContaining({
            cmd: "walk_project",
            path: "Test/Project/Path"
        })
    );
};

const setupWindow = (ctx: TestContext, addProjectPath = true) => {
    if (addProjectPath) {
        const newURL = new URL(window.location.href);
        newURL.searchParams.set("path", "Test/Project/Path");
        window.history.replaceState({}, "", newURL.href);
    }
    render(<MainWindow testStore={ctx.mockStore} />);
};

const getOpenFile = (ctx: TestContext, relativePath: string) => {
    const file = ctx.mockStore.getState().openFiles.entities[relativePath];
    expect(file).toBeDefined();
    return file!;
};

describe("Main Window", () => {
    it("Should Render", async (ctx) => {
        setupTestProject(ctx.mockFs);
        setupWindow(ctx);
    });
});

describe("Project Loading", () => {
    it("Should Load Projects", async (ctx) => {
        setupTestProject(ctx.mockFs);
        setupWindow(ctx);
        await expectProjectLoaded(ctx);
        const header = await screen.findByText("Example Project");
        expect(header).toBeDefined();
        const planetsFolder = await screen.findByText("planets");
        expect(planetsFolder).toBeDefined();
        const testPlanet = await screen.findByText("test_planet_1.json");
        expect(testPlanet).toBeDefined();
    });

    it("Should Show An Error When No Path Is Provided", async (ctx) => {
        setupWindow(ctx, false);
        await expectTauriCommand(ctx, expectMessageBox("No Project Path Specified"));
        await expectTauriCommand(ctx, expectQuitCommandWithError);
    });

    it("Should Show An Error When The Project Path Is Invalid", async (ctx) => {
        setupWindow(ctx);
        await expectTauriCommand(ctx, expectMessageBox(expect.stringContaining("does not exist")));
        await expectTauriCommand(ctx, expectQuitCommandWithError);
    });

    it("Should Show An Error When The Project Path Is Not A Directory", async (ctx) => {
        ctx.mockFs.createFileWithParent("Test/Project/Path", "Test Project");
        setupWindow(ctx);
        await expectTauriCommand(
            ctx,
            expectMessageBox(expect.stringContaining("is not a directory"))
        );
        await expectTauriCommand(ctx, expectQuitCommandWithError);
    });

    it("Should Show An Error When There's No Manifest", async (ctx) => {
        ctx.mockFs.createFolderAll("Test/Project/Path");
        setupWindow(ctx);
        await expectTauriCommand(
            ctx,
            expectMessageBox(expect.stringContaining("does not have a manifest"))
        );
        await expectTauriCommand(ctx, expectQuitCommandWithError);
    });

    it("Should Show An Error When The Manifest Is Malformed", async (ctx) => {
        ctx.mockFs.createFileWithParent("Test/Project/Path/manifest.json", "i'm bad json!");
        setupWindow(ctx);
        await expectTauriCommand(
            ctx,
            expectMessageBox(expect.stringContaining("has invalid manifest"))
        );
        await expectTauriCommand(ctx, expectQuitCommandWithError);
    });

    it("Should Show An Error When The Manifest Is Missing Required Fields", async (ctx) => {
        ctx.mockFs.createFileWithParent("Test/Project/Path/manifest.json", "{}");
        setupWindow(ctx);
        await expectTauriCommand(
            ctx,
            expectMessageBox(expect.stringContaining("does not have a name or unique name"))
        );
        await expectTauriCommand(ctx, expectQuitCommandWithError);
    });
});

describe("Schemas", () => {
    it("Should Save Schemas To The Store File", async (ctx) => {
        setupTestProject(ctx.mockFs);
        setupWindow(ctx);
        await expectProjectLoaded(ctx);
        await expectTauriCommand(
            ctx,
            expect.objectContaining({
                cmd: "tauri",
                __tauriModule: "Http",
                message: expect.objectContaining({
                    cmd: "httpRequest",
                    options: expect.objectContaining({
                        url: expect.stringContaining("body_schema.json")
                    })
                })
            })
        );
        await expectTauriCommand(
            ctx,
            expectFileWriteCommand("App/schema_store.json", expect.stringContaining("main"))
        );
    });

    it("Should Load Schemas From The Store File", async (ctx) => {
        setupTestProject(ctx.mockFs);
        ctx.mockFs.createFileWithParent(
            "App/schema_store.json",
            JSON.stringify({
                lastBranch: "main",
                lastUpdate: Date(),
                schemas: {
                    "body_schema.json": JSON.stringify({ $schema: "testing" })
                }
            })
        );
        setupWindow(ctx);
        await expectProjectLoaded(ctx);
        await expectNotTauriCommand(
            ctx,
            expect.objectContaining({
                cmd: "tauri",
                __tauriModule: "Http",
                message: expect.objectContaining({
                    cmd: "httpRequest",
                    options: expect.objectContaining({
                        url: expect.stringContaining("body_schema.json")
                    })
                })
            })
        );
    });
});

describe("File Opening", () => {
    beforeEach(async (ctx) => {
        setupTestProject(ctx.mockFs);
        setupWindow(ctx);
        await expectProjectLoaded(ctx);
    });

    it("Should Open A File", async (ctx) => {
        const planet1 = await screen.findByText("test_planet_1.json");
        expect(planet1).toBeDefined();
        planet1.click();
        await expectTauriCommand(
            ctx,
            expectFileReadCommand("Test/Project/Path/planets/test_planet_1.json")
        );
        expect(ctx.mockStore.getState().openFiles.tabs).toEqual(["planets/test_planet_1.json"]);
        await waitFor(() =>
            expect(getOpenFile(ctx, "planets/test_planet_1.json").loadState.status).toEqual("done")
        );
        expect(getOpenFile(ctx, "planets/test_planet_1.json").diskData).toEqual(
            TEST_PROJECT_STRUCTURE["Test/Project/Path/planets/test_planet_1.json"]
        );
    });
});
