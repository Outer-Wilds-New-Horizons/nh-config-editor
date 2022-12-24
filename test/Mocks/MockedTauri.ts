// Contains the mocked Tauri modules.

import { BaseDirectory } from "@tauri-apps/api/fs";
import { fallbackSchemas } from "../../src/Common/AppData/SchemaStore";

export type MockedDialog = {
    openDialogMockReturn?: string;
    saveDialogMockReturn?: string;
    askDialogMockReturn?: boolean;
};

export type TauriMessage = { __tauriModule: string; message: object };
type AppModuleMessage = { cmd: string };
type OsModuleMessage = { cmd: string };
type PathModuleMessage = { cmd: string; path: string; directory: BaseDirectory };
type DialogModuleMessage = { cmd: string };
type HttpModuleMessage = { cmd: string; options: { url: string; responseType: number } };

export const baseMock = (args: TauriMessage, mockedDiag: MockedDialog) => {
    switch (args.__tauriModule) {
        case "App":
            return appModule(args.message as AppModuleMessage);
        case "Os":
            return osModule(args.message as OsModuleMessage);
        case "Path":
            return pathModule(args.message as PathModuleMessage);
        case "Dialog":
            return dialogModule(args.message as DialogModuleMessage, mockedDiag);
        case "Http":
            return httpModule(args.message as HttpModuleMessage);
    }
};

const appModule = (message: AppModuleMessage) => {
    switch (message.cmd) {
        case "getAppVersion":
            return "0.0.0";
        case "getTauriVersion":
            return "0.0.0";
    }
};

const osModule = (message: OsModuleMessage) => {
    switch (message.cmd) {
        case "platform":
            return "linux";
        case "arch":
            return "x86_64";
        case "osType":
            return "Linux";
    }
};

const paths: Record<BaseDirectory, string> = {
    1: "Audio",
    2: "Cache",
    3: "Config",
    4: "Data",
    5: "LocalData",
    6: "Desktop",
    7: "Document",
    8: "Download",
    9: "Executable",
    10: "Font",
    11: "Home",
    12: "Picture",
    13: "Public",
    14: "Runtime",
    15: "Template",
    16: "Video",
    17: "Resource",
    18: "App",
    19: "Log",
    20: "Temp",
    21: "App",
    22: "App",
    23: "App",
    24: "App",
    25: "App"
};

const pathModule = (message: PathModuleMessage) => {
    const baseDir = paths[message.directory];
    switch (message.cmd) {
        case "resolvePath":
            return message.path === "" ? baseDir : `${baseDir}\\${message.path}`;
    }
};

const dialogModule = (message: DialogModuleMessage, mockDiag: MockedDialog) => {
    switch (message.cmd) {
        case "openDialog":
            return mockDiag.openDialogMockReturn;
        case "saveDialog":
            return mockDiag.saveDialogMockReturn;
        case "askDialog":
            return mockDiag.askDialogMockReturn;
    }
};

const httpModule = (message: HttpModuleMessage) => {
    if (message.cmd === "httpRequest") {
        const schema = fallbackSchemas[message.options.url.split("/").pop()!];
        return {
            status: 200,
            data: JSON.stringify(schema)
        };
    }
};
