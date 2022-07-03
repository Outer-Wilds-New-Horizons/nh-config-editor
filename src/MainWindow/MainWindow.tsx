import {process} from "@tauri-apps/api";
import {message} from "@tauri-apps/api/dialog";
import {sep} from "@tauri-apps/api/path";
import {invoke} from "@tauri-apps/api/tauri";
import {getCurrent, WebviewWindow} from "@tauri-apps/api/window";

import {MutableRefObject, useRef, useState} from "react";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import CenteredSpinner from "../Common/CenteredSpinner";
import {Project} from "../Common/Project";
import {MenuBar, setupAllEvents} from "./Actions";

import "./main_window.css";
import EditorFrame from "./Panels/Editor/EditorFrame";
import {ProjectFile, ProjectFileType} from "./Panels/ProjectView/ProjectFile";
import ProjectView from "./Panels/ProjectView/ProjectView";

export type PathToFile = { [key: string]: ProjectFile };

export type CommonProps = {
    project: Project,
    openFiles: ProjectFile[],
    setOpenFiles: CallableFunction,
    selectedFile: ProjectFile | null,
    setSelectedFile: CallableFunction,
    currentlyRegisteredFiles: PathToFile,
    setCurrentlyRegisteredFiles: CallableFunction,
    invalidateFileSystem: MutableRefObject<CallableFunction>
}

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

    if (project === null) {
        process.exit(1);
        return <CenteredSpinner/>;
    }

    const commonProps: CommonProps = {
        openFiles,
        setOpenFiles,
        selectedFile,
        setSelectedFile,
        currentlyRegisteredFiles,
        setCurrentlyRegisteredFiles,
        project: project!,
        invalidateFileSystem
    };

    const createNewFile = (fileType: ProjectFileType) => {

        let currentNumber = 1;

        while (openFiles.filter(file => file.name === `new_${fileType}_${currentNumber}.json`).length > 0) currentNumber++;

        ProjectFile.createNew(commonProps, `new_${fileType}_${currentNumber}.json`, fileType);

    };

    actionRegistry["new_planet"].callback = () => createNewFile("planet");
    actionRegistry["new_system"].callback = () => createNewFile("system");
    actionRegistry["new_translation"].callback = () => createNewFile("translation");

    const findOrMakeAddonManifest = async () => {
        const filePath = `${project!.path}${sep}addon-manifest.json`;
        if (!(await invoke("file_exists", {path: filePath}))) {
            const newFile = new ProjectFile(false, [], "addon-manifest.json", filePath, "addon_manifest");
            newFile.data = {};
            await newFile.save(commonProps);
            invalidateFileSystem.current();
        }
    };

    actionRegistry["make_manifest"].callback = () => {
        findOrMakeAddonManifest().then(() => {
            currentlyRegisteredFiles[`${project!.path}${sep}addon-manifest.json`].open(commonProps);
        });
    };

    actionRegistry["save"].callback = () => {
        console.log("Save Clicked");
        selectedFile?.save(commonProps);
    };

    actionRegistry["save_all"].callback = () => {
        for (const file of openFiles) {
            file.save(commonProps);
        }
    };

    actionRegistry["close_all"].callback = () => {
        for (const file of openFiles) {
            file.close(commonProps);
        }
    };

    actionRegistry["reload"].callback = () => {
        invalidateFileSystem.current();
    };

    actionRegistry["close_project"].callback = () => {

        console.log("Close Project Clicked");

        const webview = new WebviewWindow("welcome", {
            url: `index.html#START`,
            title: `Welcome`,
            center: true,
            minWidth: 840,
            width: 840,
            height: 600,
            minHeight: 600,
            resizable: true,
            maximized: true
        });

        webview.once("tauri://created", () => {
            getCurrent().close();
        });

    };

    actionRegistry["open_explorer"].callback = () => {
        invoke("show_in_explorer", {path: project!.path});
    };

    actionRegistry["build"].callback = () => {
        invoke("zip_project", {path: project!.path, outputZipName: `${project!.uniqueName}.zip`}).then(() => {
            invalidateFileSystem.current();
            invoke("show_in_explorer", {path: `${project!.path}\\build`});
        });
    };

    actionRegistry["quit"].callback = () => process.exit(0);


    return (
        <Container fluid className="vh-100 flex-column d-flex">
            <Row className="py-0">
                <MenuBar/>
            </Row>
            <Row className="flex-grow-1 border-top overflow-hidden">
                <Col className="d-flex flex-column border-end">
                    <ProjectView {...commonProps}/>
                </Col>
                <Col className="p-0 h-100 d-flex flex-column" xs={8}>
                    <EditorFrame {...commonProps}/>
                </Col>
            </Row>
        </Container>
    );
}

export default MainWindow;
