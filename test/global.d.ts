import { SpyInstance } from "vitest";
import { AppStore } from "../src/MainWindow/Store/Store";
import MockedFileSystem from "./Mocks/MockedFileSystem";
import { MockedDialog } from "./Mocks/MockedTauri";

declare global {
    interface Window {
        fs: MockedFileSystem;
    }
}

declare module "vitest" {
    export interface TestContext {
        mockFs: MockedFileSystem;
        mockDialog: MockedDialog;
        tauriIPCSpy: SpyInstance;
        mockStore: AppStore;
    }
}
