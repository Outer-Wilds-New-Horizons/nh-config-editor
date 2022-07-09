import { clipboard, process } from "@tauri-apps/api";
import { ask, message } from "@tauri-apps/api/dialog";
import { sep } from "@tauri-apps/api/path";
import { exit } from "@tauri-apps/api/process";
import { invoke } from "@tauri-apps/api/tauri";
import { getCurrent, WebviewWindow } from "@tauri-apps/api/window";

import { MutableRefObject, useRef, useState } from "react";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import { openAboutWindow } from "../AboutWindow/AboutWindow";
import ContextMenu, { OpenMenu, ContextActionRegistry } from "../Common/ContextMenu";
import { Project } from "../Common/Project";
import CenteredSpinner from "../Common/Spinner/CenteredSpinner";
import { openSettingsWindow } from "../SettingsWindow/SettingsWindow";
import { useSettings } from "../Wrapper";

import "./main_window.css";
import { setupAllEvents } from "./MenuBar/Actions";
import MenuBar from "./MenuBar/MenuBar";
import EditorFrame from "./Panels/Editor/EditorFrame";
import { ProjectFile, ProjectFileType } from "./Panels/ProjectView/ProjectFile";
import ProjectView from "./Panels/ProjectView/ProjectView";

export type PathToFile = { [key: string]: ProjectFile };

export type CommonProps = {
    project: Project;
    openFiles: ProjectFile[];
    setOpenFiles: CallableFunction;
    selectedFile: ProjectFile | null;
    setSelectedFile: CallableFunction;
    currentlyRegisteredFiles: PathToFile;
    setCurrentlyRegisteredFiles: CallableFunction;
    invalidateFileSystem: MutableRefObject<CallableFunction>;
    openContextMenu: OpenMenu;
};

const actionRegistry = await setupAllEvents();

const projectPath = new URLSearchParams(window.location.search).get("path");
let project: Project | null = null;

if (projectPath === null) {
    message("No project path specified", {
        type: "error",
        title: "Error"
    });
} else {
    const newProject = await Project.load(decodeURIComponent(projectPath));
    if (newProject === null) {
        message("Project could not be loaded", {
            type: "error",
            title: "Error"
        });
    } else {
        project = newProject;
    }
}

function MainWindow() {
    // noinspection JSUnusedLocalSymbols
    const [openFiles, setOpenFiles] = useState<ProjectFile[]>([]);
    const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null);
    const [currentlyRegisteredFiles, setCurrentlyRegisteredFiles] = useState<PathToFile>({});
    const invalidateFileSystem = useRef(() => {
        return;
    });
    const openContextMenu = useRef(() => {
        return;
    });
    const closeContextMenu = useRef(() => {
        return;
    });

    const settings = useSettings();

    if (project === null) {
        process.exit(1);
        return <CenteredSpinner />;
    }

    const filesHaveChanged = () =>
        openFiles.length > 0 && openFiles.filter((file) => file.changed).length > 0;

    const commonProps: CommonProps = {
        openFiles,
        setOpenFiles,
        selectedFile,
        setSelectedFile,
        currentlyRegisteredFiles,
        setCurrentlyRegisteredFiles,
        project: project,
        invalidateFileSystem,
        openContextMenu
    };

    const createNewFile = (fileType: ProjectFileType, ext: string) => {
        let currentNumber = 1;

        while (
            openFiles.filter((file) => file.name === `new_${fileType}_${currentNumber}.json`)
                .length > 0
        )
            currentNumber++;

        ProjectFile.createNew(commonProps, `new_${fileType}_${currentNumber}.json`, fileType, ext);
    };

    actionRegistry["new_planet"].callback = () => createNewFile("planet", "json");
    actionRegistry["new_system"].callback = () => createNewFile("system", "json");
    actionRegistry["new_translation"].callback = () => createNewFile("translation", "json");

    const findOrMakeAddonManifest = async () => {
        const filePath = `${project!.path}${sep}addon-manifest.json`;
        if (!(await invoke("file_exists", { path: filePath }))) {
            const newFile = new ProjectFile(
                false,
                [],
                "json",
                "addon-manifest.json",
                filePath,
                "addon_manifest"
            );
            newFile.data = {};
            await newFile.save(commonProps);
            invalidateFileSystem.current();
        }
    };

    actionRegistry["make_manifest"].callback = () => {
        findOrMakeAddonManifest();
    };

    actionRegistry["save"].callback = () => {
        selectedFile?.save(commonProps);
    };

    actionRegistry["save_all"].callback = () => {
        for (const file of openFiles) {
            file.save(commonProps);
        }
    };

    actionRegistry["close_all"].callback = () => {
        if (!filesHaveChanged()) {
            for (const file of openFiles) {
                file.data = null;
            }
            setOpenFiles([]);
            setSelectedFile(null);
        } else {
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
        }
    };

    actionRegistry["reload"].callback = () => {
        invalidateFileSystem.current();
    };

    actionRegistry["close_project"].callback = async () => {
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
            getCurrent().close();
        });
    };

    actionRegistry["open_explorer"].callback = () => {
        invoke("show_in_explorer", { path: project!.path });
    };

    const buildProject = async () => {
        console.log(`Minify: ${settings.minify}`);

        for (const file of openFiles) {
            await file.save(commonProps);
        }
        await invoke("zip_project", {
            path: project!.path,
            outputZipName: `${project!.uniqueName}.zip`,
            minify: settings.minify
        });
        invalidateFileSystem.current();
        await invoke("show_in_explorer", { path: `${project!.path}${sep}build` });
    };

    actionRegistry["build"].callback = () => {
        buildProject();
    };

    actionRegistry["settings"].callback = openSettingsWindow;

    actionRegistry["help"].callback = () => message("No", { title: "" });

    actionRegistry["about"].callback = openAboutWindow;

    actionRegistry["soft_reset"].callback = () => {
        if (filesHaveChanged()) {
            ask("There are unsaved changes. Are you sure you want to reload?", {
                type: "warning",
                title: "Reload"
            }).then((result) => {
                if (result) {
                    window.location.reload();
                }
            });
        } else {
            window.location.reload();
        }
    };

    actionRegistry["quit"].callback = () => {
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

    ContextActionRegistry["open_in_default"] = (file: unknown) => {
        if (file instanceof ProjectFile) {
            invoke("show_in_explorer", { path: file.path });
        }
    };

    ContextActionRegistry["copy_path"] = (file: unknown) => {
        if (file instanceof ProjectFile) {
            clipboard.writeText(file.path);
        }
    };

    ContextActionRegistry["delete_file"] = (file: unknown) => {
        if (file instanceof ProjectFile) {
            ask(`Are you sure you want to delete this ${file.isFolder ? "folder" : "file"}?`, {
                type: "warning",
                title: file.name
            }).then((result) => {
                if (result) {
                    file.delete(commonProps);
                }
            });
        }
    };

    const trySelectFirst = (newOpen: ProjectFile[]) => {
        if (!newOpen.includes(selectedFile as ProjectFile)) {
            if (newOpen.length > 0) {
                setSelectedFile(newOpen[0]);
            } else {
                setSelectedFile(null);
            }
        }
    };

    ContextActionRegistry["close_right"] = (index: unknown) => {
        const newOpen = openFiles.filter((o, i) => o.changed || i <= (index as number));
        setOpenFiles(newOpen);
        trySelectFirst(newOpen);
    };

    ContextActionRegistry["close_left"] = (index: unknown) => {
        const newOpen = openFiles.filter((o, i) => o.changed || i >= (index as number));
        setOpenFiles(newOpen);
        trySelectFirst(newOpen);
    };

    ContextActionRegistry["close_other_tabs"] = (index: unknown) => {
        const newOpen = openFiles.filter((o, i) => o.changed || i === index);
        setOpenFiles(newOpen);
        trySelectFirst(newOpen);
    };

    return (
        <>
            <ContextMenu openMenu={openContextMenu} closeMenu={closeContextMenu} />
            <Container
                onClick={() => closeContextMenu.current()}
                fluid
                className="vh-100 flex-column d-flex"
            >
                <Row className="py-0">
                    <MenuBar />
                </Row>
                <Row className="flex-grow-1 border-top lt-border overflow-hidden">
                    <Col className="d-flex flex-column border-end lt-border">
                        <ProjectView {...commonProps} />
                    </Col>
                    <Col className="p-0 h-100 d-flex flex-column" xs={8}>
                        <EditorFrame {...commonProps} />
                    </Col>
                </Row>
            </Container>
        </>
    );
}

export default MainWindow;
