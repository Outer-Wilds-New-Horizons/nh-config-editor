import { clipboard, process, shell } from "@tauri-apps/api";
import { ask, message } from "@tauri-apps/api/dialog";
import { sep } from "@tauri-apps/api/path";
import { exit } from "@tauri-apps/api/process";
import { appWindow, CloseRequestedEvent, getCurrent, WebviewWindow } from "@tauri-apps/api/window";

import { useEffect, useState } from "react";
import {
    ArrowLeft,
    ArrowLeftRight,
    ArrowRight,
    ArrowUpRightCircleFill,
    Asterisk,
    ClipboardFill,
    Save2Fill,
    TrashFill,
    XCircleFill
} from "react-bootstrap-icons";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import { openAboutWindow } from "../AboutWindow/AboutWindow";
import SchemaStoreManager from "../Common/AppData/SchemaStore";
import ContextMenu from "../Common/ContextMenu/ContextMenu";
import ContextMenuRoot, {
    ContextMenuActionRegistry,
    ContextMenuState
} from "../Common/ContextMenu/ContextMenuRoot";
import IconDropDownItem from "../Common/IconDropDownItem";
import setupKeyboardShortcuts, { KeyboardShortcutMapping } from "../Common/KeyboardManager";
import { getModManagerSettings } from "../Common/ModManager";
import { Project } from "../Common/Project";
import { tauriCommands } from "../Common/TauriCommands";
import { openRunWindow } from "../RunWindow/RunWindow";
import { openSettingsWindow } from "../SettingsWindow/SettingsWindow";
import { useSettings } from "../Wrapper";

import "./main_window.css";
import MainWindowMenuBar from "./MainWindowMenuBar";
import EditorFrame from "./Panels/Editor/EditorFrame";
import { ProjectFile, ProjectFileType } from "./Panels/ProjectView/ProjectFile";
import ProjectView from "./Panels/ProjectView/ProjectView";
import buildProjectFiles, { FileMap } from "./ProjectCrawler";

const projectPath = new URLSearchParams(window.location.search).get("path");

let project: Project | null = null;

if (projectPath === null) {
    await message("No project path specified", {
        type: "error",
        title: "Error"
    });
    await exit(1);
} else {
    try {
        project = await Project.load(decodeURIComponent(projectPath));
    } catch (e) {
        await message(`${e}`, {
            type: "error",
            title: "Error"
        });
        await exit(1);
    }
}

const keyboardShortcuts: KeyboardShortcutMapping = {
    newPlanet: "CommandOrControl+Shift+P",
    newSystem: "CommandOrControl+Shift+S",
    newTranslation: "CommandOrControl+Shift+L",
    makeManifest: "CommandOrControl+Shift+A",
    save: "CommandOrControl+S",
    saveAll: "CommandOrControl+Alt+S",
    reloadFromDisk: "CommandOrControl+R",
    closeAll: "CommandOrControl+W",
    settings: "CommandOrControl+I",
    closeProject: "CommandOrControl+Alt+W",
    quit: "CommandOrControl+Q",
    openExplorer: "CommandOrControl+Q",
    run: "F4",
    output: "F6",
    build: "F7",
    help: "F1",
    about: "F2",
    reloadSchemas: "CommandOrControl+Alt+I",
    softReset: "CommandOrControl+Alt+R"
};

// Manages menubar buttons and keyboard shortcuts
const actionRegistry: { [key: string]: (p?: unknown) => void } = {};

appWindow.onCloseRequested(async (e) => {
    await actionRegistry["onCloseRequested"](e);
});

// Manages context menu items
const contextMenuRegistry: ContextMenuActionRegistry = {
    file: {},
    editorTab: {}
};

await setupKeyboardShortcuts(keyboardShortcuts, (id) => {
    console.debug(`Keyboard shortcut "${id}" triggered`);
    actionRegistry[id]?.();
});

const schemaStore = await SchemaStoreManager.get();

function MainWindow() {
    // #region States

    const [openFiles, setOpenFiles] = useState<ProjectFile[]>([]);
    const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null);
    const [fileMap, setFileMap] = useState<FileMap | null>({});
    const [fileTree, setFileTree] = useState<ProjectFile[] | null>(null);
    const [contextMenuState, setContextMenuState] = useState<ContextMenuState>({
        x: 0,
        y: 0,
        currentId: "",
        target: null
    });

    const resetContextMenuState = () => {
        if (contextMenuState.target !== null) {
            setContextMenuState({
                x: 0,
                y: 0,
                currentId: "",
                target: null
            });
        }
    };

    // #endregion

    const settings = useSettings();

    if (project === null) {
        process.exit(1);
        return null;
    }

    // #region Utility Functions

    const filesHaveChanged = () =>
        openFiles.length > 0 && openFiles.filter((file) => file.changed).length > 0;

    const checkFile = async (file: ProjectFile, autoRefresh = true): Promise<boolean> => {
        if (file.path.startsWith("@@void@@")) return true;

        const exists: boolean = await tauriCommands.fileExists(file.path);
        if (!exists && autoRefresh) {
            await message(`File ${file.path} does not exist`, {
                type: "error",
                title: "Error"
            });
            await invalidateFileSystem();
            forceCloseFile(file);
        }
        return exists;
    };

    const openFile = (file: ProjectFile) => {
        console.debug("Opening file:", file);
        checkFile(file).then((exists) => {
            if (exists) {
                if (openFiles.includes(file)) {
                    setSelectedFile(file);
                } else {
                    setSelectedFile(file);
                    setOpenFiles([...openFiles, file]);
                }
            }
        });
    };

    const saveFile = async (file: ProjectFile) => {
        console.debug("Saving file:", file);
        if (file.path.startsWith("@@void@@")) {
            await file.saveAs(project!.path).then((newPath) => {
                if (newPath !== null) {
                    file.path = newPath;
                    file.changed = false;
                    setOpenFiles([...openFiles]);
                    invalidateFileSystem();
                }
            });
        } else {
            await file.save();
        }
        setOpenFiles([...openFiles]);
    };

    const invalidateFileSystem = () => {
        buildProjectFiles(fileMap ?? {}, project!.path).then((newFileTree) => {
            setFileTree(newFileTree);
            setFileMap({ ...fileMap });
            console.debug("File System Reloaded");
        });
        setFileTree(null);
    };

    const trySelectFirst = (projectFiles?: ProjectFile[]) => {
        const projectFilesToUse = projectFiles ?? openFiles;
        if (projectFilesToUse.length === 0) {
            setSelectedFile(null);
        } else if (projectFilesToUse.filter((f) => f === selectedFile).length === 0) {
            setSelectedFile(projectFilesToUse[0]);
        }
    };

    const forceCloseFile = (file: ProjectFile) => {
        const newOpenFiles = openFiles.filter((f) => f !== file);
        file.data = null;
        setOpenFiles(newOpenFiles);
        trySelectFirst(newOpenFiles);
    };

    const closeFile = (file: ProjectFile) => {
        if (file.changed)
            ask("Are you sure you want to close this file without saving?", {
                type: "warning",
                title: file.name
            }).then((result) => {
                if (result) forceCloseFile(file);
            });
        else {
            forceCloseFile(file);
        }
    };

    const createNewFile = (fileType: ProjectFileType, ext: string) => {
        let currentNumber = 1;

        while (
            openFiles.filter((f) => f.name === `new_${fileType}_${currentNumber}.json`).length > 0
        )
            currentNumber++;

        ProjectFile.createVoid(`new_${fileType}_${currentNumber}.json`, fileType, ext).then(
            openFile
        );
    };

    const buildProject = async () => {
        console.debug("Building project...");
        for (const file of openFiles) {
            await file.save();
        }
        setOpenFiles([...openFiles]);
        await tauriCommands.buildProject(
            project!.path,
            `${project!.uniqueName}.zip`,
            settings.minify
        );
        invalidateFileSystem();
        await shell.open(`${project!.path}${sep}build`);
        console.debug("Project built");
    };
    // #endregion

    useEffect(invalidateFileSystem, []);

    // #region File Actions

    actionRegistry["newPlanet"] = () => createNewFile("planet", "json");
    actionRegistry["newSystem"] = () => createNewFile("system", "json");
    actionRegistry["newTranslation"] = () => createNewFile("translation", "json");

    actionRegistry["makeManifest"] = async () => {
        const filePath = `${project!.path}${sep}addon-manifest.json`;
        if (!(await tauriCommands.fileExists(filePath))) {
            const newFile = new ProjectFile(
                false,
                [],
                "json",
                "addon-manifest.json",
                filePath,
                "addon_manifest"
            );
            newFile.data = {};
            await newFile.save();
            invalidateFileSystem();
        }
    };

    actionRegistry["save"] = () => {
        if (selectedFile) saveFile(selectedFile);
    };

    actionRegistry["saveAll"] = async () => {
        for (const file of openFiles) {
            await saveFile(file);
        }
        setOpenFiles([...openFiles]);
    };

    actionRegistry["closeAll"] = () => {
        if (filesHaveChanged()) {
            ask("There are unsaved changes. Are you sure you want to close all files?", {
                type: "warning",
                title: "Close All Files"
            }).then((result) => {
                if (result) {
                    for (const file of openFiles) {
                        file.data = null;
                    }
                    setOpenFiles([]);
                    setSelectedFile(null);
                }
            });
        } else {
            for (const file of openFiles) {
                file.data = null;
            }
            setOpenFiles([]);
            setSelectedFile(null);
        }
    };

    actionRegistry["reloadFromDisk"] = invalidateFileSystem;

    actionRegistry["settings"] = openSettingsWindow;

    actionRegistry["closeProject"] = async () => {
        if (filesHaveChanged()) {
            const result = await ask(
                "There are unsaved changes, are you sure you want to close the project?",
                {
                    type: "warning",
                    title: "Close Project"
                }
            );
            if (!result) return;
        }

        const webview = new WebviewWindow("welcome", {
            url: "index.html#START",
            title: "Welcome",
            center: true,
            minWidth: 1100,
            width: 1100,
            height: 650,
            minHeight: 650,
            resizable: true,
            maximized: true
        });

        await webview.once("tauri://created", () => {
            WebviewWindow.getByLabel("run-game")?.close();
            getCurrent().close();
        });
    };

    actionRegistry["quit"] = () => {
        if (filesHaveChanged()) {
            ask("There are unsaved changes. Are you sure you want to quit?", {
                type: "warning",
                title: "Quit"
            }).then((result) => {
                if (result) {
                    exit(0);
                }
            });
        } else {
            exit(0);
        }
    };

    actionRegistry["onCloseRequested"] = async (e: unknown) => {
        if (filesHaveChanged()) {
            const result = await ask("There are unsaved changes. Are you sure you want to close?", {
                type: "warning",
                title: "Close"
            });
            if (!result) {
                (e as CloseRequestedEvent).preventDefault();
            }
        }
    };

    // #endregion

    // #region Project Actions

    actionRegistry["openExplorer"] = () => {
        shell.open(project!.path);
    };

    actionRegistry["run"] = () => {
        openRunWindow(project!.path);
    };

    actionRegistry["output"] = async () => {
        try {
            const modManagerSettings = await getModManagerSettings();
            const outputPath = `${modManagerSettings.owmlPath}${sep}Mods`;
            await project?.copyToModsFolder(outputPath);
        } catch (e) {
            await message(`${e}`.toString(), {
                type: "error",
                title: "Error"
            });
        }
    };

    actionRegistry["build"] = buildProject;

    // #endregion

    // #region About Actions

    actionRegistry["help"] = () => message("No", { title: "" });

    actionRegistry["about"] = openAboutWindow;

    const confirmReload = async () =>
        ask("There are unsaved changes. Are you sure you want to reload?", {
            type: "warning",
            title: "Reload"
        });

    actionRegistry["reloadSchemas"] = async () => {
        if (filesHaveChanged()) {
            const result = await confirmReload();
            if (!result) return;
        }
        await SchemaStoreManager.reset();
        window.location.reload();
    };

    actionRegistry["softReset"] = async () => {
        if (filesHaveChanged()) {
            const result = await confirmReload();
            if (!result) return;
        }
        window.location.reload();
    };

    // #endregion

    // #region ProjectFile Context Actions

    contextMenuRegistry["file"]["openInDefault"] = (file: unknown) => {
        if (file instanceof ProjectFile) {
            shell.open(file.path);
        }
    };

    contextMenuRegistry["file"]["copyPath"] = (file: unknown) => {
        if (file instanceof ProjectFile) {
            clipboard.writeText(file.path);
        }
    };

    contextMenuRegistry["file"]["deleteFile"] = (file: unknown) => {
        if (file instanceof ProjectFile) {
            ask(`Are you sure you want to delete this ${file.isFolder ? "folder" : "file"}?`, {
                type: "warning",
                title: file.name
            }).then((result) => {
                if (result) {
                    file.delete().then(() => {
                        forceCloseFile(file);
                        invalidateFileSystem();
                    });
                }
            });
        }
    };

    // #endregion

    // #region EditorTab Context Actions

    contextMenuRegistry["editorTab"]["externalEditor"] = (index: unknown) => {
        shell.open(openFiles[index as number].path);
    };

    contextMenuRegistry["editorTab"]["save"] = (index: unknown) => {
        saveFile(openFiles[index as number]);
    };

    contextMenuRegistry["editorTab"]["close"] = (index: unknown) => {
        closeFile(openFiles[index as number]);
    };

    contextMenuRegistry["editorTab"]["closeRight"] = (index: unknown) => {
        const newOpen = openFiles.filter((o, i) => o.changed || i <= (index as number));
        setOpenFiles(newOpen);
        trySelectFirst(newOpen);
    };

    contextMenuRegistry["editorTab"]["closeLeft"] = (index: unknown) => {
        const newOpen = openFiles.filter((o, i) => o.changed || i >= (index as number));
        setOpenFiles(newOpen);
        trySelectFirst(newOpen);
    };

    contextMenuRegistry["editorTab"]["closeOtherTabs"] = (index: unknown) => {
        const newOpen = openFiles.filter((o, i) => o.changed || i === index);
        setOpenFiles(newOpen);
        trySelectFirst(newOpen);
    };

    contextMenuRegistry["editorTab"]["closeAllUnchanged"] = () => {
        const newOpen = openFiles.filter((o) => o.changed);
        setOpenFiles(newOpen);
        trySelectFirst(newOpen);
    };

    // #endregion

    return (
        <>
            <ContextMenuRoot
                onMenuItemClicked={(menuId, actionId, target) => {
                    console.debug(`Context Action ${menuId}/${actionId} Done On:`, target);
                    contextMenuRegistry[menuId]?.[actionId]?.(target);
                    resetContextMenuState();
                }}
                x={contextMenuState.x}
                y={contextMenuState.y}
                currentId={contextMenuState.currentId}
                target={contextMenuState.target}
            >
                <ContextMenu id="file">
                    <IconDropDownItem
                        id="openInDefault"
                        label="Open in External Editor"
                        icon={<ArrowUpRightCircleFill />}
                    />
                    <IconDropDownItem id="copyPath" label="Copy Path" icon={<ClipboardFill />} />
                    <IconDropDownItem id="deleteFile" label="Delete File" icon={<TrashFill />} />
                </ContextMenu>
                <ContextMenu id="editorTab">
                    <IconDropDownItem
                        id="externalEditor"
                        label="Open in External Editor"
                        icon={<ArrowUpRightCircleFill />}
                    />
                    <IconDropDownItem id="save" label="Save" icon={<Save2Fill />} />
                    <IconDropDownItem id="separator" />
                    <IconDropDownItem id="close" label="Close" icon={<XCircleFill />} />
                    <IconDropDownItem id="closeLeft" label="Close Left" icon={<ArrowLeft />} />
                    <IconDropDownItem id="closeRight" label="Close Right" icon={<ArrowRight />} />
                    <IconDropDownItem
                        id="closeOtherTabs"
                        label="Close Other Tabs"
                        icon={<ArrowLeftRight />}
                    />
                    <IconDropDownItem
                        id="closeAllUnchanged"
                        label="Close All Unchanged"
                        icon={<Asterisk />}
                    />
                </ContextMenu>
            </ContextMenuRoot>
            <Container onClick={resetContextMenuState} fluid className="vh-100 flex-column d-flex">
                <Row className="py-0">
                    <MainWindowMenuBar
                        onItemClicked={(actionId: string) => actionRegistry[actionId]?.()}
                        keyboardShortcuts={keyboardShortcuts}
                    />
                </Row>
                <Row className="flex-grow-1 border-top lt-border overflow-hidden">
                    <Col className="d-flex flex-column border-end lt-border">
                        <ProjectView
                            fileTree={fileTree}
                            header={project!.name}
                            headerPath={`${project!.path}${sep}subtitle.png`}
                            onFileOpen={(file) => openFile(file)}
                            onFileContextMenu={(file, position) =>
                                setContextMenuState({
                                    currentId: "file",
                                    target: file,
                                    x: position[0],
                                    y: position[1]
                                })
                            }
                        />
                    </Col>
                    <Col className="p-0 h-100 d-flex flex-column" xs={8}>
                        <EditorFrame
                            onSelectFile={(file) => setSelectedFile(file)}
                            onCloseFile={(file) => closeFile(file)}
                            onFileChanged={(file) => {
                                file.changed = true;
                                setOpenFiles([...openFiles]);
                            }}
                            onFileContextMenu={(index, position) =>
                                setContextMenuState({
                                    currentId: "editorTab",
                                    target: index,
                                    x: position[0],
                                    y: position[1]
                                })
                            }
                            selectedFile={selectedFile}
                            openFiles={openFiles}
                            schemaStore={schemaStore}
                        />
                    </Col>
                </Row>
            </Container>
        </>
    );
}

export default MainWindow;
